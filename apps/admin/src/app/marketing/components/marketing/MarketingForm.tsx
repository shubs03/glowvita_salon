import { useState, useEffect } from 'react';
import { useAppDispatch } from '@repo/store/hooks';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Button } from '@repo/ui/button';
import { 
  useCreateSmsPackageMutation,
  useUpdateSmsPackageMutation,
  useCreateSmsTemplateMutation,
  useUpdateSmsTemplateMutation,
  useCreateSocialPostMutation,
  useUpdateSocialPostMutation
} from '@repo/store/slices/marketingSlice';

type FormType = 'sms_template' | 'sms_package' | 'social_post';

interface FormData {
  id?: string;
  name?: string;
  type?: string;
  price?: number;
  content?: string;
  smsCount?: number;
  validityDays?: number;
  description?: string;
  title?: string;
  platform?: string;
  scheduledDate?: string | null;
  image?: File | string | null;
  imagePreview?: string;
}

interface MarketingFormProps {
  type: FormType;
  data?: FormData;
  onSuccess: () => void;
  mode?: 'view' | 'edit' | 'add';
}

export function MarketingForm({ type, data: initialData = {}, onSuccess, mode = 'add' }: MarketingFormProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<FormData>({
    ...initialData,
    image: initialData.image || null,
    imagePreview: initialData.image ? String(initialData.image) : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // RTK Query mutations
  const [createSmsPackage] = useCreateSmsPackageMutation();
  const [updatePackage] = useUpdateSmsPackageMutation();
  const [createSmsTemplate] = useCreateSmsTemplateMutation();
  const [updateTemplate] = useUpdateSmsTemplateMutation();
  const [createSocialPost] = useCreateSocialPostMutation();
  const [updateSocialPost] = useUpdateSocialPostMutation();

  // Update local state when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData.image && !initialData.imagePreview) {
      // If there's an image but no preview, create one
      setFormData({
        ...initialData,
        imagePreview: initialData.image.startsWith('data:image') 
          ? initialData.image 
          : initialData.image
      });
    } else {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const dataToSave = { ...formData };
      
      // Convert price to number if it exists
      if (dataToSave.price !== undefined) {
        dataToSave.price = Number(dataToSave.price);
      }

      if (type === 'sms_template') {
        if (formData.id) {
          const result = await updateTemplate({ id: formData.id, ...dataToSave });
          if ('error' in result) {
            throw new Error('Failed to update SMS template');
          }
        } else {
          const result = await createSmsTemplate(dataToSave);
          if ('error' in result) {
            throw new Error('Failed to create SMS template');
          }
        }
      } else if (type === 'sms_package') {
        if (formData.id) {
          const result = await updatePackage({ id: formData.id, ...dataToSave });
          if ('error' in result) {
            throw new Error('Failed to update SMS package');
          }
        } else {
          const result = await createSmsPackage(dataToSave);
          if ('error' in result) {
            throw new Error('Failed to create SMS package');
          }
        }
      } else if (type === 'social_post') {
        if (formData.id) {
          const result = await updateSocialPost({ id: formData.id, ...dataToSave });
          if ('error' in result) {
            throw new Error('Failed to update social post');
          }
        } else {
          const result = await createSocialPost(dataToSave);
          if ('error' in result) {
            throw new Error('Failed to create social post');
          }
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save:', error);
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSmsTemplateForm = () => (
    <form id="sms-template-form" onSubmit={handleSubmit} className="space-y-6">
      {mode === 'view' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Template Details</h3>
              <p className="mt-1 text-sm text-gray-500">View template information and content</p>
            </div>
            
            <div className="px-6 py-4 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Template Name</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    {formData.name || 'N/A'}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Template Type</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    {formData.type || 'N/A'}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Price (₹)</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    {formData.price ? `₹${(formData.price / 100).toFixed(2)}` : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Content</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {formData.content || 'No content available'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Welcome Message"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-price">Price (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-gray-500">₹</span>
                <Input
                  id="template-price"
                  type="number"
                  value={formData.price ? formData.price / 100 : ''}
                  onChange={(e) => handleChange('price', Math.round(Number(e.target.value) * 100))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-8"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-type">Template Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange('type', value)}
              required
            >
              <SelectTrigger id="template-type">
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="transactional">Transactional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-content">Content</Label>
            <Textarea
              id="template-content"
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Enter your template content here..."
              required
              rows={6}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );

  const renderSmsPackageForm = () => (
    <form id="sms-package-form" onSubmit={handleSubmit} className="space-y-6">
      {mode === 'view' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Package Details</h3>
              <p className="mt-1 text-sm text-gray-500">View package information and description</p>
            </div>
            
            <div className="px-6 py-4 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Package Name</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    {formData.name || 'N/A'}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">SMS Count</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    {formData.smsCount?.toLocaleString() || '0'}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Price</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    ₹{formData.price ? (formData.price / 100).toFixed(2) : '0.00'}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Scheduled Date</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleString() : 'Not scheduled'}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {formData.description || 'No description available'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="package-name">Package Name</Label>
            <Input
              id="package-name"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Starter Pack"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sms-count">SMS Count</Label>
              <Input
                id="sms-count"
                type="number"
                value={formData.smsCount || ''}
                onChange={(e) => handleChange('smsCount', Number(e.target.value))}
                placeholder="e.g., 1000"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity-days">Validity (Days)</Label>
              <Input
                id="validity-days"
                type="number"
                value={formData.validityDays || ''}
                onChange={(e) => handleChange('validityDays', Number(e.target.value))}
                placeholder="e.g., 30"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="package-price">Price (₹)</Label>
              <Input
                id="package-price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                placeholder="e.g., 999"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="package-desc">Description</Label>
            <Textarea
              id="package-desc"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter package description..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Package'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );

  const renderSocialPostForm = () => {
    if (mode === 'view') {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Social Media Post</h3>
              <p className="mt-1 text-sm text-gray-500">View post details and content</p>
            </div>
            
            <div className="px-6 py-4 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Post Title</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    {formData.title || 'N/A'}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Platform</Label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formData.platform ? formData.platform.charAt(0).toUpperCase() + formData.platform.slice(1) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Price</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    ₹{formData.price ? (formData.price / 100).toFixed(2) : '0.00'}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Scheduled Date</Label>
                  <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200">
                    {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleString() : 'Not scheduled'}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Content</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {formData.content || 'No content available'}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Image</Label>
                {formData.image || formData.imagePreview ? (
                  <div className="mt-2">
                    <img 
                      src={formData.imagePreview || formData.image} 
                      alt="Post preview" 
                      className="max-h-48 w-auto rounded-md border border-gray-200"
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        // Try to fallback to the original image if preview fails
                        if (formData.image && formData.image !== formData.imagePreview) {
                          const img = e.target as HTMLImageElement;
                          img.src = formData.image;
                        }
                      }}
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {formData.image?.startsWith('data:') ? 'Base64 image' : 
                       formData.image?.startsWith('http') ? 'External image' : 
                       'Local image'}
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-gray-500">No image available</div>
                )}
              </div>

              {formData.description && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {formData.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <form id="social-post-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="post-title">Post Title</Label>
              <Input
                id="post-title"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Summer Sale"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => handleChange('platform', value)}
                required
              >
                <SelectTrigger id="post-platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Scheduled Date & Time</Label>
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange('scheduledDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to publish immediately</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-price">Price (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-gray-500">₹</span>
                <Input
                  id="post-price"
                  type="number"
                  value={formData.price ? formData.price / 100 : ''}
                  onChange={(e) => handleChange('price', Math.round(Number(e.target.value) * 100))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-8"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-content">Content</Label>
            <Textarea
              id="post-content"
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Write your post content here..."
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            {formData.imagePreview ? (
              <div className="mt-2">
                <div className="relative w-full max-w-xs">
                  <img 
                    src={formData.imagePreview} 
                    alt="Preview" 
                    className="rounded-md border border-gray-200 w-full h-auto max-h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Click the X to remove the image</p>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="post-image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload an image</span>
                      <input
                        id="post-image"
                        name="post-image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-desc">Description</Label>
            <Textarea
              id="post-desc"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="A brief description of the post (optional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Post'}
            </Button>
          </div>
        </div>
      </form>
    );
  };

  // Main render function
  const renderFormContent = () => {
    switch (type) {
      case 'sms_template':
        return renderSmsTemplateForm();
      case 'sms_package':
        return renderSmsPackageForm();
      case 'social_post':
        return renderSocialPostForm();
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {renderFormContent()}
      </div>
    </div>
  );
}

export default MarketingForm;