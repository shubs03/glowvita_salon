"use client";

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Download, Save, X, Image as ImageIcon, Upload, Plus, Trash2, Type } from 'lucide-react';
import { toast } from 'sonner';

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
  const [editedTemplate, setEditedTemplate] = useState<SocialMediaTemplate | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState({ x: 20, y: 20 });
  const [logoSize, setLogoSize] = useState({ width: 100, height: 100 });
  const [templateImageSize, setTemplateImageSize] = useState({ width: 800, height: 800 }); // Default canvas size
  const [activeElement, setActiveElement] = useState<'text' | 'logo' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper functions for text management
  const generateTextId = () => Math.random().toString(36).substr(2, 9);
  
  const addNewTextElement = () => {
    const newText: TextElement = {
      id: generateTextId(),
      content: 'New Text',
      position: { x: 50, y: 30 + (textElements.length * 15) },
      style: {
        fontSize: 24,
        color: '#000000',
        fontWeight: 'normal',
        fontFamily: 'Arial, sans-serif'
      }
    };
    setTextElements([...textElements, newText]);
    setActiveTextId(newText.id);
    setActiveElement('text');
  };
  
  const removeTextElement = (id: string) => {
    setTextElements(textElements.filter(text => text.id !== id));
    if (activeTextId === id) {
      setActiveTextId(null);
      setActiveElement(null);
    }
  };
  
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(textElements.map(text => 
      text.id === id ? { ...text, ...updates } : text
    ));
  };
  
  const getActiveTextElement = () => {
    return textElements.find(text => text.id === activeTextId);
  };

  useEffect(() => {
    if (template) {
      setEditedTemplate({ ...template });
      // Initialize template image size if available
      if (template.imageSize) {
        setTemplateImageSize(template.imageSize);
      }
      // Initialize with one default text element
      const defaultText: TextElement = {
        id: generateTextId(),
        content: template.title || 'Sample Text',
        position: { x: 50, y: 50 },
        style: {
          fontSize: 24,
          color: '#000000',
          fontWeight: 'normal',
          fontFamily: 'Arial, sans-serif'
        }
      };
      setTextElements([defaultText]);
      setActiveTextId(defaultText.id);
    }
  }, [template]);

  useEffect(() => {
    if (editedTemplate && canvasRef.current) {
      drawCanvas();
    }
  }, [editedTemplate, textElements, logo, logoPosition, logoSize, activeTextId, templateImageSize]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !editedTemplate) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = templateImageSize.width;
    canvas.height = templateImageSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if exists
    if (editedTemplate.imageUrl) {
      const img = new Image();
      img.onload = () => {
        // Draw image with specified size
        ctx.drawImage(img, 0, 0, templateImageSize.width, templateImageSize.height);
        drawLogo(ctx);
        drawText(ctx);
      };
      img.src = editedTemplate.imageUrl;
    } else {
      // Draw default background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, templateImageSize.width, templateImageSize.height);
      drawLogo(ctx);
      drawText(ctx);
    }
  };

  const drawLogo = (ctx: CanvasRenderingContext2D) => {
    if (!logo) return;

    const logoImg = new Image();
    logoImg.onload = () => {
      const x = (logoPosition.x / 100) * templateImageSize.width;
      const y = (logoPosition.y / 100) * templateImageSize.height;
      
      // Draw logo with specified size
      ctx.drawImage(logoImg, x, y, logoSize.width, logoSize.height);
      
      // Draw selection border if logo is active
      if (activeElement === 'logo') {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, y - 2, logoSize.width + 4, logoSize.height + 4);
      }
    };
    logoImg.src = logo;
  };

  const drawText = (ctx: CanvasRenderingContext2D) => {
    textElements.forEach((textElement) => {
      if (!textElement.content) return;

      ctx.font = `${textElement.style.fontWeight} ${textElement.style.fontSize}px ${textElement.style.fontFamily}`;
      ctx.fillStyle = textElement.style.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      const x = (textElement.position.x / 100) * templateImageSize.width;
      const y = (textElement.position.y / 100) * templateImageSize.height;
      
      ctx.fillText(textElement.content, x, y);
      
      // Draw selection border if this text is active
      if (activeElement === 'text' && activeTextId === textElement.id) {
        const textMetrics = ctx.measureText(textElement.content);
        const textWidth = textMetrics.width;
        const textHeight = textElement.style.fontSize;
        
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - textWidth/2 - 5, y - textHeight/2 - 5, textWidth + 10, textHeight + 10);
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Check if click is on logo
    if (logo) {
      const logoX = logoPosition.x;
      const logoY = logoPosition.y;
      const logoW = (logoSize.width / templateImageSize.width) * 100;
      const logoH = (logoSize.height / templateImageSize.height) * 100;
      
      if (clickX >= logoX && clickX <= logoX + logoW && 
          clickY >= logoY && clickY <= logoY + logoH) {
        setActiveElement('logo');
        setActiveTextId(null);
        return;
      }
    }
    
    // Check if click is on any text element
    for (const textElement of textElements) {
      const textX = textElement.position.x;
      const textY = textElement.position.y;
      
      // More accurate text area calculation using canvas measurement
      let textWidth = 10;
      let textHeight = 5;
      
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.font = `${textElement.style.fontWeight} ${textElement.style.fontSize}px ${textElement.style.fontFamily}`;
          const metrics = ctx.measureText(textElement.content);
          textWidth = (metrics.width / templateImageSize.width) * 100; // Convert to percentage
          textHeight = (textElement.style.fontSize / templateImageSize.height) * 100; // Convert to percentage
        }
      }
      
      // Use larger click area for better UX
      const clickAreaWidth = Math.max(10, textWidth / 2);
      const clickAreaHeight = Math.max(5, textHeight / 2);
      
      if (clickX >= textX - clickAreaWidth && clickX <= textX + clickAreaWidth && 
          clickY >= textY - clickAreaHeight && clickY <= textY + clickAreaHeight) {
        setActiveElement('text');
        setActiveTextId(textElement.id);
        return;
      }
    }
    
    // If we have an active element, handle positioning or deselection
    if (activeElement === 'logo' && logo) {
      // Move logo to click position
      setLogoPosition({ x: clickX, y: clickY });
    } else if (activeElement === 'text' && activeTextId) {
      // Check if we're clicking on the currently active text element
      const activeText = textElements.find(t => t.id === activeTextId);
      if (activeText) {
        const textX = activeText.position.x;
        const textY = activeText.position.y;
        
        // More accurate text area calculation using canvas measurement
        let textWidth = 10;
        let textHeight = 5;
        
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.font = `${activeText.style.fontWeight} ${activeText.style.fontSize}px ${activeText.style.fontFamily}`;
            const metrics = ctx.measureText(activeText.content);
            textWidth = (metrics.width / templateImageSize.width) * 100; // Convert to percentage
            textHeight = (activeText.style.fontSize / templateImageSize.height) * 100; // Convert to percentage
          }
        }
        
        // Use larger click area for better UX
        const clickAreaWidth = Math.max(10, textWidth / 2);
        const clickAreaHeight = Math.max(5, textHeight / 2);
        
        // If click is NOT on the active text element, deselect it
        if (!(clickX >= textX - clickAreaWidth && clickX <= textX + clickAreaWidth && 
              clickY >= textY - clickAreaHeight && clickY <= textY + clickAreaHeight)) {
          setActiveElement(null);
          setActiveTextId(null);
          console.log('Deselected text element - clicked outside');
          toast.info('Deselected text element');
        } else {
          // Move active text to click position
          updateTextElement(activeTextId, {
            position: { x: clickX, y: clickY }
          });
        }
      } else {
        // Active text not found, deselect
        setActiveElement(null);
        setActiveTextId(null);
      }
    } else {
      // Click on empty area with no active element - deselect everything
      setActiveElement(null);
      setActiveTextId(null);
      console.log('Deselected all elements - clicked on empty area');
      toast.info('Deselected all elements');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogo(result);
      setActiveElement('logo');
      toast.success('Logo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setActiveElement(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Logo removed');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Create download link
      const link = document.createElement('a');
      link.download = `${editedTemplate?.title || 'template'}-edited.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  const handleSave = async () => {
    if (!editedTemplate) return;

    try {
      // Update the template with the current image size
      const updatedTemplate = {
        ...editedTemplate,
        imageSize: templateImageSize
      };
      
      // Here you can implement API call to save the edited template
      // For now, we'll just show a success message
      toast.success('Template saved successfully!');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save template');
    }
  };

  if (!template || !editedTemplate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Template: {template.title}</span>
            <div className="flex items-center gap-2">
              {/* Action Buttons in Header - Always Visible */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Canvas Area - Fixed/Sticky */}
          <div className="flex flex-col space-y-4 overflow-hidden lg:sticky lg:top-0">
            <div className="bg-gray-100 rounded-lg p-4 flex-shrink-0">
              <canvas
                ref={canvasRef}
                className="w-full h-auto border border-gray-300 rounded cursor-crosshair max-h-80 lg:max-h-[60vh]"
                onClick={handleCanvasClick}
              />
            </div>
            
            {/* Canvas Instructions - Fixed */}
            <div className="text-sm text-muted-foreground space-y-1 flex-shrink-0 bg-blue-50 p-3 rounded-lg border">
              <p className="font-medium text-blue-700">Canvas Controls:</p>
              <p>• Click anywhere to add/position text</p>
              <p>• Click on existing text to select it</p>
              <p>• Click on logo to select and move it</p>
              <p>• Click outside selected text to deselect</p>
              <p>• Click on empty area to deselect all</p>
              <p>• Use "Add Text" button for multiple texts</p>
              {activeElement && activeTextId && (
                <p className="text-blue-600 font-semibold mt-2 p-2 bg-blue-100 rounded">
                  ✓ Selected: Text {textElements.findIndex(t => t.id === activeTextId) + 1}
                </p>
              )}
              {activeElement === 'logo' && (
                <p className="text-blue-600 font-semibold mt-2 p-2 bg-blue-100 rounded">
                  ✓ Selected: Logo
                </p>
              )}
            </div>
            
            {/* Additional Action Buttons for Mobile - Always Visible */}
            <div className="flex gap-2 flex-shrink-0 lg:hidden">
              <Button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleSave} variant="outline" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Editing Controls - Scrollable */}
          <div className="overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: 'calc(95vh - 120px)' }}>
            {/* Template Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Template Information</h3>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTemplate.title}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedTemplate.description}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Multiple Text Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Text Elements</h3>
                <Button 
                  onClick={addNewTextElement}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              </div>
              
              {textElements.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                  <Type className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4">No text elements added yet</p>
                  <Button onClick={addNewTextElement} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Text
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {textElements.map((textElement, index) => (
                    <div 
                      key={textElement.id}
                      className={`border rounded-lg p-4 transition-all ${
                        activeTextId === textElement.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">
                            Text {index + 1}
                          </span>
                          {activeTextId === textElement.id && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setActiveTextId(textElement.id);
                              setActiveElement('text');
                            }}
                            className="h-7 px-2"
                          >
                            Select
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTextElement(textElement.id)}
                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Text Content */}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`text-content-${textElement.id}`}>Content</Label>
                          <Textarea
                            id={`text-content-${textElement.id}`}
                            value={textElement.content}
                            onChange={(e) => {
                              updateTextElement(textElement.id, { content: e.target.value });
                              setActiveTextId(textElement.id);
                              setActiveElement('text');
                            }}
                            onFocus={() => {
                              setActiveTextId(textElement.id);
                              setActiveElement('text');
                            }}
                            placeholder="Enter text content..."
                            rows={2}
                          />
                        </div>
                        
                        {/* Text Styling */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`font-size-${textElement.id}`}>Font Size</Label>
                            <Input
                              id={`font-size-${textElement.id}`}
                              type="number"
                              min="12"
                              max="72"
                              value={textElement.style.fontSize}
                              onChange={(e) => {
                                updateTextElement(textElement.id, {
                                  style: { ...textElement.style, fontSize: parseInt(e.target.value) || 24 }
                                });
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                              onFocus={() => {
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`text-color-${textElement.id}`}>Color</Label>
                            <Input
                              id={`text-color-${textElement.id}`}
                              type="color"
                              value={textElement.style.color}
                              onChange={(e) => {
                                updateTextElement(textElement.id, {
                                  style: { ...textElement.style, color: e.target.value }
                                });
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                              onFocus={() => {
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`font-weight-${textElement.id}`}>Font Weight</Label>
                            <select
                              id={`font-weight-${textElement.id}`}
                              value={textElement.style.fontWeight}
                              onChange={(e) => {
                                updateTextElement(textElement.id, {
                                  style: { ...textElement.style, fontWeight: e.target.value as 'normal' | 'bold' }
                                });
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                              onFocus={() => {
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              aria-label="Font Weight"
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Bold</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`font-family-${textElement.id}`}>Font Family</Label>
                            <select
                              id={`font-family-${textElement.id}`}
                              value={textElement.style.fontFamily}
                              onChange={(e) => {
                                updateTextElement(textElement.id, {
                                  style: { ...textElement.style, fontFamily: e.target.value }
                                });
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                              onFocus={() => {
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              aria-label="Font Family"
                            >
                              <option value="Arial, sans-serif">Arial</option>
                              <option value="Georgia, serif">Georgia</option>
                              <option value="Times New Roman, serif">Times New Roman</option>
                              <option value="Helvetica, sans-serif">Helvetica</option>
                              <option value="Courier New, monospace">Courier New</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Position Controls */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`text-pos-x-${textElement.id}`}>X Position (%)</Label>
                            <Input
                              id={`text-pos-x-${textElement.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round(textElement.position.x)}
                              onChange={(e) => {
                                updateTextElement(textElement.id, {
                                  position: { ...textElement.position, x: parseInt(e.target.value) || 50 }
                                });
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                              onFocus={() => {
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`text-pos-y-${textElement.id}`}>Y Position (%)</Label>
                            <Input
                              id={`text-pos-y-${textElement.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round(textElement.position.y)}
                              onChange={(e) => {
                                updateTextElement(textElement.id, {
                                  position: { ...textElement.position, y: parseInt(e.target.value) || 50 }
                                });
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                              onFocus={() => {
                                setActiveTextId(textElement.id);
                                setActiveElement('text');
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border">
                <p className="font-medium text-blue-700 mb-1">💡 Tips:</p>
                <p>• Click "Add Text" to create new text elements</p>
                <p>• Click on text elements in the canvas to select them</p>
                <p>• Click anywhere on canvas to position selected text</p>
                <p>• Use the position controls for precise placement</p>
                <p>• Adjust template image size using the size controls</p>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Logo Management</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logo ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  {logo && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  aria-label="Upload logo image"
                />
                
                {logo && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Logo uploaded. Click on the canvas to position it.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="logoWidth">Logo Width (px)</Label>
                        <Input
                          id="logoWidth"
                          type="number"
                          min="20"
                          max="400"
                          value={logoSize.width}
                          onChange={(e) => {
                            setLogoSize({ ...logoSize, width: parseInt(e.target.value) || 100 });
                            setActiveElement('logo'); // Switch to logo when editing logo properties
                          }}
                          onFocus={() => setActiveElement('logo')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logoHeight">Logo Height (px)</Label>
                        <Input
                          id="logoHeight"
                          type="number"
                          min="20"
                          max="400"
                          value={logoSize.height}
                          onChange={(e) => {
                            setLogoSize({ ...logoSize, height: parseInt(e.target.value) || 100 });
                            setActiveElement('logo'); // Switch to logo when editing logo properties
                          }}
                          onFocus={() => setActiveElement('logo')}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Template Image Size */}
            {editedTemplate?.imageUrl && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Template Image Size</h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Adjust the canvas size for your template image
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateWidth">Width (px)</Label>
                      <Input
                        id="templateWidth"
                        type="number"
                        min="400"
                        max="2000"
                        value={templateImageSize.width}
                        onChange={(e) => {
                          setTemplateImageSize({ ...templateImageSize, width: parseInt(e.target.value) || 800 });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="templateHeight">Height (px)</Label>
                      <Input
                        id="templateHeight"
                        type="number"
                        min="400"
                        max="2000"
                        value={templateImageSize.height}
                        onChange={(e) => {
                          setTemplateImageSize({ ...templateImageSize, height: parseInt(e.target.value) || 800 });
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: Changing canvas size will affect positioning of all elements
                  </p>
                </div>
              </div>
            )}

            {/* Position Controls - Legacy */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Position Controls</h3>
              
              {activeElement === 'logo' && logo && (
                <div className="space-y-4">
                  <h4 className="font-medium text-blue-600">Logo Position</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="logoPosX">Horizontal (%)</Label>
                      <Input
                        id="logoPosX"
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(logoPosition.x)}
                        onChange={(e) => {
                          setLogoPosition({ ...logoPosition, x: parseInt(e.target.value) || 20 });
                          setActiveElement('logo');
                        }}
                        onFocus={() => setActiveElement('logo')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoPosY">Vertical (%)</Label>
                      <Input
                        id="logoPosY"
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(logoPosition.y)}
                        onChange={(e) => {
                          setLogoPosition({ ...logoPosition, y: parseInt(e.target.value) || 20 });
                          setActiveElement('logo');
                        }}
                        onFocus={() => setActiveElement('logo')}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {!activeElement && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select text or logo elements to position them
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}