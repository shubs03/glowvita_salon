
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

const EditorControls = ({ selectedObject, canvas }: { selectedObject: fabric.Object | null, canvas: fabric.Canvas | null }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [fill, setFill] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');
  const [textAlign, setTextAlign] = useState('center');

  useEffect(() => {
    if (selectedObject && selectedObject.type === 'textbox') {
      const textbox = selectedObject as fabric.Textbox;
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

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    if (selectedObject && selectedObject.type === 'textbox' && canvas) {
      (selectedObject as fabric.Textbox).set('fontFamily', value);
      canvas.requestRenderAll();
    }
  };

  const handleFontWeightChange = (value: string) => {
    setFontWeight(value);
    if (selectedObject && selectedObject.type === 'textbox' && canvas) {
      (selectedObject as fabric.Textbox).set('fontWeight', value);
      canvas.requestRenderAll();
    }
  };

  const handleTextAlignChange = (value: string) => {
    setTextAlign(value);
    if (selectedObject && selectedObject.type === 'textbox' && canvas) {
      (selectedObject as fabric.Textbox).set('textAlign', value);
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
              <Input id="font-size" type="number" value={fontSize} onChange={handleFontSizeChange} min="8" max="200" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <select 
                id="font-family" 
                value={fontFamily} 
                onChange={(e) => handleFontFamilyChange(e.target.value)}
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
                onChange={(e) => handleFontWeightChange(e.target.value)}
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
              onChange={(e) => handleTextAlignChange(e.target.value)}
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
            <div className="space-y-2">
              <Label>Position & Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (canvas && selectedObject) {
                      selectedObject.set({ left: 50, top: 50 });
                      canvas.renderAll();
                    }
                  }}
                >
                  Top Left
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (canvas && selectedObject) {
                      selectedObject.set({ 
                        left: canvas.width - selectedObject.width! - 50, 
                        top: 50 
                      });
                      canvas.renderAll();
                    }
                  }}
                >
                  Top Right
                </Button>
              </div>
            </div>
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
  const [isSaving, setIsSaving] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [saveCustomizedTemplate] = useSaveCustomizedTemplateMutation();

  const initCanvas = useCallback((container: HTMLDivElement) => {
    if (!container || !template) return null;

    const canvasEl = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvasEl);

    const canvas = new fabric.Canvas(canvasEl, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: '#f0f0f0'
    });

    if (template.jsonData && typeof template.jsonData === 'object') {
        canvas.loadFromJSON(template.jsonData, () => {
            const background = canvas.backgroundImage as fabric.Image;
            if (background) {
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const imgAspectRatio = background.width / background.height;
                const containerAspectRatio = containerWidth / containerHeight;

                let canvasWidth, canvasHeight;
                if (imgAspectRatio > containerAspectRatio) {
                    canvasWidth = containerWidth;
                    canvasHeight = containerWidth / imgAspectRatio;
                } else {
                    canvasHeight = containerHeight;
                    canvasWidth = containerHeight * imgAspectRatio;
                }
                
                canvas.setWidth(canvasWidth);
                canvas.setHeight(canvasHeight);
                canvas.setZoom(canvasWidth / background.width);
            }
            canvas.renderAll();
        });
    } else if (template.imageUrl) {
        fabric.Image.fromURL(template.imageUrl, (img) => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const imgAspectRatio = img.width / img.height;
            const containerAspectRatio = containerWidth / containerHeight;

            let canvasWidth, canvasHeight;
            if (imgAspectRatio > containerAspectRatio) {
                canvasWidth = containerWidth;
                canvasHeight = containerWidth / imgAspectRatio;
            } else {
                canvasHeight = containerHeight;
                canvasWidth = containerHeight * imgAspectRatio;
            }

            canvas.setWidth(canvasWidth);
            canvas.setHeight(canvasHeight);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                scaleX: canvas.width / img.width,
                scaleY: canvas.height / img.height
            });
        }, { crossOrigin: 'anonymous' });
    }

    canvas.on('selection:created', (e: any) => setSelectedObject(e.target || (e.selected && e.selected[0]) || null));
    canvas.on('selection:updated', (e: any) => setSelectedObject(e.target || (e.selected && e.selected[0]) || null));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    setFabricCanvas(canvas);
    return canvas;
  }, [template]);

  const canvasContainerRef = useCallback((node: HTMLDivElement) => {
      if (node && isOpen && template) {
          const canvas = initCanvas(node);
          return () => {
              if(canvas) {
                  canvas.dispose();
              }
          };
      }
  }, [isOpen, template, initCanvas]);

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.Textbox('Click to edit text', {
      left: fabricCanvas.width / 2 - 100,
      top: fabricCanvas.height / 2,
      fontSize: 30,
      fill: '#000000',
      width: 200,
      textAlign: 'center',
      fontFamily: 'Arial',
      fontWeight: 'normal',
      editable: true,
      selectable: true
    });
    fabricCanvas.add(text).setActiveObject(text);
    fabricCanvas.renderAll();
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        fabric.Image.fromURL(dataUrl, (img: any) => {
          // Scale the image to a reasonable size
          const maxWidth = 150;
          const maxHeight = 150;
          
          if (img.width > maxWidth || img.height > maxHeight) {
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            img.scale(scale);
          }
          
          img.set({
            left: 50,
            top: 50,
            selectable: true,
            moveable: true
          });
          
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
    // Clear the input value to allow re-uploading the same file
    e.target.value = '';
  };

  const handleDownload = () => {
    if (fabricCanvas) {
      // Temporarily deselect all objects to avoid selection outlines in the export
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      
      // Export at higher quality
      const dataUrl = fabricCanvas.toDataURL({ 
        format: 'jpeg', 
        quality: 0.9,
        multiplier: 2 // Export at 2x resolution for better quality
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
        // Get the JSON representation of the canvas
        const canvasJson = fabricCanvas.toJSON(['selectable', 'evented', 'id']);
        
        console.log("Saving canvas JSON:", JSON.stringify(canvasJson, null, 2));
        
        // Save as a customized version
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
        
        // Optionally close the modal after saving
        // onClose();
        
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
              <Button 
                onClick={() => {
                  console.log('=== DEBUG TEMPLATE DATA ===');
                  console.log('Template title:', template?.title);
                  console.log('Template imageUrl length:', template?.imageUrl?.length);
                  console.log('Template jsonData:', template?.jsonData);
                  console.log('Canvas objects count:', fabricCanvas?.getObjects().length);
                  console.log('Canvas background:', fabricCanvas?.backgroundColor);
                  console.log('Canvas backgroundImage:', fabricCanvas?.backgroundImage);
                  console.log('==============================');
                }} 
                variant="secondary" 
                size="sm"
              >
                Debug
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
