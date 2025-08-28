"use client";

import { useState, useEffect } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import * as Dialog from "@radix-ui/react-dialog";
import { X, MessageSquare, Save, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

export interface SmsTemplate {
  id?: string;
  _id?: string;
  name: string;
  content: string;
  type: string;
  status: string;
  variables?: Array<{ name: string; description: string }>;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface SmsTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  templateData?: Partial<SmsTemplate>;
  isEditMode?: boolean;
  onSubmit: (data: SmsTemplate) => Promise<void>;
}

const templateTypes = [
  { value: 'Promotional', label: 'Promotional' },
  { value: 'Transactional', label: 'Transactional' },
  { value: 'Service', label: 'Service' },
  { value: 'Alert', label: 'Alert' },
  { value: 'Other', label: 'Other' },
];

const getDefaultFormData = (): SmsTemplate => ({
  name: '',
  content: '',
  type: 'Promotional',
  status: 'Active',
  variables: [],
  price: 0,
  id: '',
  _id: ''
});

export function SmsTemplateForm({ 
  isOpen, 
  onClose, 
  templateData = {}, 
  isEditMode = false,
  onSubmit 
}: SmsTemplateFormProps) {
  const [formData, setFormData] = useState<SmsTemplate>(getDefaultFormData());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialData = templateData && Object.keys(templateData).length > 0 
        ? {
            ...getDefaultFormData(),
            ...templateData,
            id: templateData.id || templateData._id,
            _id: templateData._id || templateData.id
          }
        : getDefaultFormData();
      
      setFormData(initialData);
      updatePreview(initialData.content || '');
    } else {
      // Reset form when closing
      setFormData(getDefaultFormData());
      setPreviewContent('');
    }
  }, [isOpen, templateData]);

  const handleChange = (field: keyof SmsTemplate, value: string | number) => {
    const newData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newData);

    if (field === 'content') {
      updatePreview(value as string);
    }
  };

  const updatePreview = (content: string) => {
    const preview = content.replace(/\{\{([^}]+)\}\}/g, (match, varName) => 
      `<span class="bg-blue-100 text-blue-800 px-1 rounded">${varName.trim()}</span>`
    );
    setPreviewContent(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        id: formData.id || formData._id,
        _id: formData._id || formData.id
      };
      
      await onSubmit(dataToSubmit);
      toast.success(`Template ${isEditMode ? 'updated' : 'created'} successfully`);
      onClose();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error?.data?.message || 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-0 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-50">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <Dialog.Title className="text-lg font-semibold">
                {isEditMode ? 'Edit' : 'Create New'} SMS Template
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </Dialog.Close>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="px-6 pt-2 border-b rounded-none">
              <TabsTrigger value="details">Template Details</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <TabsContent value="details" className="m-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Enter the template details below.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-medium">
                            Template Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g., Appointment Confirmation"
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type" className="font-medium">
                            Type <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => handleChange('type', value)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {templateTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status" className="font-medium">
                            Status <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => handleChange('status', value)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                              <SelectItem value="Draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="price" className="font-medium">
                            Price (₹)
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                            placeholder="e.g., 99.99"
                            disabled={isSubmitting}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="content" className="font-medium">
                            Template Content <span className="text-destructive">*</span>
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            Use {'{{variable}}'} for dynamic content
                          </div>
                        </div>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => handleChange('content', e.target.value)}
                          placeholder="e.g., Hello {{name}}, your appointment is confirmed for {{date}} at {{time}}."
                          rows={6}
                          className="font-mono text-sm min-h-[120px]"
                          disabled={isSubmitting}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Template Preview</CardTitle>
                      <CardDescription>
                        This is how your template will appear to users.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-gray-50 rounded-md border">
                        <div className="font-medium mb-2">{formData.name || 'Template Name'}</div>
                        <div 
                          className="whitespace-pre-wrap text-sm text-gray-800"
                          dangerouslySetInnerHTML={{ 
                            __html: previewContent || 
                              (formData.content || 'Your template content will appear here')
                          }}
                        ></div>
                        {!formData.content && (
                          <div className="text-sm text-muted-foreground mt-2">
                            Start typing in the content field to see a preview here.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
              
              <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditMode ? 'Update Template' : 'Create Template'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default SmsTemplateForm;
