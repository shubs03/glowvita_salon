import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useUpdateSupplierProfileMutation } from '@repo/store/api';
import { toast } from 'sonner';

interface SupplierProfileTabProps {
    supplier: any;
    setSupplier: any;
}

export const SupplierProfileTab = ({ supplier, setSupplier }: SupplierProfileTabProps) => {
    const [updateSupplierProfile] = useUpdateSupplierProfileMutation();

    const handleSave = async () => {
        try {
            const result: any = await updateSupplierProfile({
                _id: supplier._id,
                firstName: supplier.firstName,
                lastName: supplier.lastName,
                shopName: supplier.shopName,
                description: supplier.description,
                mobile: supplier.mobile,
                email: supplier.email,
                country: supplier.country,
                state: supplier.state,
                city: supplier.city,
                pincode: supplier.pincode,
                address: supplier.address,
                supplierType: supplier.supplierType,
                businessRegistrationNo: supplier.businessRegistrationNo,
                profileImage: supplier.profileImage,
            }).unwrap();

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update supplier profile');
        }
    };

    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Supplier Profile</CardTitle>
                <CardDescription className="text-sm sm:text-base">Update your business information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm sm:text-base">First Name</Label>
                        <Input
                            id="firstName"
                            value={supplier.firstName || ''}
                            onChange={(e) => setSupplier({ ...supplier, firstName: e.target.value })}
                            className="h-10 sm:h-12 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name</Label>
                        <Input
                            id="lastName"
                            value={supplier.lastName || ''}
                            onChange={(e) => setSupplier({ ...supplier, lastName: e.target.value })}
                            className="h-10 sm:h-12 rounded-lg"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shopName" className="text-sm sm:text-base">Shop Name</Label>
                    <Input
                        id="shopName"
                        value={supplier.shopName || ''}
                        onChange={(e) => setSupplier({ ...supplier, shopName: e.target.value })}
                        className="h-10 sm:h-12 rounded-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                    <Textarea
                        id="description"
                        value={supplier.description || ''}
                        onChange={(e) => setSupplier({ ...supplier, description: e.target.value })}
                        className="min-h-[80px] rounded-lg"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={supplier.email || ''}
                            onChange={(e) => setSupplier({ ...supplier, email: e.target.value })}
                            className="h-10 sm:h-12 rounded-lg"
                            disabled
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm sm:text-base">Mobile</Label>
                        <Input
                            id="mobile"
                            value={supplier.mobile || ''}
                            onChange={(e) => setSupplier({ ...supplier, mobile: e.target.value })}
                            className="h-10 sm:h-12 rounded-lg"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Supplier Type</Label>
                    <Select
                        value={supplier.supplierType || ''}
                        onValueChange={(value) => setSupplier({ ...supplier, supplierType: value })}
                    >
                        <SelectTrigger className="h-10 sm:h-12 rounded-lg">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Distributor">Distributor</SelectItem>
                            <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                            <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="businessRegistrationNo" className="text-sm sm:text-base">Business Registration No</Label>
                    <Input
                        id="businessRegistrationNo"
                        value={supplier.businessRegistrationNo || ''}
                        onChange={(e) => setSupplier({ ...supplier, businessRegistrationNo: e.target.value })}
                        className="h-10 sm:h-12 rounded-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm sm:text-base">Full Address</Label>
                    <Textarea
                        id="address"
                        value={supplier.address || ''}
                        onChange={(e) => setSupplier({ ...supplier, address: e.target.value })}
                        className="min-h-[60px] rounded-lg"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm sm:text-base">City</Label>
                        <Input
                            id="city"
                            value={supplier.city || ''}
                            onChange={(e) => setSupplier({ ...supplier, city: e.target.value })}
                            className="h-10 sm:h-12 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm sm:text-base">State</Label>
                        <Input
                            id="state"
                            value={supplier.state || ''}
                            onChange={(e) => setSupplier({ ...supplier, state: e.target.value })}
                            className="h-10 sm:h-12 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pincode" className="text-sm sm:text-base">Pincode</Label>
                        <Input
                            id="pincode"
                            value={supplier.pincode || ''}
                            onChange={(e) => setSupplier({ ...supplier, pincode: e.target.value })}
                            className="h-10 sm:h-12 rounded-lg"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6">
                <Button onClick={handleSave} className="h-10 sm:h-12 px-4 sm:px-6 rounded-lg bg-primary w-full sm:w-auto">
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    );
};
