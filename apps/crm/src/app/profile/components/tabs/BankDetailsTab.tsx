import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { useUpdateVendorProfileMutation, useUpdateSupplierProfileMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';

interface BankDetails {
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  upiId?: string;
}

interface BankDetailsTabProps {
  bankDetails: BankDetails;
  setVendor: any;
}

export const BankDetailsTab = ({ bankDetails, setVendor }: BankDetailsTabProps) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();
  const [updateSupplierProfile] = useUpdateSupplierProfileMutation();
  const { role } = useCrmAuth();

  const handleSave = async () => {
    try {
      const updateFn = role === 'vendor' ? updateVendorProfile : updateSupplierProfile;
      const result: any = await updateFn({
        _id: typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}')._id) : undefined,
        bankDetails: bankDetails
      }).unwrap();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update bank details');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setVendor((prev: any) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
        <CardDescription>Manage your bank account for payouts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountHolder">Account Holder Name</Label>
            <Input
              id="accountHolder"
              placeholder="Enter account holder name"
              value={bankDetails?.accountHolder || ''}
              onChange={(e) => handleInputChange('accountHolder', e.target.value)}
              className="h-12 rounded-lg border border-border focus:border-primary text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Enter account number"
              value={bankDetails?.accountNumber || ''}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              className="h-12 rounded-lg border border-border focus:border-primary text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="Enter bank name"
              value={bankDetails?.bankName || ''}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              className="h-12 rounded-lg border border-border focus:border-primary text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              placeholder="Enter IFSC code"
              value={bankDetails?.ifscCode || ''}
              onChange={(e) => handleInputChange('ifscCode', e.target.value)}
              className="h-12 rounded-lg border border-border focus:border-primary text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID <span className="text-muted-foreground text-sm">(Optional)</span></Label>
            <Input
              id="upiId"
              placeholder="Enter UPI ID (e.g., yourname@upi)"
              value={bankDetails?.upiId || ''}
              onChange={(e) => handleInputChange('upiId', e.target.value)}
              className="h-12 rounded-lg border border-border focus:border-primary text-base"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90">
          Update Bank Details
        </Button>
      </CardFooter>
    </Card>
  );
};