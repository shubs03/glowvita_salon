"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Image as ImageIcon, Loader2, Plus, RefreshCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import CanvasTemplateEditor from './CanvasTemplateEditor';

export interface SocialMediaTemplate {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageFile?: File | null;
  image?: string; // For base64 image data
  jsonData?: any; // For canvas JSON data
  category: string;
  availableFor: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type for the form submission data
type SocialMediaTemplateFormData = Omit<SocialMediaTemplate, 'imageFile' | 'imageUrl'> & {
  image?: string; // base64 string
};

interface SocialMediaTemplateFormProps {
  initialData?: Partial<SocialMediaTemplate> | null;
  categoryOptions?: string[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const getDefaultFormData = (): Omit<SocialMediaTemplate, 'id' | '_id' | 'createdAt' | 'updatedAt'> & { id?: string; _id?: string } => ({
  title: '',
  description: '',
  category: '',
  availableFor: 'admin', // Default value
  imageFile: null,
  imageUrl: undefined,
  jsonData: null,
});

// This is a workaround for the "Rendered more hooks than during the previous render" error
// by moving the conditional rendering into a separate component
function SocialMediaTemplateFormContent({ 
  initialData, 
  categoryOptions = [],
  onCancel,
  isSubmitting = false,
  onSubmit,
}: SocialMediaTemplateFormProps): JSX.Element {
  const currentInitialData = useMemo(() => initialData ?? {}, [initialData]);
  // State hooks
  const [formData, setFormData] = useState<ReturnType<typeof getDefaultFormData>>(getDefaultFormData());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categories = useMemo(() => {
    const selectedCategory = currentInitialData.category ? [currentInitialData.category] : [];
    return Array.from(new Set([...categoryOptions, ...selectedCategory].filter(Boolean)));
  }, [categoryOptions, currentInitialData.category]);

  // Initialize form data when component mounts or when initialData changes
  useEffect(() => {
    if (Object.keys(currentInitialData).length > 0) {
      setFormData({
        ...getDefaultFormData(),
        ...currentInitialData,
        title: currentInitialData.title || '',
        description: currentInitialData.description || '',
        category: currentInitialData.category || '',
        imageUrl: currentInitialData.imageUrl || '',
        jsonData: currentInitialData.jsonData || null,
      });
      
      if (currentInitialData.imageUrl) {
        setImagePreview(currentInitialData.imageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      // Reset to default if no initialData
      setFormData(getDefaultFormData());
      setImagePreview(null);
    }
  }, [currentInitialData]);

  const handleSelectChange = (name: keyof SocialMediaTemplate, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      
      // Add JSON data if available
      if (formData.jsonData) {
        formDataToSubmit.append('jsonData', JSON.stringify(formData.jsonData));
      }
      
      if (formData.imageFile) {
        formDataToSubmit.append('image', formData.imageFile);
      } else if (formData.imageUrl) {
        formDataToSubmit.append('image', formData.imageUrl);
      }
      
      await onSubmit(formDataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save template');
    }
  };

  const handleCanvasTemplateData = (templateData: { jsonData: any; previewImage: string }) => {
    setFormData(prev => ({
      ...prev,
      jsonData: templateData.jsonData,
      imageUrl: templateData.previewImage
    }));
    setImagePreview(templateData.previewImage);
    toast.success('Template design created! You can now save it.');
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
        setFormData((prev: any) => ({
          ...prev,
          imageFile: file,
          imageUrl: result
        }));
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast.error('Error reading image file');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-100px)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="design">Design Template</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 flex-1">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Post Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="availableFor">Available For <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.availableFor}
                    onValueChange={(value) => handleSelectChange('availableFor', value)}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter post description"
                  />
                </div>
              </div>
              
              {/* Right Column - Image Upload */}
              <div className="space-y-2">
                <Label>Background Image (Optional)</Label>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors h-full flex flex-col justify-center items-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, imageFile: null, imageUrl: '' }));
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <XCircle className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload a background image or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
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
            
            <div className="mt-auto flex justify-end space-x-3 p-6 border-t bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
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
        
        <TabsContent value="design" className="flex-1 overflow-y-auto">
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Design Your Template</h3>
              <p className="text-muted-foreground">
                Use the canvas editor below to create your template design. You can add text, images, and customize the layout.
              </p>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <CanvasTemplateEditor
                initialImage={imagePreview || undefined}
                onSaveTemplate={handleCanvasTemplateData}
                width={900}
                height={800}
              />
            </div>
            
            <div className="mt-6 flex justify-between bg-background py-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab("basic")}
              >
                ← Back to Basic Info
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                {formData.jsonData && (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {initialData?.id || initialData?._id ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      <>{initialData?.id || initialData?._id ? 'Update Template' : 'Save Complete Template'}</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
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

  if (!isMounted) {
    return null;
  }

  return <SocialMediaTemplateFormContent {...props} />;
}
