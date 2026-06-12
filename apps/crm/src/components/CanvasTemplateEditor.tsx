"use client";

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from "react";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Type, Image as ImageIcon, Download, Save, Trash2, Move, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { toast } from "sonner";

interface CanvasTemplateEditorProps {
  initialImage?: string;
  initialJsonData?: any;
  onSaveTemplate?: (data: { jsonData: any; previewImage: string }) => void;
  width?: number; // Target max width
  height?: number;
  businessName?: string;
}

export interface CanvasTemplateEditorRef {
  applyDesign: () => { jsonData: any; previewImage: string | null } | null;
}

// Convert a single URL to a data URL (avoids CORS taint on canvas)
async function urlToDataUrl(src: string): Promise<string> {
  if (!src || src.startsWith('data:')) return src;
  // Build absolute URL
  const absUrl = src.startsWith('http')
    ? (() => { try { const u = new URL(src); return `${window.location.origin}${u.pathname}`; } catch { return src; } })()
    : src.startsWith('/')
      ? `${window.location.origin}${src}`
      : src;

  const tryFetch = async (targetUrl: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout to prevent hanging

    try {
      const res = await fetch(targetUrl, { mode: 'cors', signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  };

  try {
    return await tryFetch(absUrl);
  } catch (err) {
    // If we failed on localhost, try the local proxy to read from admin's public directory
    if (absUrl.includes('localhost')) {
      try {
        const proxyUrl = `/api/local-image?url=${encodeURIComponent(absUrl)}`;
        return await tryFetch(proxyUrl);
      } catch {
        // Fall through
      }
    }
    // Fall back to origin-normalised URL — canvas may be tainted but still renders
    return absUrl;
  }
}

// Pre-load all images in a Fabric JSON as data URLs so canvas is never CORS-tainted
async function preloadJsonImages(json: any): Promise<any> {
  if (!json) return json;
  const copy = JSON.parse(JSON.stringify(json));

  // Convert object images
  if (Array.isArray(copy.objects)) {
    copy.objects = await Promise.all(copy.objects.map(async (o: any) => {
      if (o.type === 'image' && o.src) {
        o._originalSrc = o.src;                // keep original for compact JSON save
        o.src = await urlToDataUrl(o.src);
        delete o.crossOrigin;                  // not needed for data URLs
      }
      return o;
    }));
  }

  // Extract background image so addBg can load it as data URL instead of loadFromJSON
  if (copy.backgroundImage?.src) {
    copy._originalBgSrc  = copy.backgroundImage.src;  // original URL for compact JSON
    copy._extractedBgSrc = await urlToDataUrl(copy.backgroundImage.src);
    delete copy.backgroundImage;
  }

  return copy;
}

const CanvasTemplateEditor = forwardRef<CanvasTemplateEditorRef, CanvasTemplateEditorProps>(({
  initialImage, initialJsonData, onSaveTemplate, width = 680, height = 500, businessName
}, ref) => {
  const [fab, setFab] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [sel, setSel] = useState<any>(null);
  const [cssScale, setCssScale] = useState(1);
  const [canvasDims, setCanvasDims] = useState({ w: width, h: height });

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fill, setFill] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState("normal");
  const [textAlign, setTextAlign] = useState("center");

  const mountRef = useRef<HTMLDivElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const fcRef    = useRef<any>(null);
  // Track the original (server) URL of the background image so we can
  // restore it in toJSON() after converting to data URL for rendering
  const bgOriginalUrlRef = useRef<string>('');

  // Safely parse initialJsonData if it is a string
  const parsedJsonData = useMemo(() => {
    if (!initialJsonData) return null;
    if (typeof initialJsonData === 'string') {
      try {
        return JSON.parse(initialJsonData);
      } catch (e) {
        console.error("Failed to parse initialJsonData string:", e);
        return null;
      }
    }
    return initialJsonData;
  }, [initialJsonData]);

  // ── Load Fabric ────────────────────────────────────────────────────────────
  useEffect(() => {
    import("fabric").then(m => setFab((m as any).fabric || (m as any).default || m))
      .catch(() => toast.error("Could not load design editor."));
  }, []);

  // ── Sync sidebar text controls ─────────────────────────────────────────────
  const syncControls = useCallback((obj: any) => {
    if (!obj || obj.type !== "textbox") return;
    setText(obj.text ?? "");
    setFontSize(obj.fontSize ?? 24);
    setFill(obj.fill ?? "#000000");
    setFontFamily(obj.fontFamily ?? "Arial");
    setFontWeight(obj.fontWeight ?? "normal");
    setTextAlign(obj.textAlign ?? "center");
  }, []);

  // ── CSS scale (no Fabric zoom — keeps pointer events correct) ─────────────
  const reScale = useCallback(() => {
    const w = wrapRef.current;
    if (!w) return;
    const aw = w.clientWidth - 40;
    const ah = w.clientHeight - 40;
    if (aw > 0 && ah > 0) {
      setCssScale(Math.min(aw / canvasDims.w, ah / canvasDims.h, 1));
    }
  }, [canvasDims.w, canvasDims.h]);

  useEffect(() => {
    const ro = new ResizeObserver(reScale);
    if (wrapRef.current) ro.observe(wrapRef.current);
    reScale();
    return () => ro.disconnect();
  }, [reScale]);

  // ── Build canvas ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fab || !mountRef.current) return;

    // Dispose previous instance
    if (fcRef.current) { try { fcRef.current.dispose(); } catch (_) {} fcRef.current = null; }

    const el = document.createElement("canvas");
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(el);

    const canvas = new fab.Canvas(el, { 
      width: canvasDims.w, 
      height: canvasDims.h, 
      backgroundColor: "#ffffff", 
      preserveObjectStacking: true 
    });
    fcRef.current = canvas;

    const attachEvents = () => {
      canvas.on("selection:created", (e: any) => { const o = e.selected?.[0]; setSel(o ?? null); syncControls(o); });
      canvas.on("selection:updated", (e: any) => { const o = e.selected?.[0]; setSel(o ?? null); syncControls(o); });
      canvas.on("selection:cleared", () => setSel(null));
      canvas.on("text:changed", (e: any) => { if (e.target?.type === "textbox") setText(e.target.text ?? ""); });
      canvas.on("object:modified", (e: any) => {
        // Constrain objects within canvas bounds
        const obj = e.target;
        if (!obj) return;
        obj.setCoords();
        const bound = obj.getBoundingRect();
        let modified = false;

        if (bound.left < 0) {
          obj.left = obj.left - bound.left;
          modified = true;
        }
        if (bound.top < 0) {
          obj.top = obj.top - bound.top;
          modified = true;
        }
        if (bound.left + bound.width > canvas.getWidth()) {
          obj.left = canvas.getWidth() - bound.width + (obj.left - bound.left);
          modified = true;
        }
        if (bound.top + bound.height > canvas.getHeight()) {
          obj.top = canvas.getHeight() - bound.height + (obj.top - bound.top);
          modified = true;
        }

        if (modified) {
          obj.setCoords();
          canvas.renderAll();
        }

        syncControls(obj);
      });
      canvas.renderAll();
      setIsReady(true);
      setTimeout(reScale, 80);
    };

    // Helper: fetch image as data URL to avoid CORS taint, then set as canvas background
    const addBg = (src: string, done: () => void) => {
      const absUrl = (src.startsWith("data:") || src.startsWith("http"))
        ? src
        : `${window.location.origin}${src.startsWith("/") ? "" : "/"}${src}`;

      // Always store the canonical (non-data) URL for JSON serialisation
      if (!src.startsWith("data:")) {
        bgOriginalUrlRef.current = absUrl;
      }

      // Convert image to a data URL so canvas is never CORS-tainted
      const loadAsDataUrl = async (url: string): Promise<string> => {
        if (url.startsWith("data:")) return url;

        const tryFetch = async (targetUrl: string) => {
          const r = await fetch(targetUrl, { mode: "cors" });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const blob = await r.blob();
          return new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
          });
        };

        try {
          return await tryFetch(url);
        } catch (err) {
          // If we failed on localhost, try the local proxy to read from admin's public directory
          if (url.includes('localhost')) {
            try {
              const proxyUrl = `/api/local-image?url=${encodeURIComponent(url)}`;
              return await tryFetch(proxyUrl);
            } catch {
              // Fall through
            }
          }
          throw err;
        }
      };

      const applyDataUrl = (dataUrl: string) => {
        const img = new window.Image();
        img.onload = () => {
          const iw = img.naturalWidth || 1;
          const ih = img.naturalHeight || 1;

          let cw = width;
          let ch = (ih / iw) * width;
          if (iw < width) { cw = iw; ch = ih; }

          setCanvasDims({ w: cw, h: ch });
          canvas.setWidth(cw);
          canvas.setHeight(ch);

          fab.Image.fromURL(dataUrl, (fImg: any) => {
            if (fImg) {
              const scaleX = cw / fImg.width;
              const scaleY = ch / fImg.height;
              canvas.setBackgroundImage(fImg, canvas.renderAll.bind(canvas), {
                scaleX, scaleY, originX: "left", originY: "top",
              });
            }
            done();
          });
        };
        img.onerror = () => { console.warn("Bg image failed:", dataUrl.slice(0, 60)); done(); };
        img.src = dataUrl;
      };

      loadAsDataUrl(absUrl)
        .then(applyDataUrl)
        .catch(() => {
          // CORS fetch failed — fall back to direct URL (canvas may be tainted but still renders)
          console.warn("Could not fetch image as data URL, falling back:", absUrl);
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const iw = img.naturalWidth || 1;
            const ih = img.naturalHeight || 1;
            let cw = width;
            let ch = (ih / iw) * width;
            if (iw < width) { cw = iw; ch = ih; }
            setCanvasDims({ w: cw, h: ch });
            canvas.setWidth(cw);
            canvas.setHeight(ch);
            fab.Image.fromURL(absUrl, (fImg: any) => {
              if (fImg) {
                canvas.setBackgroundImage(fImg, canvas.renderAll.bind(canvas), {
                  scaleX: cw / fImg.width, scaleY: ch / fImg.height,
                  originX: "left", originY: "top", crossOrigin: "anonymous",
                });
              }
              done();
            }, { crossOrigin: "anonymous" });
          };
          img.onerror = () => { console.warn("Bg image failed:", absUrl); done(); };
          img.src = absUrl;
        });
    };

    const addDefaultText = () => {
      const mkText = (t: string, top: number, size: number, bold: boolean) =>
        new fab.Textbox(t, {
          left: canvas.getWidth() / 2, top, fontSize: size, fill: "#222222",
          width: Math.min(500, canvas.getWidth() - 40), textAlign: "center", fontFamily: "Arial",
          fontWeight: bold ? "bold" : "normal", originX: "center", originY: "center",
          selectable: true, editable: true,
        });
      canvas.add(mkText("Your Title Here", canvas.getHeight() * 0.2, 44, true));
      canvas.add(mkText("Add your message here", canvas.getHeight() * 0.4, 22, false));
    };

    // Check if there is saved JSON data to restore
    const hasSavedJson = !!(parsedJsonData && (Array.isArray(parsedJsonData.objects) || parsedJsonData.backgroundImage || parsedJsonData.background));

    // ── Restore from saved JSON (async — guard with cancelled flag) ─────────
    if (hasSavedJson) {
      let cancelled = false;

      preloadJsonImages(parsedJsonData)
        .then(processed => {
          if (cancelled) return;

          // Extract bg data URL and original URL
          const bgDataUrl: string | undefined    = processed._extractedBgSrc || undefined;
          const bgOriginalUrl: string | undefined = processed._originalBgSrc  || undefined;
          delete processed._extractedBgSrc;
          delete processed._originalBgSrc;

          // Set the ref so getDesignData can swap the huge data URL back to the short URL
          if (bgOriginalUrl) bgOriginalUrlRef.current = bgOriginalUrl;

          try {
            canvas.loadFromJSON(processed, () => {
              if (cancelled) return;
              // addBg handles dimensions + background (uses data URL for CORS safety)
              const bgToLoad = bgDataUrl || bgOriginalUrl || initialImage;
              if (bgToLoad) {
                addBg(bgToLoad, attachEvents);
              } else {
                attachEvents();
              }
            });
          } catch (err) {
            if (cancelled) return;
            console.error('loadFromJSON failed:', err);
            const bgToLoad = bgDataUrl || bgOriginalUrl || initialImage;
            if (bgToLoad) addBg(bgToLoad, () => { addDefaultText(); attachEvents(); });
            else { addDefaultText(); attachEvents(); }
          }
        })
        .catch(err => {
          if (cancelled) return;
          console.error('preloadJsonImages failed:', err);
          if (initialImage) addBg(initialImage, () => { addDefaultText(); attachEvents(); });
          else { addDefaultText(); attachEvents(); }
        });

      return () => {
        cancelled = true;
        if (fcRef.current) { try { fcRef.current.dispose(); } catch (_) {} fcRef.current = null; }
        setIsReady(false); setSel(null);
      };
    }

    // ── Fresh canvas ───────────────────────────────────────────────────────
    if (initialImage) {
      addBg(initialImage, () => { addDefaultText(); attachEvents(); });
    } else {
      addDefaultText();
      attachEvents();
    }

    return () => {
      if (fcRef.current) { try { fcRef.current.dispose(); } catch (_) {} fcRef.current = null; }
      setIsReady(false);
      setSel(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fab]);

  // ── Canvas actions ─────────────────────────────────────────────────────────
  const saveState = () => {
    if (fcRef.current) fcRef.current.renderAll();
  };

  const addText = () => {
    if (!fcRef.current || !fab) return;
    const c = fcRef.current;
    const o = new fab.Textbox("New Text", {
      left: c.getWidth() / 2, top: c.getHeight() / 2, fontSize: 30, fill: "#000000",
      width: 200, textAlign: "center", fontFamily: "Arial",
      originX: "center", originY: "center", selectable: true, editable: true,
    });
    c.add(o); c.setActiveObject(o); c.renderAll();
    setSel(o); syncControls(o);
  };

  const addWatermark = () => {
    const c = fcRef.current;
    if (!c || !fab) return;
    
    const existing = c.getObjects().find((o: any) => o.name === 'watermark');
    if (existing) {
      toast.info("Watermark already exists!");
      c.setActiveObject(existing);
      c.renderAll();
      return;
    }

    const name = businessName ? businessName.replace(/\s+/g, '') : 'BusinessName';
    const text = `Glowvitasalon.com/${name}`;
    
    const watermark = new fab.Textbox(text, {
      left: c.getWidth() / 2,
      top: c.getHeight() - 40,
      fontSize: 18,
      fill: "#ffffff",
      textAlign: "center",
      fontFamily: "Arial",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
      selectable: true,
      editable: true,
      name: 'watermark'
    });
    
    watermark.set('shadow', new fab.Shadow({
      color: 'rgba(0,0,0,0.6)',
      blur: 4,
      offsetX: 1,
      offsetY: 1
    }));
    
    c.add(watermark);
    c.setActiveObject(watermark);
    c.renderAll();
  };

  const uploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fcRef.current || !fab) return;
    const r = new FileReader();
    r.onload = ev => {
      fab.Image.fromURL(ev.target!.result as string, (img: any) => {
        if (img.width > 150 || img.height > 150)
          img.scale(Math.min(150 / img.width, 150 / img.height));
        img.set({ left: 60, top: 60, selectable: true });
        fcRef.current.add(img); fcRef.current.setActiveObject(img); fcRef.current.renderAll();
        setSel(img);
      });
    };
    r.readAsDataURL(file);
    e.target.value = "";
  };

  const setProp = (prop: string, val: any) => {
    const c = fcRef.current; const o = c?.getActiveObject();
    if (o && c) { o.set(prop, val); c.renderAll(); }
  };

  const removeSelected = () => {
    const c = fcRef.current; const o = c?.getActiveObject();
    if (o && c) { c.remove(o); c.discardActiveObject(); c.renderAll(); setSel(null); }
  };

  const getDesignData = useCallback(() => {
    const c = fcRef.current;
    if (!c) return null;

    // Step 1: deselect & render (guard individually)
    try { c.discardActiveObject(); } catch (_) {}
    try { c.renderAll(); } catch (_) {}

    // Step 2: serialize canvas state manually (object-by-object)
    let jsonData: any = null;
    try {
      const EXTRA_PROPS = ["name","selectable","evented","lockMovementX","lockMovementY","hoverCursor","_originalSrc"];

      // 1. Serialize each object individually
      const objects: any[] = [];
      for (const obj of (c.getObjects() as any[])) {
        try {
          const serialized = obj.toObject(EXTRA_PROPS);
          // Swap data URL back to original server URL (keeps DB document small)
          if (serialized.type === 'image' && serialized.src?.startsWith('data:') && serialized._originalSrc) {
            serialized.src = serialized._originalSrc;
          }
          delete serialized._originalSrc;
          objects.push(serialized);
        } catch (objErr: any) {
          console.warn(`Skipping unserializable object (${obj.type}):`, objErr?.message);
        }
      }

      // 2. Serialize background image separately
      let backgroundImage: any = null;
      if (c.backgroundImage) {
        try {
          backgroundImage = (c.backgroundImage as any).toObject(EXTRA_PROPS);
          // Swap data URL → original server URL
          if (backgroundImage?.src?.startsWith('data:') && bgOriginalUrlRef.current) {
            backgroundImage.src = bgOriginalUrlRef.current;
          }
        } catch (bgErr: any) {
          console.warn('Skipping unserializable backgroundImage:', bgErr?.message);
          // Fall back to just storing the original URL reference
          if (bgOriginalUrlRef.current) {
            backgroundImage = { type: 'image', src: bgOriginalUrlRef.current, version: '5.3.0' };
          }
        }
      }

      jsonData = {
        version: (c as any).version ?? '5.3.0',
        objects,
        background: c.backgroundColor ?? '#ffffff',
        ...(backgroundImage ? { backgroundImage } : {}),
      };
    } catch (e: any) {
      console.error("Manual canvas serialization failed:", e);
    }

    if (!jsonData) return null;

    // Step 3: generate preview thumbnail (may fail on CORS-tainted canvas — that is fine)
    let previewImage: string | null = null;
    try {
      let multiplier = 1;
      if (c.width && c.width > 800) multiplier = 800 / c.width;
      previewImage = c.toDataURL({ format: "jpeg", quality: 0.85, multiplier });
    } catch (e) {
      console.warn("toDataURL failed:", e);
    }

    return { jsonData, previewImage };
  }, []);

  useImperativeHandle(ref, () => ({
    applyDesign: () => {
      try { return getDesignData(); } catch (e) { console.error("applyDesign:", e); return null; }
    }
  }));

  const applyDesignBtn = () => {
    const c = fcRef.current;
    if (!c) { toast.error("Canvas is not ready yet. Please wait."); return; }
    if (typeof c.toJSON !== 'function') {
      alert('Canvas object is invalid — please close and reopen the editor.');
      return;
    }

    const data = getDesignData();
    if (data && data.jsonData) {
      onSaveTemplate?.({ jsonData: data.jsonData, previewImage: data.previewImage ?? '' });
      toast.success("Design applied! You can now save the template.");
    } else {
      toast.error("Could not capture canvas state. Please close and reopen the editor.");
    }
  };

  const download = () => {
    const c = fcRef.current; if (!c) return;
    c.discardActiveObject(); c.renderAll();
    const url = c.toDataURL({ format: "jpeg", quality: 0.9, multiplier: 2 });
    const a = document.createElement("a");
    a.href = url; a.download = "template.jpg";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success("Downloaded!");
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const sidebarBtn = (active = false, danger = false): React.CSSProperties => ({
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "8px 12px", borderRadius: 8, border: danger ? "none" : "1px solid var(--border)",
    background: danger ? "rgba(239,68,68,0.12)" : active ? "var(--primary)" : "var(--background)",
    color: danger ? "#ef4444" : active ? "var(--primary-foreground)" : "var(--foreground)",
    fontSize: 13, fontWeight: 500, cursor: "pointer", width: "100%", transition: "background 0.15s",
  });

  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "7px 10px", fontSize: 13, borderRadius: 6,
    border: "1px solid var(--input)", background: "var(--background)", color: "var(--foreground)",
  };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 500, overflow: "hidden", background: "var(--background)" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 236, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--muted)", overflowY: "auto" }}>

        {/* Add Elements */}
        <div style={{ padding: "14px 12px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: 10 }}>Add Elements</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={addText} disabled={!isReady} style={{ ...sidebarBtn(), opacity: isReady ? 1 : 0.4, cursor: isReady ? "pointer" : "not-allowed", justifyContent: "flex-start" }}>
              <Type style={{ width: 15, height: 15, color: "var(--primary)", flexShrink: 0 }} /> Add Text Block
            </button>
            <button onClick={addWatermark} disabled={!isReady} style={{ ...sidebarBtn(), opacity: isReady ? 1 : 0.4, cursor: isReady ? "pointer" : "not-allowed", justifyContent: "flex-start" }}>
              <Type style={{ width: 15, height: 15, color: "var(--primary)", flexShrink: 0 }} /> Add Watermark
            </button>
            <label style={{ ...sidebarBtn(), opacity: isReady ? 1 : 0.4, cursor: isReady ? "pointer" : "not-allowed", justifyContent: "flex-start" }}>
              <ImageIcon style={{ width: 15, height: 15, color: "var(--primary)", flexShrink: 0 }} /> Upload Image / Logo
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={uploadLogo} disabled={!isReady} />
            </label>
          </div>
        </div>

        {/* Edit Selected */}
        <div style={{ padding: "14px 12px", borderBottom: "1px solid var(--border)", flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: 10 }}>Edit Selected</p>

          {!sel ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", textAlign: "center", color: "var(--muted-foreground)" }}>
              <Move style={{ width: 26, height: 26, opacity: 0.35, marginBottom: 8 }} />
              <p style={{ fontSize: 12 }}>Click an element on the canvas to edit it</p>
            </div>
          ) : sel.type === "textbox" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Content</label>
                <Textarea value={text} onChange={e => { setText(e.target.value); setProp("text", e.target.value); }} rows={3} style={{ fontSize: 13, resize: "none" }} placeholder="Enter text…" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Font Family</label>
                <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); setProp("fontFamily", e.target.value); }} style={selectStyle}>
                  {["Arial","Times New Roman","Helvetica","Georgia","Verdana","Impact","Courier New","Trebuchet MS"].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Size</label>
                  <Input type="number" value={fontSize} min={8} max={300} style={{ fontSize: 13 }}
                    onChange={e => { const v = parseInt(e.target.value) || 12; setFontSize(v); setProp("fontSize", v); }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Color</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid var(--input)", borderRadius: 6, padding: "4px 8px", background: "var(--background)" }}>
                    <input type="color" value={fill} onChange={e => { setFill(e.target.value); setProp("fill", e.target.value); }}
                      style={{ width: 22, height: 22, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted-foreground)" }}>{fill}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Weight</label>
                  <select value={fontWeight} onChange={e => { setFontWeight(e.target.value); setProp("fontWeight", e.target.value); }} style={selectStyle}>
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Align</label>
                  <div style={{ display: "flex", border: "1px solid var(--input)", borderRadius: 6, padding: 3, background: "var(--background)", gap: 2 }}>
                    {(["left","center","right"] as const).map(a => (
                      <button key={a} onClick={() => { setTextAlign(a); setProp("textAlign", a); }}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 4, borderRadius: 4, border: "none",
                          background: textAlign === a ? "var(--primary)" : "transparent",
                          color: textAlign === a ? "var(--primary-foreground)" : "var(--foreground)", cursor: "pointer" }}>
                        {a === "left" ? <AlignLeft style={{ width: 12, height: 12 }} /> : a === "center" ? <AlignCenter style={{ width: 12, height: 12 }} /> : <AlignRight style={{ width: 12, height: 12 }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={removeSelected} style={sidebarBtn(false, true)}>
                <Trash2 style={{ width: 14, height: 14 }} /> Remove Element
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "18px 0" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImageIcon style={{ width: 26, height: 26, color: "var(--muted-foreground)" }} />
              </div>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", textAlign: "center" }}>Image selected</p>
              <button onClick={removeSelected} style={sidebarBtn(false, true)}>
                <Trash2 style={{ width: 14, height: 14 }} /> Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={applyDesignBtn} disabled={!isReady}
            style={{ ...sidebarBtn(true), background: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 600, opacity: isReady ? 1 : 0.4, cursor: isReady ? "pointer" : "not-allowed", padding: "10px 12px" }}>
            <Save style={{ width: 15, height: 15 }} /> Apply Design
          </button>
          <button onClick={download} disabled={!isReady}
            style={{ ...sidebarBtn(), opacity: isReady ? 1 : 0.4, cursor: isReady ? "pointer" : "not-allowed" }}>
            <Download style={{ width: 15, height: 15 }} /> Download Preview
          </button>
        </div>
      </div>

      {/* ── Canvas area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#f0f0f0" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid var(--border)", background: "var(--background)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: isReady ? "#22c55e" : "#f59e0b", display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500 }}>
              Template Canvas · {Math.round(canvasDims.w)} × {Math.round(canvasDims.h)}{!isReady ? " · Loading…" : ""}
            </span>
          </div>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Click elements to select &amp; edit</span>
        </div>

        {/* Scroll + center wrapper — CSS scale keeps Fabric event coords correct */}
        <div ref={wrapRef} style={{ flex: 1, overflow: "auto", display: "flex", padding: 16, minHeight: 420 }}>
          <div style={{
            margin: "auto", // Safely centers without top-cutoff bug
            width: canvasDims.w * cssScale, height: canvasDims.h * cssScale,
            position: "relative", flexShrink: 0,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)", borderRadius: 0, overflow: "hidden", // Canva-like sharp edges
          }}>
            <div ref={mountRef} style={{
              width: canvasDims.w, height: canvasDims.h, background: "#fff",
              transform: `scale(${cssScale})`, transformOrigin: "top left",
              position: "absolute", top: 0, left: 0,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default CanvasTemplateEditor;
