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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { useCreateAdminMutation, useUpdateAdminMutation, useDeleteAdminMutation, useGetRegionsQuery } from '../../../../packages/store/src/services/api.js';

export type AdminUser = {
  _id?: string;
  id?: string;
  fullName: string;
  mobileNo: string;
  emailAddress: string;
  password?: string;
  confirmPassword?: string;
  roleName: string;
  designation: string;
  address: string;
  profileImage?: string | File;
  isActive?: boolean;
  assignedRegions?: string[];
  permissions?: string[];
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
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
  const { data: regionsResponse } = useGetRegionsQuery({});
  const regionsList = regionsResponse?.data || [];

  const getInitialFormData = (data: AdminUser | null) => ({
    fullName: '',
    mobileNo: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
    roleName: '',
    designation: '',
    address: '',
    permissions: [],
    assignedRegions: [],
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
      setSelectedRegions(initialFormState.assignedRegions || []);
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

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    const permission = `${module}:${action}`;
    
    setSelectedPermissions(prev => {
      let updated = checked ? [...prev, permission] : prev.filter(p => p !== permission);
      
      // If "all" is checked, add all other permissions for this module
      if (action === 'all' && checked) {
        updated = updated.filter(p => !p.startsWith(`${module}:`));
        updated.push(`${module}:all`);
      }
      
      // If "all" is unchecked, remove it
      if (action === 'all' && !checked) {
        updated = updated.filter(p => p !== `${module}:all`);
      }
      
      // If any other permission is checked while "all" exists, remove "all"
      if (action !== 'all' && checked && updated.includes(`${module}:all`)) {
        updated = updated.filter(p => p !== `${module}:all`);
      }
      
      return updated;
    });
  };

  const isPermissionChecked = (module: string, action: string) => {
    // If "all" is selected, show all checkboxes as checked
    if (selectedPermissions.includes(`${module}:all`)) {
      return true;
    }
    return selectedPermissions.includes(`${module}:${action}`);
  };

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const handleRegionToggle = (regionId: string, checked: boolean) => {
    setSelectedRegions(prev =>
      checked ? [...prev, regionId] : prev.filter(id => id !== regionId)
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = 'Mobile number is required';
    }

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Email is invalid';
    }

    if (!formData.roleName) {
      newErrors.roleName = 'Role is required';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
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
      // Handle file upload separately if needed
      let profileImageUrl = formData.profileImage;
      
      // If there's a new file selected, convert to base64
      if (selectedFile) {
        const fileBase64 = await convertFileToBase64(selectedFile);
        profileImageUrl = fileBase64;
      }
      
      // Prepare JSON data matching MongoDB schema
      const jsonDataToSend = {
        fullName: formData.fullName.trim(),
        mobileNo: formData.mobileNo.trim(),
        emailAddress: formData.emailAddress.trim(),
        roleName: formData.roleName,
        designation: formData.designation.trim(),
        address: formData.address.trim(),
        permissions: selectedPermissions,
        assignedRegions: selectedRegions,
        isActive: formData.isActive ?? true,
        updatedAt: new Date().toISOString(),
        ...(profileImageUrl && { profileImage: profileImageUrl }),
        // Only include password fields if needed
        ...(!isEditMode || formData.password ? { 
          password: formData.password 
        } : {}),
        // Add createdAt only for new admin
        ...(!isEditMode ? { 
          createdAt: new Date().toISOString() 
        } : {}),
      };
      
      if (isEditMode && (formData.id || formData._id)) {
        // Update existing admin
        await updateAdmin({
          id: formData.id || formData._id!,
          data: jsonDataToSend
        }).unwrap();
      } else {
        // Create new admin
        await createAdmin(jsonDataToSend).unwrap();
      }
      
      // Call onSave callback if provided (for backward compatibility)
      if (onSave) {
        const dataToSave: AdminUser = {
          ...formData,
          permissions: selectedPermissions,
          profileImage: profileImageUrl,
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

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Alternative: Upload file separately (uncomment if using separate file upload endpoint)
  // const uploadFile = async (file: File): Promise<string> => {
  //   const fileFormData = new FormData();
  //   fileFormData.append('file', file);
  //   
  //   const response = await fetch('/api/upload', {
  //     method: 'POST',
  //     body: fileFormData,
  //   });
  //   
  //   if (!response.ok) {
  //     throw new Error('File upload failed');
  //   }
  //   
  //   const result = await response.json();
  //   return result.url;
  // };
  
  const handleDelete = async () => {
    const adminId = formData.id || formData._id;
    if (!adminId) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this admin?');
    if (!confirmed) return;
    
    try {
      await deleteAdmin(adminId).unwrap();
      
      // Call onDelete callback if provided (for backward compatibility)
      if (onDelete) {
        onDelete(adminId);
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
                  <Label htmlFor="mobileNo" className="text-sm">Mobile Number *</Label>
                  <Input 
                    id="mobileNo" 
                    name="mobileNo" 
                    type="tel" 
                    value={formData.mobileNo} 
                    onChange={handleInputChange} 
                    className={`text-sm ${errors.mobileNo ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    required 
                  />
                  {errors.mobileNo && <p className="text-xs text-destructive">{errors.mobileNo}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailAddress" className="text-sm">Email Address *</Label>
                  <Input 
                    id="emailAddress" 
                    name="emailAddress" 
                    type="email" 
                    value={formData.emailAddress} 
                    onChange={handleInputChange} 
                    className={`text-sm ${errors.emailAddress ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    required 
                  />
                  {errors.emailAddress && <p className="text-xs text-destructive">{errors.emailAddress}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-sm">Designation *</Label>
                  <Input 
                    id="designation" 
                    name="designation" 
                    value={formData.designation} 
                    onChange={handleInputChange}
                    className={`text-sm ${errors.designation ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    required
                  />
                  {errors.designation && <p className="text-xs text-destructive">{errors.designation}</p>}
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
                  <Label htmlFor="roleName" className="text-sm">Role *</Label>
                  <Select 
                    value={formData.roleName} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, roleName: value }));
                      if (errors.roleName) {
                        setErrors(prev => ({ ...prev, roleName: '' }));
                      }
                    }} 
                    disabled={isLoading}
                    required
                  >
                    <SelectTrigger className={`text-sm ${errors.roleName ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPER_ADMIN" className="text-sm">SUPER_ADMIN</SelectItem>
                      <SelectItem value="REGIONAL_ADMIN" className="text-sm">REGIONAL_ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.roleName && <p className="text-xs text-destructive">{errors.roleName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profileImage" className="text-sm">Profile Image</Label>
                  <Input 
                    id="profileImage" 
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
                <Label htmlFor="address" className="text-sm">Address *</Label>
                <textarea 
                  id="address" 
                  name="address" 
                  rows={3} 
                  className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${errors.address ? 'border-destructive' : ''}`}
                  value={formData.address} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>
            </div>

            {/* Region Assignment Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium border-b pb-2">Region Assignment</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Select regions this admin will be responsible for. This will filter the data they can see.
              </p>
              
              <div className="rounded-md border p-3 sm:p-4 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {regionsList.map((region: any) => (
                    <div key={region._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region_${region._id}`}
                        checked={selectedRegions.includes(region._id)}
                        onCheckedChange={(checked) => handleRegionToggle(region._id, !!checked)}
                        disabled={isLoading}
                      />
                      <label 
                        htmlFor={`region_${region._id}`} 
                        className="text-xs sm:text-sm font-medium leading-none cursor-pointer"
                      >
                        {region.name} ({region.code})
                      </label>
                    </div>
                  ))}
                  {regionsList.length === 0 && (
                    <p className="text-sm text-muted-foreground">No regions available. Create regions first.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium border-b pb-2">Granular Permissions</h3>
              
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Module / Page</TableHead>
                      <TableHead className="text-center">All</TableHead>
                      <TableHead className="text-center">View</TableHead>
                      <TableHead className="text-center">Edit</TableHead>
                      <TableHead className="text-center">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sidebarNavItems.map(item => (
                      <TableRow key={item.permission}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            id={`all_${item.permission}`}
                            checked={isPermissionChecked(item.permission, 'all')}
                            onCheckedChange={(checked) => handlePermissionChange(item.permission, 'all', !!checked)}
                            disabled={formData.roleName === 'SUPER_ADMIN' || isLoading}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            id={`view_${item.permission}`}
                            checked={isPermissionChecked(item.permission, 'view')}
                            onCheckedChange={(checked) => handlePermissionChange(item.permission, 'view', !!checked)}
                            disabled={formData.roleName === 'SUPER_ADMIN' || isLoading}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            id={`edit_${item.permission}`}
                            checked={isPermissionChecked(item.permission, 'edit')}
                            onCheckedChange={(checked) => handlePermissionChange(item.permission, 'edit', !!checked)}
                            disabled={formData.roleName === 'SUPER_ADMIN' || isLoading}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            id={`delete_${item.permission}`}
                            checked={isPermissionChecked(item.permission, 'delete')}
                            onCheckedChange={(checked) => handlePermissionChange(item.permission, 'delete', !!checked)}
                            disabled={formData.roleName === 'SUPER_ADMIN' || isLoading}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {formData.roleName === 'SUPER_ADMIN' && (
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