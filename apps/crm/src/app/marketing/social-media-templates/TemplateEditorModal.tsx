
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Download, Save, X, Image as ImageIcon, Type, Move, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fabric } from 'fabric';

interface SocialMediaTemplate {
  _id: string;
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  jsonData: any;
  availableFor: string[];
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageSize?: { width: number; height: number };
}

interface TemplateEditorModalProps {
  template: SocialMediaTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditorControls = ({ selectedObject, canvas }: { selectedObject: fabric.Object | null, canvas: fabric.Canvas | null }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [fill, setFill] = useState('#000000');

  useEffect(() => {
    if (selectedObject && selectedObject.type === 'textbox') {
      const textbox = selectedObject as fabric.Textbox;
      setText(textbox.text || '');
      setFontSize(textbox.fontSize || 20);
      setFill(textbox.fill as string || '#000000');
    }
  }, [selectedObject]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (selectedObject && selectedObject.type === 'textbox' && canvas) {
      (selectedObject as fabric.Textbox).set('text', newText);
      canvas.requestRenderAll();
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setFontSize(newSize);
    if (selectedObject && selectedObject.type === 'textbox' && canvas) {
      (selectedObject as fabric.Textbox).set('fontSize', newSize);
      canvas.requestRenderAll();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setFill(newColor);
    if (selectedObject && selectedObject.type === 'textbox' && canvas) {
      (selectedObject as fabric.Textbox).set('fill', newColor);
      canvas.requestRenderAll();
    }
  };
  
  const handleDelete = () => {
    if (selectedObject && canvas) {
      canvas.remove(selectedObject);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  if (!selectedObject) {
    return (
      <div className="text-center text-muted-foreground p-4">
        <Move className="mx-auto h-8 w-8 mb-2" />
        <p>Select an element on the canvas to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedObject.type === 'textbox' && (
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-semibold text-lg flex items-center gap-2"><Type className="h-5 w-5" /> Text Properties</h4>
          <div className="space-y-2">
            <Label htmlFor="text-content">Content</Label>
            <Textarea id="text-content" value={text} onChange={handleTextChange} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Input id="font-size" type="number" value={fontSize} onChange={handleFontSizeChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="font-color">Color</Label>
                <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border" style={{ backgroundColor: fill }} />
                    <Input id="font-color" type="text" value={fill} onChange={handleColorChange} className="pl-9" />
                    <Input type="color" value={fill} onChange={handleColorChange} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 border-none bg-transparent cursor-pointer" />
                </div>
            </div>
          </div>
        </div>
      )}

      {selectedObject.type === 'image' && (
         <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Image Properties</h4>
            <p className="text-sm text-muted-foreground">Editing image properties is not yet supported. You can move, resize or delete it.</p>
        </div>
      )}
      
      <Button onClick={handleDelete} variant="destructive" className="w-full">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Element
      </Button>
    </div>
  );
};

export default function TemplateEditorModal({ template, isOpen, onClose }: TemplateEditorModalProps) {
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initCanvas = useCallback(() => {
    if (!canvasContainerRef.current || !template) return;
    
    // Create a new canvas element each time
    const canvasEl = document.createElement('canvas');
    canvasRef.current = canvasEl;
    canvasContainerRef.current.innerHTML = '';
    canvasContainerRef.current.appendChild(canvasEl);

    const container = canvasContainerRef.current;
    
    const canvas = new fabric.Canvas(canvasEl, {
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: '#f0f0f0'
    });

    canvas.loadFromJSON(template.jsonData, () => {
      const background = canvas.backgroundImage;
      if (background instanceof fabric.Image && background.width && background.height) {
        const canvasAspect = container.clientWidth / container.clientHeight;
        const bgAspect = background.width / background.height;
        let scale;

        if (canvasAspect > bgAspect) {
          scale = container.clientHeight / background.height;
        } else {
          scale = container.clientWidth / background.width;
        }

        canvas.setWidth(background.width * scale);
        canvas.setHeight(background.height * scale);
        canvas.setZoom(scale);
      }
      
      canvas.renderAll();
      setFabricCanvas(canvas);
    });

    canvas.on('selection:created', (e) => setSelectedObject(e.target || (e.selected && e.selected[0]) || null));
    canvas.on('selection:updated', (e) => setSelectedObject(e.target || (e.selected && e.selected[0]) || null));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    return canvas;
  }, [template]);
  
  useEffect(() => {
    let canvas: fabric.Canvas | null = null;
    if (isOpen && template) {
      // Delay initialization to ensure the modal container has dimensions
      const timer = setTimeout(() => {
        canvas = initCanvas();
      }, 50);

      return () => {
        clearTimeout(timer);
        if (canvas) {
          canvas.dispose();
        }
        setFabricCanvas(null);
      };
    }
  }, [isOpen, template, initCanvas]);

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.Textbox('New Text', {
      left: 50,
      top: 50,
      fontSize: 40,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1,
      width: 200,
      textAlign: 'center',
      fontFamily: 'Arial',
      shadow: 'rgba(0,0,0,0.3) 2px 2px 5px',
    });
    fabricCanvas.add(text).setActiveObject(text);
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        fabric.Image.fromURL(dataUrl, (img) => {
          img.scaleToWidth(100);
          img.set({
            left: fabricCanvas.getWidth() - img.getScaledWidth() - 20,
            top: fabricCanvas.getHeight() - img.getScaledHeight() - 20
          });
          fabricCanvas.add(img);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (fabricCanvas) {
      const dataUrl = fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.8 });
      const link = document.createElement('a');
      link.download = `${template?.title || 'custom-template'}.jpg`;
      link.href = dataUrl;
      link.click();
      toast.success("Template downloaded!");
    }
  };

  const handleSave = () => {
    if (fabricCanvas) {
        const json = fabricCanvas.toJSON(['selectable', 'evented', 'id']);
        console.log("Saving JSON:", JSON.stringify(json, null, 2));
        toast.success("Template customization saved!");
    }
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Edit Template: {template.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} size="sm" className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleSave} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden p-6">
          <div className="lg:col-span-1 bg-background rounded-lg border p-4 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Add Elements</h3>
              <div className="space-y-2">
                <Button onClick={addText} variant="outline" className="w-full justify-start"><Type className="h-4 w-4 mr-2" /> Add Text</Button>
                <div className="space-y-1">
                  <Label htmlFor="logo-upload" className="text-sm">Upload Logo</Label>
                  <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs" />
                </div>
              </div>
            </div>
            <div className="border-t"></div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Edit Element</h3>
              <EditorControls selectedObject={selectedObject} canvas={fabricCanvas} />
            </div>
          </div>
          
          <div 
            ref={canvasContainerRef} 
            className="lg:col-span-3 bg-muted/50 rounded-lg flex items-center justify-center overflow-auto p-4"
          >
            {/* Canvas is dynamically appended here */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
