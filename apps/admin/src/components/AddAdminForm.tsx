
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
  onSave: (data: AdminUser) => void;
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

  useEffect(() => {
    if (isOpen) {
        const initialFormState = getInitialFormData(initialData);
        setFormData(initialFormState);
        setSelectedPermissions(initialFormState.permissions || []);
    }
  }, [isOpen, initialData]);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditMode || formData.password) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
    }
    
    const dataToSave: AdminUser = {
      ...formData,
      permissions: selectedPermissions,
      photo: selectedFile || formData.photo,
      password: (isEditMode && !formData.password) ? undefined : formData.password,
      confirmPassword: (isEditMode && !formData.password) ? undefined : formData.confirmPassword,
    };
    
    onSave(dataToSave);
  };
  
  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this admin?')) {
      onDelete(formData.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Admin User' : 'Add New Admin'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the admin user details and permissions below.'
                : 'Fill in the details below to create a new admin user.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" name="designation" value={formData.designation} onChange={handleInputChange}/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="password">{isEditMode ? 'New Password (Optional)' : 'Password *'}</Label>
                <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleInputChange} required={!isEditMode}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{isEditMode ? 'Confirm New Password' : 'Confirm Password *'}</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword || ''} onChange={handleInputChange} required={!isEditMode} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.roleName} value={role.roleName}>
                        {role.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <textarea id="address" name="address" rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={formData.address} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
                <Label>Page Permissions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 rounded-md border p-4 max-h-64 overflow-y-auto">
                    {sidebarNavItems.map(item => (
                        <div key={item.permission} className="flex items-center space-x-2">
                            <Checkbox
                                id={`perm_${item.permission}`}
                                checked={selectedPermissions.includes(item.permission)}
                                onCheckedChange={(checked) => handlePermissionChange(item.permission, !!checked)}
                                disabled={formData.role === 'Super Admin'}
                            />
                            <label htmlFor={`perm_${item.permission}`} className="text-sm font-medium leading-none">
                                {item.title}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center w-full">
            <div>
              {isEditMode && onDelete && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Admin
                </Button>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? 'Update Admin' : 'Save Admin'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdminForm;
