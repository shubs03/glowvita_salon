
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Upload, Image as ImageIcon, Banknote, FileText, UserSquare, Library, Sailboat } from 'lucide-react';
import { type Vendor } from '@/app/vendors/page';
import stateCityData from '@/lib/state-city.json';

interface VendorFormProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  isEditMode: boolean;
};

interface State {
  state: string;
  districts: string[];
}

const states: State[] = stateCityData.states;

export function VendorForm({ isOpen, onClose, vendor, isEditMode }: VendorFormProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedState, setSelectedState] = useState(vendor?.state || "");
  const [cities, setCities] = useState<string[]>([]);
  
  useEffect(() => {
    if (selectedState) {
        const stateData = states.find(s => s.state === selectedState);
        setCities(stateData ? stateData.districts : []);
    } else {
        setCities([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (vendor?.state) {
      setSelectedState(vendor.state);
    }
  }, [vendor]);
  
  const renderFileUpload = (label: string, fieldName: string, isReadOnly: boolean) => (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>{label}</Label>
      <div className="flex items-center gap-4">
        <Input id={fieldName} name={fieldName} type="file" disabled={isReadOnly} className="flex-grow" />
        <Button type="button" variant="outline" size="sm" disabled={isReadOnly}>View</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditMode ? `Edit Vendor: ${vendor?.name}` : 'Add New Vendor'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update vendor details below.' : 'Fill in the details to add a new vendor.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2 no-scrollbar">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 sticky top-0 bg-background z-10">
                    <TabsTrigger value="profile"><UserSquare className="w-4 h-4 mr-2"/>Profile</TabsTrigger>
                    <TabsTrigger value="subscription"><Sailboat className="w-4 h-4 mr-2"/>Subscription</TabsTrigger>
                    <TabsTrigger value="gallery"><Library className="w-4 h-4 mr-2"/>Gallery</TabsTrigger>
                    <TabsTrigger value="bank"><Banknote className="w-4 h-4 mr-2"/>Bank Details</TabsTrigger>
                    <TabsTrigger value="documents"><FileText className="w-4 h-4 mr-2"/>Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="ownerName">Salon Owner Name</Label>
                            <Input id="ownerName" defaultValue={vendor?.owner} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salonName">Salon Name</Label>
                            <Input id="salonName" defaultValue={vendor?.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={vendor?.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactNo">Contact No.</Label>
                            <Input id="contactNo" type="tel" defaultValue={vendor?.phone} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Select value={selectedState} onValueChange={setSelectedState}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a state" />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Select defaultValue={vendor?.city} disabled={!selectedState}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a city" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input id="pincode" defaultValue={vendor?.pincode} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Salon Website Link</Label>
                            <Input id="website" placeholder="https://example.com" defaultValue={vendor?.website} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Salon Address</Label>
                            <Textarea id="address" defaultValue={vendor?.address} />
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Salon Description</Label>
                            <Textarea id="description" defaultValue={vendor?.description} />
                        </div>
                        <div className="space-y-2">
                            <Label>Salon Profile Image</Label>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-24 bg-secondary rounded-md flex items-center justify-center">
                                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <div className="flex-grow">
                                    <Label htmlFor="profileImage" className="sr-only">Upload</Label>
                                    <Input id="profileImage" type="file" />
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="subscription">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Details</CardTitle>
                            <CardDescription>Current subscription status and history.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-semibold">Current Plan: <span className="font-normal text-primary">Pro Yearly</span></p>
                                <p className="font-semibold">Status: <span className="font-normal text-green-600">Active</span></p>
                                <p className="font-semibold">Expires on: <span className="font-normal">2025-01-15</span></p>
                            </div>
                            <Button>Renew Subscription</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="gallery">
                    <Card>
                         <CardHeader>
                            <CardTitle>Salon Gallery</CardTitle>
                            <CardDescription>Manage your salon's photos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-secondary rounded-md flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                ))}
                                <div className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary cursor-pointer">
                                    <Upload className="w-8 h-8" />
                                    <span className="text-xs mt-1">Add Image</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="bank">
                     <Card>
                        <CardHeader>
                            <CardTitle>Bank Account Details</CardTitle>
                            <CardDescription>Vendor's bank account for payouts. {isEditMode && '(Read-only)'}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name</Label>
                                <Input id="bankName" defaultValue="State Bank of India" readOnly={isEditMode} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accNo">Account Number</Label>
                                <Input id="accNo" defaultValue="**** **** **** 1234" readOnly={isEditMode} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ifsc">IFSC Code</Label>
                                <Input id="ifsc" defaultValue="SBIN0001234" readOnly={isEditMode} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="accHolder">Account Holder Name</Label>
                                <Input id="accHolder" defaultValue="Alice Johnson" readOnly={isEditMode} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="documents">
                     <Card>
                        <CardHeader>
                            <CardTitle>Verification Documents</CardTitle>
                            <CardDescription>Legal documents provided by the vendor. {isEditMode && '(Read-only)'}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderFileUpload("Owner Aadhar Card", "aadharCard", isEditMode)}
                            {renderFileUpload("Udyog Aadhar", "udyogAadhar", isEditMode)}
                            {renderFileUpload("Udhayam Registration", "udhayamCert", isEditMode)}
                            {renderFileUpload("Shop Act License", "shopLicense", isEditMode)}
                            {renderFileUpload("PAN Card", "panCard", isEditMode)}
                            {renderFileUpload("Other Documents", "otherDocs", isEditMode)}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        <DialogFooter className="mt-4 shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? 'Save Changes' : 'Add Vendor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
