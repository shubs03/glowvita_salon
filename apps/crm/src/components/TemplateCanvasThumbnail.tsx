"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

interface TemplateCanvasThumbnailProps {
  imageUrl?: string;
  jsonData?: any;
  alt?: string;
}

/**
 * Resolves the best available preview image URL for a template card.
 *
 * Priority:
 *  1. `imageUrl` from the DB  — normalized so the CRM can load it.
 *  2. `jsonData.backgroundImage.src`  (Fabric.js canvas background) — same.
 *  3. null  → show placeholder icon
 *
 * URL normalisation rules:
 *  - Relative /uploads/… paths  → used as-is (CRM rewrite proxies to admin:3002)
 *  - localhost /uploads/… URLs  → stripped to relative path (same rewrite applies)
 *  - https://glowvitasalon.com/glowvita/uploads/… (legacy VPS URLs) → /uploads/…
 *  - Other absolute URLs        → used as-is (external CDN, etc.)
 */
function normalizeImageUrl(src: string): string {
  if (!src || src.startsWith("data:")) return src;

  if (src.startsWith("http")) {
    try {
      const u = new URL(src);

      // Any localhost URL with /uploads/ → relative path (goes through CRM rewrite proxy)
      if ((u.hostname === "localhost" || u.hostname === "127.0.0.1") && u.pathname.includes("/uploads/")) {
        return u.pathname; // → /uploads/filename.png
      }

      // Legacy production URL: https://glowvitasalon.com/glowvita/uploads/filename
      // Convert to /uploads/filename so the CRM rewrite proxy handles it
      if (u.pathname.includes("/uploads/")) {
        const uploadsIdx = u.pathname.indexOf("/uploads/");
        return u.pathname.slice(uploadsIdx); // → /uploads/filename.png
      }

      return src; // Other absolute URLs (CDN, etc.) — use as-is
    } catch {
      return src;
    }
  }

  // Already a relative path — use as-is
  return src.startsWith("/") ? src : `/${src}`;
}


function resolvePreviewUrl(
  imageUrl?: string,
  jsonData?: any
): string | null {
  // 1. DB imageUrl
  if (imageUrl && imageUrl.trim() !== "") {
    return normalizeImageUrl(imageUrl.trim());
  }

  // 2. Extract background image src from Fabric JSON
  try {
    let parsed = jsonData;
    if (typeof jsonData === "string") {
      parsed = JSON.parse(jsonData);
    }
    const bgSrc: string | undefined = parsed?.backgroundImage?.src;
    if (bgSrc && bgSrc.trim() !== "") {
      return normalizeImageUrl(bgSrc.trim());
    }
  } catch {
    // ignore JSON parse errors
  }

  return null;
}


export default function TemplateCanvasThumbnail({
  imageUrl,
  jsonData,
  alt = "Template preview",
}: TemplateCanvasThumbnailProps) {
  const src = resolvePreviewUrl(imageUrl, jsonData);
  const [imgError, setImgError] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  const currentSrc = fallbackSrc || src;

  // No source at all
  if (!currentSrc || imgError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-2">
        <ImageIcon className="h-10 w-10 text-gray-400" />
        <span className="text-xs text-gray-400">No preview</span>
      </div>
    );
  }

  const handleError = () => {
    if (!fallbackSrc && src) {
      // src may be either a relative /uploads/… path (after normalizeImageUrl)
      // or an absolute localhost URL. Build a full URL for the proxy.
      const isUploadPath = src.includes("/uploads/");
      if (isUploadPath) {
        try {
          // Resolve relative paths to full URL for the proxy
          const fullUrl = src.startsWith("http")
            ? src
            : `${window.location.origin}${src}`;
          const proxyUrl = `/api/local-image?url=${encodeURIComponent(fullUrl)}`;
          setFallbackSrc(proxyUrl);
        } catch {
          setImgError(true);
        }
      } else {
        setImgError(true);
      }
    } else {
      setImgError(true);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={handleError}
    />
  );
}
