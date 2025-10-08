
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Package, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { toast } from 'sonner';

// Define SmsPackage interface locally since we're not importing it from the API
export interface SmsPackage {
  id: string;
  _id?: string;
  name: string;
  description: string;
  smsCount: number;
  price: number;
  validityDays: number;
  isPopular: boolean;
  features: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface SmsPackageFormProps {
  isOpen: boolean;
  onClose: () => void;
  packageData?: Partial<SmsPackage>;
  isEditMode?: boolean;
  onSubmit: (data: Partial<SmsPackage>) => Promise<void>;
}

const getDefaultFormData = (): Partial<SmsPackage> => ({
  id: '',
  name: '',
  description: '',
  smsCount: 1000,
  price: 0,
  validityDays: 30,
  isPopular: false,
  features: []
});

export function SmsPackageForm({ 
  isOpen, 
  onClose, 
  packageData,
  isEditMode = false,
  onSubmit 
}: SmsPackageFormProps) {
  const [formData, setFormData] = useState<Partial<SmsPackage>>(getDefaultFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when packageData changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      const initialData = packageData ? { 
        ...getDefaultFormData(),
        ...packageData 
      } : getDefaultFormData();
      
      setFormData(initialData);
    }
  }, [isOpen, packageData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.smsCount || formData.price === undefined || !formData.validityDays) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const dataToSubmit: Partial<SmsPackage> = {
        ...formData,
        smsCount: Number(formData.smsCount),
        price: Number(formData.price),
        validityDays: Number(formData.validityDays),
        features: Array.isArray(formData.features) ? formData.features : [],
        id: formData.id || formData._id,
        _id: formData._id || formData.id
      };
      
      await onSubmit(dataToSubmit);
      toast.success(`Package ${isEditMode ? 'updated' : 'created'} successfully`);
      onClose();
    } catch (error: any) {
      console.error('Failed to save package:', error);
      toast.error(error?.data?.message || 'Failed to save package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof SmsPackage, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle dialog close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle open change
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      handleClose();
    }
  }, [handleClose]);

  return (
    <Dialog.Root 
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">
              {isEditMode ? 'Edit' : 'Create'} SMS Package
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Starter Pack"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of the package"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smsCount">SMS Count *</Label>
                    <Input
                      id="smsCount"
                      type="number"
                      value={formData.smsCount || ''}
                      onChange={(e) => handleChange('smsCount', e.target.value)}
                      min="1"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleChange('price', e.target.value)}
                      min="0"
                      step="0.01"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="validityDays">Validity (Days) *</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    value={formData.validityDays || ''}
                    onChange={(e) => handleChange('validityDays', e.target.value)}
                    min="1"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Package details will be saved with default settings.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditMode ? 'Update Package' : 'Create Package'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default SmsPackageForm;
