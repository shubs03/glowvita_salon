"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Type,
  Image as ImageIcon,
  Download,
  Save,
  Trash2,
  Move,
} from "lucide-react";
import { toast } from "sonner";
import fabric from "fabric";
import type {
  TEvent,
  FabricImage,
  ImageProps,
  SerializedImageProps,
  ObjectEvents,
  TPointerEvent,
} from "fabric";

interface CanvasTemplateEditorProps {
  initialImage?: string;
  onSaveTemplate: (templateData: {
    jsonData: any;
    previewImage: string;
  }) => void;
  width?: number;
  height?: number;
}

export default function CanvasTemplateEditor({
  initialImage,
  onSaveTemplate,
  width = 900,
  height = 800,
}: CanvasTemplateEditorProps) {
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(
    null
  );

  // This state will track if the component has mounted on the client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only once on the client-side after the component mounts
    setIsClient(true);
  }, []);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Text editing states
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fill, setFill] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState("normal");
  const [textAlign, setTextAlign] = useState("center");

  const initCanvas = useCallback(() => {
    if (!canvasContainerRef.current) return;

    const canvasEl = document.createElement("canvas");
    canvasContainerRef.current.innerHTML = "";
    canvasContainerRef.current.appendChild(canvasEl);

    // Use fabric.Canvas instead of new Canvas
    const canvas = new fabric.Canvas(canvasEl, {
      width: width,
      height: height,
      backgroundColor: "#ffffff",
    });

    // Load initial background image if provided
    if (initialImage) {
      fabric.Image.fromURL(
        initialImage,
        (img: FabricImage) => {
          canvas.backgroundImage = img;
          canvas.renderAll();
        },
        {
          scaleX: (canvas.width || 1) / (initialImage ? width : 1),
          scaleY: (canvas.height || 1) / (initialImage ? height : 1),
        }
      );
    }

    // Add default text elements
    const titleText = new fabric.Textbox("Your Title Here", {
      left: width / 2,
      top: 100,
      fontSize: 48,
      fill: "#000000",
      width: 400,
      textAlign: "center",
      fontFamily: "Arial",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
      selectable: true,
      editable: true,
    });

    const subtitleText = new fabric.Textbox("Add your message here", {
      left: width / 2,
      top: 200,
      fontSize: 24,
      fill: "#333333",
      width: 500,
      textAlign: "center",
      fontFamily: "Arial",
      fontWeight: "normal",
      originX: "center",
      originY: "center",
      selectable: true,
      editable: true,
    });

    canvas.add(titleText, subtitleText);

    // Scale canvas to fit container
    const container = canvasContainerRef.current;
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      const containerWidth = container.clientWidth - 40;
      const containerHeight = container.clientHeight - 40;
      const scaleX = containerWidth / width;
      const scaleY = containerHeight / height;
      const scale = Math.min(scaleX, scaleY, 0.8);

      if (scale < 1) {
        canvas.setZoom(scale);
      }
    }

    // Set up event listeners
    canvas.on("selection:created", (e: { selected: any[] }) => {
      const selected = e.selected[0];
      setSelectedObject(selected || null);
      if (selected && selected.type === "textbox") {
        updateTextControls(selected);
      }
    });

    canvas.on("selection:updated", (e: { selected: any[] }) => {
      const selected = e.selected[0];
      setSelectedObject(selected || null);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    setFabricCanvas(canvas);
    return canvas;
  }, [initialImage, width, height]);

  const updateTextControls = (textbox: fabric.Object) => {
    if (textbox instanceof fabric.Textbox) {
      setText(textbox.text || "");
      setFontSize(textbox.fontSize || 24);
      setFill((textbox.fill as string) || "#000000");
      setFontFamily(textbox.fontFamily || "Arial");
      setFontWeight((textbox.fontWeight as string) || "normal");
      setTextAlign(textbox.textAlign || "center");
    }
  };

  useEffect(() => {
    if (isClient) {
      const canvas = initCanvas();

      return () => {
        if (canvas) {
          canvas.dispose();
        }
      };
    }
  }, [isClient, initCanvas]);

  const addText = () => {
    if (!fabricCanvas) return;

    const newText = new fabric.Textbox("New Text", {
      left: 100,
      top: 100,
      fontSize: 30,
      fill: "#000000",
      width: 200,
      textAlign: "center",
      fontFamily: "Arial",
      selectable: true,
      editable: true,
    });

    fabricCanvas.add(newText);
    fabricCanvas.setActiveObject(newText);
    fabricCanvas.renderAll();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        fabric.Image.fromURL(dataUrl, (img: FabricImage) => {
          const maxWidth = 150;
          const maxHeight = 150;

          if (
            img.width &&
            img.height &&
            (img.width > maxWidth || img.height > maxHeight)
          ) {
            const scale = Math.min(
              maxWidth / img.width,
              maxHeight / img.height
            );
            img.scale(scale);
          }

          img.set({
            left: 50,
            top: 50,
            selectable: true,
          });

          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (selectedObject && selectedObject.type === "textbox" && fabricCanvas) {
      (selectedObject as fabric.Textbox).set("text", newText);
      fabricCanvas.requestRenderAll();
    }
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (selectedObject && fabricCanvas) {
      selectedObject.set(property, value);
      fabricCanvas.requestRenderAll();
    }
  };

  const deleteSelected = () => {
    if (selectedObject && fabricCanvas) {
      fabricCanvas.remove(selectedObject);
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      setSelectedObject(null);
    }
  };

  const saveTemplate = () => {
    if (!fabricCanvas) return;

    // Deselect all objects for clean preview
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();

    const jsonData = fabricCanvas.toJSON();
    const previewImage = fabricCanvas.toDataURL({
      format: "jpeg",
      quality: 0.8,
      multiplier: 1,
    });

    console.log("Generated template JSON:", JSON.stringify(jsonData, null, 2));

    onSaveTemplate({
      jsonData,
      previewImage,
    });

    toast.success("Template saved successfully!");
  };

  const downloadPreview = () => {
    if (!fabricCanvas) return;

    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();

    const dataUrl = fabricCanvas.toDataURL({
      format: "jpeg",
      quality: 0.9,
      multiplier: 2,
    });

    const link = document.createElement("a");
    link.download = "template-preview.jpg";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Template downloaded!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Controls Panel */}
      <div className="lg:col-span-1 space-y-6">
        {/* Add Elements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={addText}
              variant="outline"
              className="w-full justify-start"
            >
              <Type className="h-4 w-4 mr-2" />
              Add Text
            </Button>

            <div className="space-y-2">
              <Label htmlFor="logo-upload">Upload Image/Logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
          </CardContent>
        </Card>

        {/* Edit Selected Element */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Edit Element</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedObject ? (
              <div className="text-center text-muted-foreground py-4">
                <Move className="mx-auto h-8 w-8 mb-2" />
                <p>Select an element to edit</p>
              </div>
            ) : selectedObject.type === "textbox" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-content">Content</Label>
                  <Textarea
                    id="text-content"
                    value={text}
                    onChange={handleTextChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="font-size">Size</Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={fontSize}
                      onChange={(e) => {
                        const size = parseInt(e.target.value);
                        setFontSize(size);
                        handlePropertyChange("fontSize", size);
                      }}
                      min="8"
                      max="200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="text-color">Color</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={fill}
                      onChange={(e) => {
                        setFill(e.target.value);
                        handlePropertyChange("fill", e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="font-family">Font</Label>
                  <select
                    id="font-family"
                    className="w-full px-3 py-2 border rounded-md"
                    value={fontFamily}
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      handlePropertyChange("fontFamily", e.target.value);
                    }}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="font-weight">Weight</Label>
                    <select
                      id="font-weight"
                      className="w-full px-3 py-2 border rounded-md"
                      value={fontWeight}
                      onChange={(e) => {
                        setFontWeight(e.target.value);
                        handlePropertyChange("fontWeight", e.target.value);
                      }}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="text-align">Align</Label>
                    <select
                      id="text-align"
                      className="w-full px-3 py-2 border rounded-md"
                      value={textAlign}
                      onChange={(e) => {
                        setTextAlign(e.target.value);
                        handlePropertyChange("textAlign", e.target.value);
                      }}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={deleteSelected}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <ImageIcon className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Image selected
                </p>
                <Button
                  onClick={deleteSelected}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="space-y-2 pt-6">
            <Button onClick={saveTemplate} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button
              onClick={downloadPreview}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Preview
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Canvas Area */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardContent className="p-4">
            <div
              ref={canvasContainerRef}
              className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
            >
              {/* Canvas will be inserted here */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
