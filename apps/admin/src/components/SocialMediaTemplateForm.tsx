"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Image as ImageIcon, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import CanvasTemplateEditor, { CanvasTemplateEditorRef } from './CanvasTemplateEditor';

export interface SocialMediaTemplate {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  imageFile?: File | null;
  image?: string;
  imageUrl?: string;
  previewImage?: string;
  jsonData?: any;
  category: string;
  availableFor: string;
  createdAt?: string;
  updatedAt?: string;
}

type SocialMediaTemplateFormData = Omit<SocialMediaTemplate, 'imageFile' | 'imageUrl' | 'previewImage'> & {
  image?: string;
};

interface SocialMediaTemplateFormProps {
  initialData?: Partial<SocialMediaTemplate> | null;
  categoryOptions?: string[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const getStringValue = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.name || value.label || value.value || '';
};

const getAvailableForValue = (value: any): string => {
  const availableFor = getStringValue(value).toLowerCase();
  return ['admin', 'vendor', 'doctor', 'supplier'].includes(availableFor) ? availableFor : 'admin';
};

const getDefaultFormData = () => ({
  title: '',
  description: '',
  category: '',
  availableFor: 'admin',
  imageFile: null as File | null,
  imageUrl: undefined as string | undefined,
  previewImage: undefined as string | undefined,
  jsonData: null as any,
});

const buildFormDataFromInitial = (initialData: Partial<SocialMediaTemplate> | null | undefined) => {
  const data = initialData ?? {};
  if (Object.keys(data).length > 0) {
    let parsedJson = data.jsonData || null;
    if (typeof parsedJson === 'string' && parsedJson.trim()) {
      try {
        parsedJson = JSON.parse(parsedJson);
      } catch (e) {
        console.error("Failed to parse jsonData in buildFormDataFromInitial:", e);
        parsedJson = null;
      }
    }
    return {
      ...getDefaultFormData(),
      ...data,
      title: getStringValue(data.title),
      description: data.description || '',
      category: getStringValue(data.category),
      availableFor: getAvailableForValue(data.availableFor),
      imageUrl: data.imageUrl || undefined,
      previewImage: undefined,
      jsonData: parsedJson,
      imageFile: null as File | null,
    };
  }
  return getDefaultFormData();
};

function SocialMediaTemplateFormContent({
  initialData,
  categoryOptions = [],
  onCancel,
  isSubmitting = false,
  onSubmit,
}: SocialMediaTemplateFormProps): JSX.Element {
  const currentInitialData = useMemo(() => initialData ?? {}, [initialData]);

  const [formData, setFormData] = useState(() => buildFormDataFromInitial(initialData));
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<CanvasTemplateEditorRef>(null);

  const selectedCategory = getStringValue(currentInitialData.category);
  const categories = useMemo(() => {
    return Array.from(new Set([...categoryOptions, selectedCategory].filter(Boolean)));
  }, [categoryOptions, selectedCategory]);

  useEffect(() => {
    const built = buildFormDataFromInitial(initialData);
    setFormData(built);
    setImagePreview(initialData?.imageUrl || null);
  }, [initialData]);

  /**
   * Normalize any stored imageUrl to a displayable src.
   * Handles: base64, relative paths (/uploads/...), full URLs (any host/port).
   */
  const resolvedImagePreview = useMemo(() => {
    if (!imagePreview) return null;
    // Already a data URL — use as-is
    if (imagePreview.startsWith('data:image')) return imagePreview;
    
    // Normalize URL to current origin to handle local port mismatch (e.g. 3001 vs 3002)
    if (imagePreview.startsWith('http')) {
      try {
        const u = new URL(imagePreview);
        return u.pathname;
      } catch {
        return imagePreview;
      }
    }
    
    // Already a relative path — use as-is
    if (imagePreview.startsWith('/')) return imagePreview;
    // Plain filename — serve from current app uploads
    return `/uploads/${imagePreview}`;
  }, [imagePreview]);

  const handleSelectChange = (name: keyof SocialMediaTemplate, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.availableFor) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('availableFor', formData.availableFor);
      let finalJsonData = formData.jsonData;
      let finalPreviewImage = formData.previewImage;

      // Automatically capture the latest canvas state before saving if we are on the design tab
      if (activeTab === "design" && canvasRef.current) {
        const designData = canvasRef.current.applyDesign();
        if (designData) {
          finalJsonData = designData.jsonData;
          finalPreviewImage = designData.previewImage;
        }
      }

      if (finalJsonData) {
        formDataToSubmit.append('jsonData', JSON.stringify(finalJsonData));
      }
      
      // The canvas preview for the thumbnail (may be null if canvas was CORS-tainted)
      if (finalPreviewImage && finalPreviewImage.startsWith('data:image')) {
        formDataToSubmit.append('previewImage', finalPreviewImage);
      } else if (!finalPreviewImage && formData.imageUrl && formData.imageUrl.startsWith('data:image')) {
        formDataToSubmit.append('previewImage', formData.imageUrl);
      }

      // The original background image file (if changed)
      if (formData.imageFile) {
        formDataToSubmit.append('backgroundImage', formData.imageFile);
      }
      
      await onSubmit(formDataToSubmit);
    } catch (error) {
      // The parent's onSubmit (handleSocialMediaTemplateSubmit) already toasts the real error
      // and re-throws. Only show a fallback toast if no specific message was already shown.
      console.error('Error submitting form:', error);
    }
  };

  const handleCanvasTemplateData = (templateData: { jsonData: any; previewImage: string }) => {
    setFormData(prev => ({
      ...prev,
      jsonData: templateData.jsonData,
      previewImage: templateData.previewImage
    }));
    // NOTE: do NOT call setImagePreview here — that controls the background image
    // used to initialise the canvas. Overwriting it with the canvas JPEG would
    // re-trigger the canvas useEffect and dispose the live canvas.
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev: any) => ({ ...prev, imageFile: file, imageUrl: result }));
      };
      reader.onerror = () => toast.error('Error reading image file');
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        {/* Sticky tab switcher */}
        <TabsList className="grid w-full grid-cols-2 mb-4 sticky top-0 z-10 bg-background">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="design">Design Template</TabsTrigger>
        </TabsList>

        {/* ── Basic Info Tab ── */}
        <TabsContent value="basic" className="mt-0">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">

              {/* Left Column */}
              <div className="space-y-5">

                {/* Post Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Post Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter post title"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          No categories found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Available For */}
                <div className="space-y-2">
                  <Label htmlFor="availableFor">
                    Available For <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.availableFor}
                    onValueChange={(value) => handleSelectChange('availableFor', value)}
                  >
                    <SelectTrigger id="availableFor" className="w-full">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none overflow-y-auto"
                    placeholder="Enter post description"
                    style={{ minHeight: '110px', maxHeight: '180px' }}
                  />
                </div>

              </div>

              {/* Right Column – Image Upload */}
              <div className="space-y-2 flex flex-col">
                <Label>Background Image (Optional)</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent/30 transition-colors flex-1 flex flex-col justify-center items-center min-h-[200px]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={resolvedImagePreview as string}
                        alt="Preview"
                        className="max-h-44 mx-auto rounded-md object-contain"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow-md hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, imageFile: null, imageUrl: undefined }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload a background image or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

            </div>

            {/* Footer – sticky at bottom of scroll area */}
            <div className="sticky bottom-0 flex justify-end space-x-3 pt-4 pb-1 border-t bg-background">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              {formData.title && formData.category && formData.availableFor && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveTab("design")}
                  disabled={isSubmitting}
                >
                  Next: Design Template →
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {initialData?.id || initialData?._id ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>{initialData?.id || initialData?._id ? 'Update Template' : 'Save Template'}</>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ── Design Template Tab ── */}
        <TabsContent value="design" className="mt-0">
          {activeTab === "design" && (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(85vh - 9rem)", minHeight: 560 }}>
              {/* Canvas editor — fills all available height */}
              <div style={{ flex: 1, minHeight: 0, overflow: "hidden", borderRadius: 8, border: "1px solid var(--border)" }}>
                <CanvasTemplateEditor
                  ref={canvasRef}
                  initialImage={resolvedImagePreview || undefined}
                  initialJsonData={formData.jsonData || undefined}
                  onSaveTemplate={handleCanvasTemplateData}
                  width={680}
                />
              </div>

              {/* Footer actions */}
              <div className="shrink-0 flex justify-between pt-3 pb-1 border-t bg-background mt-3">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>
                  ← Back to Basic Info
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={onCancel}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {initialData?.id || initialData?._id ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      <>{initialData?.id || initialData?._id ? 'Update Template' : 'Save Template'}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default function SocialMediaTemplateForm(props: SocialMediaTemplateFormProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return <SocialMediaTemplateFormContent {...props} />;
}
