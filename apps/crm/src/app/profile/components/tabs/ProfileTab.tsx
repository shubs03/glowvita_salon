import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Checkbox } from "@repo/ui/checkbox";
import { useUpdateVendorProfileMutation } from '@repo/store/api';
import { toast } from 'sonner';

interface ProfileTabProps {
  vendor: any;
  setVendor: any;
}

export const ProfileTab = ({ vendor, setVendor }: ProfileTabProps) => {
  const [updateVendorProfile] = useUpdateVendorProfileMutation();

  const handleSave = async () => {
    try {
      const result: any = await updateVendorProfile({
        _id: vendor._id,
        businessName: vendor.businessName,
        description: vendor.description,
        category: vendor.category,
        subCategories: vendor.subCategories,
        website: vendor.website,
        gstNo: vendor.gstNo,
      }).unwrap();

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Business Profile</CardTitle>
        <CardDescription className="text-sm sm:text-base">Update your salon's public information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm sm:text-base">Salon Name</Label>
          <Input
            id="businessName"
            value={vendor.businessName || ''}
            onChange={(e) =>
              setVendor({ ...vendor, businessName: e.target.value })
            }
            className="h-10 sm:h-12 rounded-lg border border-border focus:border-primary text-sm sm:text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
          <Textarea
            id="description"
            value={vendor.description || ''}
            onChange={(e) =>
              setVendor({ ...vendor, description: e.target.value })
            }
            className="min-h-[80px] sm:min-h-[100px] rounded-lg border border-border focus:border-primary text-sm sm:text-base"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm sm:text-base">Salon Category</Label>
          <Select
            value={vendor.category || 'unisex'}
            onValueChange={(value) => setVendor({ ...vendor, category: value })}
          >
            <SelectTrigger className="h-10 sm:h-12 rounded-lg border-border hover:border-primary text-sm sm:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border/40">
              <SelectItem value="unisex">Unisex</SelectItem>
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="women">Women</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gstNo" className="text-sm sm:text-base">GST Number</Label>
          <Input
            id="gstNo"
            value={vendor.gstNo || ''}
            onChange={(e) =>
              setVendor({ ...vendor, gstNo: e.target.value })
            }
            placeholder="Enter GST Number (Optional)"
            className="h-10 sm:h-12 rounded-lg border border-border focus:border-primary text-sm sm:text-base"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm sm:text-base">Sub Categories</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {['at-salon', 'at-home', 'custom-location'].map((subCat: string) => (
              <div key={subCat} className="flex items-center space-x-2">
                <Checkbox
                  id={subCat}
                  checked={vendor.subCategories?.includes(subCat) || false}
                  onCheckedChange={(checked) => {
                    const currentSubCats = vendor.subCategories || [];
                    const newSubCats = checked
                      ? [...currentSubCats, subCat]
                      : currentSubCats.filter((id: string) => id !== subCat);
                    setVendor({ ...vendor, subCategories: newSubCats });
                  }}
                />
                <Label
                  htmlFor={subCat}
                  className="text-xs sm:text-sm font-medium leading-none cursor-pointer"
                >
                  {subCat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Active Tax Rate</p>
                <p className="text-sm font-bold">
                  {vendor.taxes?.taxType === 'percentage' ? `${vendor.taxes?.taxValue}%` : `₹${vendor.taxes?.taxValue}`}
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">({vendor.taxes?.taxType || 'Percentage'})</span>
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Update in Taxes tab</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6">
        <Button onClick={handleSave} className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base rounded-lg bg-primary hover:bg-primary/90 w-full sm:w-auto">
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};