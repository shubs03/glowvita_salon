"use client";

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Download, Save, X, Image as ImageIcon, Upload, Plus, Trash2, Type } from 'lucide-react';
import { toast } from 'sonner';
import { fabric } from 'fabric';

interface TextElement {
  id: string;
  content: string;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    color: string;
    fontWeight: 'normal' | 'bold';
    fontFamily: string;
  };
}

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
  // Added for image sizing
  imageSize?: { width: number; height: number };
}

interface TemplateEditorModalProps {
  template: SocialMediaTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateEditorModal({ template, isOpen, onClose }: TemplateEditorModalProps) {
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [logo, setLogo] = useState<fabric.Image | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (isOpen && canvasRef.current) {
        const canvas = new fabric.Canvas(canvasRef.current);
        setFabricCanvas(canvas);

        if (template?.jsonData) {
            canvas.loadFromJSON(template.jsonData, () => {
                canvas.renderAll();
            });
        } else if (template?.imageUrl) {
            fabric.Image.fromURL(template.imageUrl, (img) => {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: canvas.width / img.width,
                    scaleY: canvas.height / img.height,
                });
            });
        }

        return () => {
            canvas.dispose();
            setFabricCanvas(null);
        };
    }
  }, [isOpen, template]);

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.Textbox('New Text', {
      left: 50,
      top: 50,
      fontSize: 20,
      fill: '#000000',
    });
    fabricCanvas.add(text);
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        fabric.Image.fromURL(dataUrl, (img) => {
          if(logo) fabricCanvas.remove(logo);
          img.scale(0.2);
          fabricCanvas.add(img);
          setLogo(img);
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
        const json = fabricCanvas.toJSON();
        // Here you would call an API to save the JSON data
        console.log("Saving JSON:", json);
        toast.success("Template customization saved!");
    }
  };

  if (!isOpen || !template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Template: {template.title}</span>
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} size="sm" className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleSave} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Controls Area - Scrollable */}
          <div className="lg:col-span-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <h3 className="text-lg font-semibold">Customize Your Template</h3>
            <div className="space-y-2">
              <Button onClick={addText} variant="outline" className="w-full"><Type className="h-4 w-4 mr-2" /> Add Text</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} />
            </div>
            {/* More controls for color, font, etc. would go here */}
          </div>
          
          {/* Canvas Area - Fixed */}
          <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
            <div className="bg-gray-100 rounded-lg p-4 flex-grow flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={800}
                className="border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
