"use client";

import { useState, useEffect } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Checkbox } from "@repo/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { sidebarNavItems } from '@/lib/routes';
import { Trash2, Loader2 } from 'lucide-react';
import { useCreateAdminMutation, useUpdateAdminMutation, useDeleteAdminMutation } from '../../../../packages/store/src/services/api.js';

export type AdminUser = {
  id?: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: string;
  designation: string;
  address: string;
  photo?: string | File;
  isActive?: boolean;
  permissions?: string[];
};

type AdminRole = {
  roleName: string;
};

type AddAdminFormProps = {
  isOpen: boolean;
  onClose: () => void;
  roles: AdminRole[];
  initialData?: AdminUser | null;
  onSave?: (data: AdminUser) => void;
  onDelete?: (id?: string) => void;
  isEditMode?: boolean;
};

export function AddAdminForm({ 
  isOpen, 
  onClose, 
  roles, 
  initialData = null,
  onSave,
  onDelete,
  isEditMode = false
}: AddAdminFormProps) {
    
  // RTK Query hooks
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const getInitialFormData = (data: AdminUser | null) => ({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    designation: '',
    address: '',
    permissions: [],
    ...data
  });
    
  const [formData, setFormData] = useState<AdminUser>(getInitialFormData(initialData));
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const initialFormState = getInitialFormData(initialData);
      setFormData(initialFormState);
      setSelectedPermissions(initialFormState.permissions || []);
      setSelectedFile(null);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked ? [...prev, permission] : prev.filter(p => p !== permission)
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Password validation for new admin or when changing password
    if (!isEditMode || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('mobileNumber', formData.mobileNumber);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('designation', formData.designation);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('permissions', JSON.stringify(selectedPermissions));
      
      // Append password fields if needed
      if (!isEditMode || formData.password) {
        formDataToSend.append('password', formData.password || '');
      }
      
      // Append file if selected
      if (selectedFile) {
        formDataToSend.append('photo', selectedFile);
      }
      
      if (isEditMode && formData.id) {
        // Update existing admin
        await updateAdmin({
          id: formData.id,
          data: formDataToSend
        }).unwrap();
      } else {
        // Create new admin
        await createAdmin(formDataToSend).unwrap();
      }
      
      // Call onSave callback if provided (for backward compatibility)
      if (onSave) {
        const dataToSave: AdminUser = {
          ...formData,
          permissions: selectedPermissions,
          photo: selectedFile || formData.photo,
          password: (isEditMode && !formData.password) ? undefined : formData.password,
          confirmPassword: (isEditMode && !formData.password) ? undefined : formData.confirmPassword,
        };
        onSave(dataToSave);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving admin:', error);
      // Handle API errors
      if (error.data?.message) {
        setErrors({ general: error.data.message });
      } else {
        setErrors({ general: 'An error occurred while saving the admin' });
      }
    }
  };
  
  const handleDelete = async () => {
    if (!formData.id) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this admin?');
    if (!confirmed) return;
    
    try {
      await deleteAdmin(formData.id).unwrap();
      
      // Call onDelete callback if provided (for backward compatibility)
      if (onDelete) {
        onDelete(formData.id);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      setErrors({ general: 'An error occurred while deleting the admin' });
    }
  };

  const isLoading = isCreating || isUpdating || isDeleting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
            <DialogTitle className="text-lg sm:text-xl">
              {isEditMode ? 'Edit Admin User' : 'Add New Admin'}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {isEditMode 
                ? 'Update the admin user details and permissions below.'
                : 'Fill in the details below to create a new admin user.'}
            </DialogDescription>
          </DialogHeader>
          
          {errors.general && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
              {errors.general}
            </div>
          )}
          
          <div className="grid gap-4 sm:gap-6 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    className={`text-sm ${errors.fullName ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    required 
                  />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-sm">Mobile Number *</Label>
                  <Input 
                    id="mobileNumber" 
                    name="mobileNumber" 
                    type="tel" 
                    value={formData.mobileNumber} 
                    onChange={handleInputChange} 
                    className={`text-sm ${errors.mobileNumber ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    required 
                  />
                  {errors.mobileNumber && <p className="text-xs text-destructive">{errors.mobileNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className={`text-sm ${errors.email ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    required 
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-sm">Designation</Label>
                  <Input 
                    id="designation" 
                    name="designation" 
                    value={formData.designation} 
                    onChange={handleInputChange}
                    className="text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium border-b pb-2">Security</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    {isEditMode ? 'New Password (Optional)' : 'Password *'}
                  </Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    value={formData.password || ''} 
                    onChange={handleInputChange} 
                    className={`text-sm ${errors.password ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    required={!isEditMode}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm">
                    {isEditMode ? 'Confirm New Password' : 'Confirm Password *'}
                  </Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    value={formData.confirmPassword || ''} 
                    onChange={handleInputChange} 
                    className={`text-sm ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    required={!isEditMode || !!formData.password} 
                  />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Role & Profile Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium border-b pb-2">Role & Profile</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm">Role *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, role: value }));
                      if (errors.role) {
                        setErrors(prev => ({ ...prev, role: '' }));
                      }
                    }} 
                    disabled={isLoading}
                    required
                  >
                    <SelectTrigger className={`text-sm ${errors.role ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.roleName} value={role.roleName} className="text-sm">
                          {role.roleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="photo" className="text-sm">Photo</Label>
                  <Input 
                    id="photo" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium border-b pb-2">Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Address</Label>
                <textarea 
                  id="address" 
                  name="address" 
                  rows={3} 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" 
                  value={formData.address} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Permissions Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium border-b pb-2">Page Permissions</h3>
              
              <div className="rounded-md border p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {sidebarNavItems.map(item => (
                    <div key={item.permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm_${item.permission}`}
                        checked={selectedPermissions.includes(item.permission)}
                        onCheckedChange={(checked) => handlePermissionChange(item.permission, !!checked)}
                        disabled={formData.role === 'Super Admin' || isLoading}
                        className="flex-shrink-0"
                      />
                      <label 
                        htmlFor={`perm_${item.permission}`} 
                        className="text-xs sm:text-sm font-medium leading-none cursor-pointer"
                      >
                        {item.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {formData.role === 'Super Admin' && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Super Admin has access to all permissions by default.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-3 sm:gap-0 pt-4 border-t">
            <div className="order-2 sm:order-1">
              {isEditMode && onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isLoading}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Admin
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                size="sm"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                size="sm"
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Admin' : 'Create Admin'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdminForm;