
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/tabs';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Checkbox } from '@repo/ui/checkbox';
import { Switch } from '@repo/ui/switch';
import { useCreateStaffMutation, useUpdateStaffMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { vendorNavItems } from '@/lib/routes';
import { Eye, EyeOff, Plus, Trash2, Clock, Calendar } from 'lucide-react';

interface StaffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff?: any;
    onSuccess: () => void;
}

export const StaffFormModal = ({ isOpen, onClose, staff, onSuccess }: StaffFormModalProps) => {
    const { user } = useCrmAuth();
    const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
    const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
    const [activeTab, setActiveTab] = useState('personal');
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState<any>({
        fullName: '',
        position: '',
        mobileNo: '',
        emailAddress: '',
        photo: null,
        description: '',
        salary: '',
        startDate: '',
        endDate: '',
        yearOfExperience: '',
        clientsServed: '',
        commission: false,
        permissions: [],
        password: '',
        confirmPassword: '',
        // Individual day availability fields to match Staff model
        sundayAvailable: true,
        sundaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        mondayAvailable: true,
        mondaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        tuesdayAvailable: true,
        tuesdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        wednesdayAvailable: true,
        wednesdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        thursdayAvailable: true,
        thursdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        fridayAvailable: true,
        fridaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        saturdayAvailable: true,
        saturdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
        // Block times array to match Staff model
        blockedTimes: [],
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            bankName: '',
            ifscCode: '',
            upiId: '',
        }
    });

    useEffect(() => {
        if (staff) {
            setFormData({
                fullName: staff.fullName || '',
                position: staff.position || '',
                mobileNo: staff.mobileNo || '',
                emailAddress: staff.emailAddress || '',
                photo: staff.photo || null,
                description: staff.description || '',
                salary: staff.salary || '',
                startDate: staff.startDate ? new Date(staff.startDate).toISOString().split('T')[0] : '',
                endDate: staff.endDate ? new Date(staff.endDate).toISOString().split('T')[0] : '',
                yearOfExperience: staff.yearOfExperience || '',
                clientsServed: staff.clientsServed || '',
                commission: staff.commission || false,
                permissions: staff.permissions || [],
                password: '',
                confirmPassword: '',
                // Individual day availability fields from Staff model
                sundayAvailable: staff.sundayAvailable !== undefined ? staff.sundayAvailable : true,
                sundaySlots: staff.sundaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                mondayAvailable: staff.mondayAvailable !== undefined ? staff.mondayAvailable : true,
                mondaySlots: staff.mondaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                tuesdayAvailable: staff.tuesdayAvailable !== undefined ? staff.tuesdayAvailable : true,
                tuesdaySlots: staff.tuesdaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                wednesdayAvailable: staff.wednesdayAvailable !== undefined ? staff.wednesdayAvailable : true,
                wednesdaySlots: staff.wednesdaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                thursdayAvailable: staff.thursdayAvailable !== undefined ? staff.thursdayAvailable : true,
                thursdaySlots: staff.thursdaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                fridayAvailable: staff.fridayAvailable !== undefined ? staff.fridayAvailable : true,
                fridaySlots: staff.fridaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                saturdayAvailable: staff.saturdayAvailable !== undefined ? staff.saturdayAvailable : true,
                saturdaySlots: staff.saturdaySlots || [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                // Block times from Staff model
                blockedTimes: staff.blockedTimes || [],
                bankDetails: staff.bankDetails || {
                    accountHolderName: '',
                    accountNumber: '',
                    bankName: '',
                    ifscCode: '',
                    upiId: '',
                },
            });
        } else {
            // Reset form for new entry
            setFormData({
                fullName: '', position: '', mobileNo: '', emailAddress: '', photo: null, description: '',
                salary: '', startDate: '', endDate: '', yearOfExperience: '', clientsServed: '', commission: false, permissions: [],
                password: '', confirmPassword: '',
                // Individual day availability fields for new staff
                sundayAvailable: true,
                sundaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                mondayAvailable: true,
                mondaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                tuesdayAvailable: true,
                tuesdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                wednesdayAvailable: true,
                wednesdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                thursdayAvailable: true,
                thursdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                fridayAvailable: true,
                fridaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                saturdayAvailable: true,
                saturdaySlots: [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }],
                blockedTimes: [],
                bankDetails: { accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '', upiId: '' }
            });
        }
        setActiveTab('personal');
    }, [staff, isOpen]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails,
                [name]: value,
            }
        }));
    };
    
    const handleTimingChange = (day: string, field: string, value: any) => {
        if (field === 'isWorking') {
            // Update the availability field for the day
            const availableField = `${day}Available`;
            setFormData((prev: any) => ({
                ...prev,
                [availableField]: value
            }));
        } else {
            // Update the slots for the day
            const slotsField = `${day}Slots`;
            const timeToMinutes = (timeStr: string) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };
            
            setFormData((prev: any) => {
                const currentSlots = prev[slotsField] || [];
                const updatedSlots = currentSlots.length > 0 ? [...currentSlots] : [{ startTime: '10:00', endTime: '19:00', startMinutes: 600, endMinutes: 1140 }];
                
                if (field === 'startTime') {
                    updatedSlots[0] = {
                        ...updatedSlots[0],
                        startTime: value,
                        startMinutes: timeToMinutes(value)
                    };
                } else if (field === 'endTime') {
                    updatedSlots[0] = {
                        ...updatedSlots[0],
                        endTime: value,
                        endMinutes: timeToMinutes(value)
                    };
                }
                
                return {
                    ...prev,
                    [slotsField]: updatedSlots
                };
            });
        }
    };
    
    const handleBlockTimeChange = (index: number, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            blockedTimes: (prev.blockedTimes as any[]).map((entry: any, i: number) => {
                if (i === index) {
                    const updatedEntry = { ...entry, [field]: value };
                    
                    // Auto-calculate minutes when time fields change
                    if (field === 'startTime' || field === 'endTime') {
                        const timeToMinutes = (timeStr: string) => {
                            const [hours, minutes] = timeStr.split(':').map(Number);
                            return hours * 60 + minutes;
                        };
                        
                        if (field === 'startTime') {
                            updatedEntry.startMinutes = timeToMinutes(value);
                        } else if (field === 'endTime') {
                            updatedEntry.endMinutes = timeToMinutes(value);
                        }
                    }
                    
                    return updatedEntry;
                }
                return entry;
            })
        }));
    };
    
    const addBlockTimeEntry = () => {
        setFormData((prev: any) => ({
            ...prev,
            blockedTimes: [...(prev.blockedTimes as any[]), {
                date: '',
                startTime: '',
                endTime: '',
                startMinutes: 0,
                endMinutes: 0,
                reason: '',
                isRecurring: false,
                recurringType: null,
                isActive: true
            }]
        }));
    };
    
    const removeBlockTimeEntry = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            blockedTimes: (prev.blockedTimes as any[]).filter((_: any, i: number) => i !== index)
        }));
    };
    
    const handleCheckboxChange = (permission: string, checked: boolean | string) => {
        const isChecked = typeof checked === 'string' ? checked === 'true' : checked;
        setFormData((prev: any) => ({
            ...prev,
            permissions: isChecked
                ? [...(prev.permissions as string[]), permission]
                : (prev.permissions as string[]).filter(p => p !== permission)
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Only validate password for new staff members (when staff is null/undefined)
        if (!staff) {
            if (!formData.password) {
                toast.error("Password is required for new staff members.");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }
        } else {
            // For existing staff, only validate password if they're trying to change it
            if (formData.password && formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }
        }
        
        const payload: any = {
            ...formData,
            vendorId: user._id,
        };

        if (!payload.password) {
            delete payload.password;
        }
        delete payload.confirmPassword;
        
        // Log the payload to verify timing and blocked times data
        console.log('Saving staff data:', {
            availabilityFields: {
                sundayAvailable: payload.sundayAvailable,
                mondayAvailable: payload.mondayAvailable,
                tuesdayAvailable: payload.tuesdayAvailable,
                wednesdayAvailable: payload.wednesdayAvailable,
                thursdayAvailable: payload.thursdayAvailable,
                fridayAvailable: payload.fridayAvailable,
                saturdayAvailable: payload.saturdayAvailable,
            },
            slotsFields: {
                sundaySlots: payload.sundaySlots,
                mondaySlots: payload.mondaySlots,
                tuesdaySlots: payload.tuesdaySlots,
                wednesdaySlots: payload.wednesdaySlots,
                thursdaySlots: payload.thursdaySlots,
                fridaySlots: payload.fridaySlots,
                saturdaySlots: payload.saturdaySlots,
            },
            blockedTimes: payload.blockedTimes,
            fullPayload: payload
        });

        try {
            if (staff) {
                await updateStaff({ _id: staff._id, ...payload }).unwrap();
                toast.success("Staff member updated successfully.");
            } else {
                await createStaff(payload).unwrap();
                toast.success("Staff member added successfully.");
            }
            onSuccess();
        } catch (error: any) {
            console.error("Failed to save staff member:", error);
            
            // Handle specific 409 conflict errors with detailed information
            if (error?.status === 409 && error?.data) {
                console.log('Conflict details:', error.data);
                
                if (error.data.field && error.data.existingStaff) {
                    const conflictField = error.data.field === 'emailAddress' ? 'email' : 'mobile number';
                    const existingStaff = error.data.existingStaff;
                    toast.error(
                        `Conflict: A staff member "${existingStaff.fullName}" already exists with this ${conflictField}. ` +
                        `Please use a different ${conflictField}.`
                    );
                } else {
                    toast.error(error.data.message || "A staff member with these details already exists.");
                }
            } else {
                const errorMessage = error?.data?.message || "Failed to save staff member.";
                toast.error(errorMessage);
            }
        }
    };

    const handleNextTab = () => {
        if (activeTab === 'personal') setActiveTab('employment');
        else if (activeTab === 'employment') setActiveTab('bank');
        else if (activeTab === 'bank') setActiveTab('permissions');
        else if (activeTab === 'permissions') setActiveTab('timing');
        else if (activeTab === 'timing') setActiveTab('blockTime');
    }

    const handlePreviousTab = () => {
        if (activeTab === 'employment') setActiveTab('personal');
        else if (activeTab === 'bank') setActiveTab('employment');
        else if (activeTab === 'permissions') setActiveTab('bank');
        else if (activeTab === 'timing') setActiveTab('permissions');
        else if (activeTab === 'blockTime') setActiveTab('timing');
    }

    const renderPersonalTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" name="position" value={formData.position} onChange={handleInputChange} required/>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="mobileNo">Mobile Number</Label>
                    <Input id="mobileNo" name="mobileNo" type="tel" value={formData.mobileNo} onChange={handleInputChange} required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input id="emailAddress" name="emailAddress" type="email" value={formData.emailAddress} onChange={handleInputChange} required/>
                </div>
            </div>
            {!staff && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} required={!staff} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                               {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required={!staff && !!formData.password} />
                    </div>
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                <Input id="photo" type="file" onChange={handleFileChange} />
                {formData.photo && <img src={formData.photo} alt="Staff preview" className="w-20 h-20 rounded-full object-cover mt-2" />}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} />
            </div>
        </div>
    );
    
    const renderEmploymentTab = () => (
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="salary">Salary (per month)</Label>
                    <Input id="salary" name="salary" type="number" value={formData.salary} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="yearOfExperience">Years of Experience</Label>
                    <Input id="yearOfExperience" name="yearOfExperience" type="number" value={formData.yearOfExperience} onChange={handleInputChange} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="clientsServed">Clients Served</Label>
                <Input id="clientsServed" name="clientsServed" type="number" value={formData.clientsServed} onChange={handleInputChange} />
            </div>
             <div className="flex items-center space-x-2 pt-2">
                <Switch 
                    id="commission" 
                    checked={formData.commission} 
                    onCheckedChange={(checked) => setFormData((prev: any) => ({...prev, commission: checked}))}
                />
                <Label htmlFor="commission">Enable Staff Commission</Label>
            </div>
        </div>
    );

    const renderBankDetailsTab = () => (
         <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input id="accountHolderName" name="accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleBankDetailsChange} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" value={formData.bankDetails.accountNumber} onChange={handleBankDetailsChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" value={formData.bankDetails.bankName} onChange={handleBankDetailsChange} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input id="ifscCode" name="ifscCode" value={formData.bankDetails.ifscCode} onChange={handleBankDetailsChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input id="upiId" name="upiId" value={formData.bankDetails.upiId} onChange={handleBankDetailsChange} />
                </div>
            </div>
        </div>
    );

     const renderPermissionsTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-md">
                {vendorNavItems.map((item) => (
                    <div key={item.permission} className="flex items-center space-x-2">
                        <Checkbox
                            id={item.permission}
                            checked={(formData.permissions as string[]).includes(item.permission)}
                            onCheckedChange={(checked) => handleCheckboxChange(item.permission, checked as boolean)}
                        />
                        <Label htmlFor={item.permission} className="text-sm font-medium">
                            {item.title}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderTimingTab = () => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayLabels = {
            sunday: 'Sunday',
            monday: 'Monday', 
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday'
        };
        
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <h4 className="font-semibold">Weekly Working Hours</h4>
                </div>
                
                <div className="space-y-3">
                    {days.map(day => {
                        const availableField = `${day}Available`;
                        const slotsField = `${day}Slots`;
                        const isAvailable = formData[availableField];
                        const slots = formData[slotsField] || [];
                        const currentSlot = slots.length > 0 ? slots[0] : { startTime: '10:00', endTime: '19:00' };
                        
                        return (
                            <div key={day} className="border p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    {/* Day Name and Toggle */}
                                    <div className="flex items-center space-x-3">
                                        <Switch
                                            checked={isAvailable}
                                            onCheckedChange={(checked) => handleTimingChange(day, 'isWorking', checked)}
                                        />
                                        <Label className="font-medium min-w-[80px]">{(dayLabels as any)[day]}</Label>
                                    </div>
                                    
                                    {/* Start Time */}
                                    <div>
                                        <Label htmlFor={`${day}-start`} className="text-sm text-gray-600">Start Time</Label>
                                        <Input
                                            id={`${day}-start`}
                                            type="time"
                                            value={currentSlot.startTime || ''}
                                            onChange={(e) => handleTimingChange(day, 'startTime', e.target.value)}
                                            disabled={!isAvailable}
                                            className="mt-1"
                                        />
                                    </div>
                                    
                                    {/* End Time */}
                                    <div>
                                        <Label htmlFor={`${day}-end`} className="text-sm text-gray-600">End Time</Label>
                                        <Input
                                            id={`${day}-end`}
                                            type="time"
                                            value={currentSlot.endTime || ''}
                                            onChange={(e) => handleTimingChange(day, 'endTime', e.target.value)}
                                            disabled={!isAvailable}
                                            className="mt-1"
                                        />
                                    </div>
                                    
                                    {/* Working Hours Display */}
                                    <div className="text-sm text-gray-500">
                                        {isAvailable ? (
                                            <span>
                                                {currentSlot.startTime && currentSlot.endTime
                                                    ? `${currentSlot.startTime} - ${currentSlot.endTime}`
                                                    : 'Set times'}
                                            </span>
                                        ) : (
                                            <span className="text-red-500">Off</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    
    const renderBlockTimeTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <h4 className="font-semibold">Block Time Entries</h4>
                </div>
                <Button type="button" onClick={addBlockTimeEntry} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block Time
                </Button>
            </div>
            
            {formData.blockedTimes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No block time entries. Click "Add Block Time" to create one.
                </div>
            ) : (
                <div className="space-y-4">
                    {formData.blockedTimes.map((entry: any, index: number) => (
                        <div key={index} className="border p-4 rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                                <h5 className="font-medium">Block Time Entry {index + 1}</h5>
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => removeBlockTimeEntry(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor={`block-date-${index}`}>Date</Label>
                                    <Input
                                        id={`block-date-${index}`}
                                        type="date"
                                        value={entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : entry.date}
                                        onChange={(e) => handleBlockTimeChange(index, 'date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`block-start-${index}`}>Start Time</Label>
                                    <Input
                                        id={`block-start-${index}`}
                                        type="time"
                                        value={entry.startTime}
                                        onChange={(e) => handleBlockTimeChange(index, 'startTime', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`block-end-${index}`}>End Time</Label>
                                    <Input
                                        id={`block-end-${index}`}
                                        type="time"
                                        value={entry.endTime}
                                        onChange={(e) => handleBlockTimeChange(index, 'endTime', e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor={`block-reason-${index}`}>Reason</Label>
                                <Textarea
                                    id={`block-reason-${index}`}
                                    value={entry.reason || ''}
                                    onChange={(e) => handleBlockTimeChange(index, 'reason', e.target.value)}
                                    placeholder="Reason for block time (e.g., Lunch break, Meeting, etc.)"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Tabs value={activeTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="personal" disabled={true}>Personal</TabsTrigger>
                            <TabsTrigger value="employment" disabled={true}>Employment</TabsTrigger>
                            <TabsTrigger value="bank" disabled={true}>Bank Details</TabsTrigger>
                            <TabsTrigger value="permissions" disabled={true}>Permissions</TabsTrigger>
                            <TabsTrigger value="timing" disabled={true}>Timing</TabsTrigger>
                            <TabsTrigger value="blockTime" disabled={true}>Block Time</TabsTrigger>
                        </TabsList>
                        <TabsContent value="personal" className="py-4">
                            {renderPersonalTab()}
                        </TabsContent>
                        <TabsContent value="employment" className="py-4">
                            {renderEmploymentTab()}
                        </TabsContent>
                        <TabsContent value="bank" className="py-4">
                            {renderBankDetailsTab()}
                        </TabsContent>
                         <TabsContent value="permissions" className="py-4">
                            {renderPermissionsTab()}
                        </TabsContent>
                        <TabsContent value="timing" className="py-4">
                            {renderTimingTab()}
                        </TabsContent>
                        <TabsContent value="blockTime" className="py-4">
                            {renderBlockTimeTab()}
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isCreating || isUpdating}>
                            Cancel
                        </Button>
                        {activeTab !== 'personal' && (
                            <Button type="button" variant="outline" onClick={handlePreviousTab}>
                                Previous
                            </Button>
                        )}
                        {activeTab !== 'blockTime' ? (
                            <Button type="button" onClick={handleNextTab}>Next</Button>
                        ) : (
                            <Button type="button" onClick={handleSubmit} disabled={isCreating || isUpdating}>
                                {isCreating || isUpdating ? 'Saving...' : 'Save Staff'}
                            </Button>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
