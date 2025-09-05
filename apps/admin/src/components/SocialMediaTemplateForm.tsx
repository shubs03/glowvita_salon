
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Image as ImageIcon, Loader2, Plus, RefreshCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";

export interface SocialMediaTemplate {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageFile?: File | null;
  image?: string; // For base64 image data
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
  initialData?: Partial<SocialMediaTemplate>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const defaultCategories = [
  'Happy Birthday',
  'Anniversary Wishes',
  'Congratulations',
  'Holiday Greetings',
  'New Year Wishes',
  'Valentine\'s Day',
  'Mother\'s Day',
  'Father\'s Day',
  'Christmas',
  'Thanksgiving',
  'Easter',
  'Halloween',
  'Welcome Messages',
  'Thank You Posts',
  'Motivational Quotes',
  'Inspirational Messages',
  'Special Announcements',
  'Product Launch',
  'Service Promotion',
  'Seasonal Offers',
  'Flash Sales',
  'Grand Opening',
  'Event Invitations',
  'Behind the Scenes',
  'Team Introductions',
  'Customer Testimonials',
  'Before & After',
  'Tips & Tutorials',
  'Fun Facts',
  'Trivia Posts',
  'Quote of the Day',
  'Wellness Tips',
  'Beauty Tips',
  'Lifestyle Posts',
  'Community Events',
  'Charity & Causes',
  'Award & Recognition',
  'Milestone Celebrations',
  'Success Stories',
  'General Greetings'
];

const getDefaultFormData = (): Omit<SocialMediaTemplate, 'id' | '_id' | 'createdAt' | 'updatedAt'> & { id?: string; _id?: string } => ({
  title: '',
  description: '',
  category: '',
  availableFor: 'admin', // Default value
  imageFile: null,
  imageUrl: undefined,
});

// This is a workaround for the "Rendered more hooks than during the previous render" error
// by moving the conditional rendering into a separate component
function SocialMediaTemplateFormContent({ 
  initialData = {}, 
  onCancel,
  isSubmitting = false,
  onSubmit,
}: SocialMediaTemplateFormProps): JSX.Element {
  // State hooks
  const [formData, setFormData] = useState<ReturnType<typeof getDefaultFormData>>(getDefaultFormData());
  const [categories, setCategories] = useState<string[]>([...defaultCategories]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when component mounts or when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        ...getDefaultFormData(),
        ...initialData,
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        imageUrl: initialData.imageUrl || '',
      });
      
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      // Reset to default if no initialData
      setFormData(getDefaultFormData());
      setImagePreview(null);
    }
    
    // Load saved categories from localStorage if available
    try {
      const savedCategories = localStorage.getItem('socialMediaCategories');
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          // Merge with default categories and remove duplicates
          const mergedCategories = [...defaultCategories, ...parsedCategories];
          const allCategories = mergedCategories.filter((category, index) => 
            mergedCategories.indexOf(category) === index
          );
          // Update local storage with merged categories
          localStorage.setItem('socialMediaCategories', JSON.stringify(allCategories));
          setCategories(allCategories);
        } else {
          setCategories(defaultCategories);
        }
      } else {
        // Initialize with default categories
        localStorage.setItem('socialMediaCategories', JSON.stringify(defaultCategories));
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
      setCategories(defaultCategories);
    }
  }, [initialData]);

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
      if (formData.imageFile) {
        formDataToSubmit.append('image', formData.imageFile);
      } else if (formData.imageUrl) {
        formDataToSubmit.append('image', formData.imageUrl); // Send existing URL if no new file
      }
      
      await onSubmit(formDataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save template');
    }
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
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
          
          {/* Right Column */}
          <div className="space-y-2">
            <Label>Image</Label>
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
                    Click to upload an image or drag and drop
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
        
        <div className="mt-6 flex justify-end space-x-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
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
