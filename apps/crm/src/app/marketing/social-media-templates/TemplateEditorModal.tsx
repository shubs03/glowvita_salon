"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Download, Save, X, Image as ImageIcon, Type, Move, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSaveCustomizedTemplateMutation } from '@repo/store/services/api';

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

const EditorControls = ({ selectedObject, canvas, fabricLibrary }: { selectedObject: any | null, canvas: any | null, fabricLibrary: any | null }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [fill, setFill] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');
  const [textAlign, setTextAlign] = useState('center');

  useEffect(() => {
    if (selectedObject && fabricLibrary && selectedObject.type === 'textbox') {
      const textbox = selectedObject as any;
      setText(textbox.text || '');
      setFontSize(textbox.fontSize || 20);
      setFill(textbox.fill as string || '#000000');
      setFontFamily(textbox.fontFamily || 'Arial');
      setFontWeight(textbox.fontWeight as string || 'normal');
      setTextAlign(textbox.textAlign || 'center');
    }
  }, [selectedObject]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (selectedObject && fabricLibrary && selectedObject.type === 'textbox' && canvas) {
      (selectedObject as any).set('text', newText);
      canvas.requestRenderAll();
    }
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (selectedObject && canvas) {
      selectedObject.set(property, value);
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
              <Input id="font-size" type="number" value={fontSize} onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))} min="8" max="200" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="font-color">Color</Label>
                <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border" style={{ backgroundColor: fill }} />
                    <Input id="font-color" type="text" value={fill} onChange={(e) => handlePropertyChange('fill', e.target.value)} className="pl-9" />
                    <Input type="color" value={fill} onChange={(e) => handlePropertyChange('fill', e.target.value)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 border-none bg-transparent cursor-pointer" />
                </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <select 
                id="font-family" 
                value={fontFamily} 
                onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Impact">Impact</option>
                <option value="Tahoma">Tahoma</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-weight">Weight</Label>
              <select 
                id="font-weight" 
                value={fontWeight} 
                onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="text-align">Text Alignment</Label>
            <select 
              id="text-align" 
              value={textAlign} 
              onChange={(e) => handlePropertyChange('textAlign', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
        </div>
      )}

      {selectedObject.type === 'image' && (
         <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Image Properties</h4>
            <p className="text-sm text-muted-foreground">You can move and resize this image by dragging it on the canvas.</p>
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
  const [fabricCanvas, setFabricCanvas] = useState<any | null>(null);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);
  const [fabricLibrary, setFabricLibrary] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [saveCustomizedTemplate] = useSaveCustomizedTemplateMutation();

  // Load fabric library dynamically on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('fabric').then((fabricModule) => {
        setFabricLibrary(fabricModule.default || fabricModule);
      }).catch((error) => {
        console.error('Failed to load fabric library:', error);
        toast.error('Failed to load design editor. Please try again.');
      });
    }
  }, []);

  const initCanvas = useCallback((container: HTMLDivElement) => {
    if (!container || !template || !template.jsonData || !fabricLibrary) return;
    
    container.innerHTML = ''; // Clear previous canvas
    const canvasEl = document.createElement('canvas');
    container.appendChild(canvasEl);

    const canvas = new fabricLibrary.Canvas(canvasEl);
    
    // Set a default size first
    canvas.setWidth(container.clientWidth);
    canvas.setHeight(container.clientWidth * (9/16));

    canvas.loadFromJSON(template.jsonData, () => {
        const bgImage = canvas.backgroundImage;
        const containerWidth = container.clientWidth;
        
        let canvasWidth = containerWidth;
        let canvasHeight = containerWidth * (9/16);

        if (bgImage instanceof fabricLibrary.Image && bgImage.width) {
            const imgAspectRatio = bgImage.width / (bgImage.height || 1);
            canvasHeight = containerWidth / imgAspectRatio;
        }

        canvas.setWidth(canvasWidth);
        canvas.setHeight(canvasHeight);
        canvas.renderAll();

        // Setup event listeners after loading
        canvas.on('selection:created', (e: any) => setSelectedObject(e.target || (e.selected && e.selected[0]) || null));
        canvas.on('selection:updated', (e: any) => setSelectedObject(e.target || (e.selected && e.selected[0]) || null));
        canvas.on('selection:cleared', () => setSelectedObject(null));
    });

    setFabricCanvas(canvas);

  }, [template]);

  const canvasContainerRef = useCallback((node: HTMLDivElement) => {
    if (node && isOpen && template) {
      const timer = setTimeout(() => initCanvas(node), 100); // Give modal time to render
      return () => clearTimeout(timer);
    }
  }, [isOpen, template, initCanvas]);


  const addText = () => {
    if (!fabricCanvas || !fabricLibrary) return;
    const text = new fabricLibrary.Textbox('Click to edit text', {
      left: (fabricCanvas.width || 0) / 2 - 100,
      top: (fabricCanvas.height || 0) / 2,
      fontSize: 30,
      fill: '#000000',
      width: 200,
      textAlign: 'center',
      fontFamily: 'Arial',
      fontWeight: 'normal',
      editable: true,
      selectable: true
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas && fabricLibrary) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        fabricLibrary.Image.fromURL(dataUrl).then((img: any) => {
          const maxWidth = 150;
          const maxHeight = 150;
          
          if (img.width && img.height && (img.width > maxWidth || img.height > maxHeight)) {
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            img.scale(scale);
          }
          
          img.set({
            left: 50,
            top: 50,
            selectable: true,
            hasControls: true,
            hasBorders: true
          });
          
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleDownload = () => {
    if (fabricCanvas) {
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      
      const dataUrl = fabricCanvas.toDataURL({ 
        format: 'jpeg', 
        quality: 0.9,
        multiplier: 2
      });
      
      const link = document.createElement('a');
      link.download = `${template?.title || 'custom-template'}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Template downloaded successfully!");
    }
  };

  const handleSave = async () => {
    if (fabricCanvas && template) {
      setIsSaving(true);
      
      try {
        const canvasJson = fabricCanvas.toJSON();
        
        await saveCustomizedTemplate({
          templateId: template._id || template.id,
          jsonData: canvasJson,
          title: `${template.title} - Edited`,
          customizations: {
            lastModified: new Date().toISOString(),
            canvasSize: {
              width: fabricCanvas.width,
              height: fabricCanvas.height
            }
          }
        }).unwrap();
        
        toast.success("Template customization saved successfully!");
        
      } catch (error) {
        console.error('Error saving template:', error);
        toast.error("Failed to save template customization");
      } finally {
        setIsSaving(false);
      }
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
              <Button onClick={handleSave} variant="outline" size="sm" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
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
              <EditorControls selectedObject={selectedObject} canvas={fabricCanvas} fabricLibrary={fabricLibrary} />
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