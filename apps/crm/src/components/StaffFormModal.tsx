
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/tabs';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { useCreateStaffMutation, useUpdateStaffMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';

export const StaffFormModal = ({ isOpen, onClose, staff, onSuccess }) => {
    const { user } = useCrmAuth();
    const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
    const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
    const [activeTab, setActiveTab] = useState('personal');
    
    const [formData, setFormData] = useState({
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
                salary: '', startDate: '', endDate: '', yearOfExperience: '', clientsServed: '',
                bankDetails: { accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '', upiId: '' }
            });
        }
    }, [staff, isOpen]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBankDetailsChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails,
                [name]: value,
            }
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            vendorId: user._id,
        };

        try {
            if (staff) {
                await updateStaff({ id: staff._id, ...payload }).unwrap();
                toast.success("Staff member updated successfully.");
            } else {
                await createStaff(payload).unwrap();
                toast.success("Staff member added successfully.");
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save staff member:", error);
            toast.error("Failed to save staff member.");
        }
    };

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="personal">Personal</TabsTrigger>
                            <TabsTrigger value="employment">Employment</TabsTrigger>
                            <TabsTrigger value="bank">Bank Details</TabsTrigger>
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
                    </Tabs>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isCreating || isUpdating}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating || isUpdating}>
                            {isCreating || isUpdating ? 'Saving...' : 'Save Staff'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
