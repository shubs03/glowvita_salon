"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useUpdateVendorProfileMutation } from '@repo/store/api';
import { toast } from 'sonner';

interface Taxes {
    taxValue: number;
    taxType: "percentage" | "fixed";
}

interface TaxesTabProps {
    taxes: Taxes;
    setVendor: any;
}

export const TaxesTab = ({ taxes, setVendor }: TaxesTabProps) => {
    const [updateVendorProfile] = useUpdateVendorProfileMutation();

    const handleSave = async () => {
        try {
            const result: any = await updateVendorProfile({
                taxes: taxes
            }).unwrap();

            if (result.success) {
                toast.success(result.message || "Taxes updated successfully");
            } else {
                toast.error(result.message || "Failed to update taxes");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update taxes');
        }
    };

    const handleValueChange = (value: string) => {
        const numValue = parseFloat(value) || 0;
        setVendor((prev: any) => ({
            ...prev,
            taxes: {
                ...prev.taxes,
                taxValue: numValue
            }
        }));
    };

    const handleTypeChange = (value: string) => {
        setVendor((prev: any) => ({
            ...prev,
            taxes: {
                ...prev.taxes,
                taxType: value
            }
        }));
    };

    return (
        <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Taxes Settings</CardTitle>
                <CardDescription>Manage your business tax configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Tax Configuration Display */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Currently Active</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">
                                {taxes?.taxType === 'percentage' ? `${taxes?.taxValue}%` : `₹${taxes?.taxValue}`}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                ({taxes?.taxType === 'percentage' ? 'Percentage Based' : 'Fixed Amount'})
                            </span>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="taxValue" className="text-sm font-semibold tracking-wide">Tax Value</Label>
                        <Input
                            id="taxValue"
                            type="number"
                            placeholder="Enter value"
                            value={taxes?.taxValue ?? ''}
                            onChange={(e) => handleValueChange(e.target.value)}
                            className="h-12 rounded-xl border border-border/50 bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all text-base"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="taxType" className="text-sm font-semibold tracking-wide">Tax Type</Label>
                        <Select
                            value={taxes?.taxType || 'percentage'}
                            onValueChange={handleTypeChange}
                        >
                            <SelectTrigger className="h-12 rounded-xl border border-border/50 bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all text-base">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50 bg-background/95 backdrop-blur-md">
                                <SelectItem value="percentage" className="focus:bg-primary/10">Percentage (%)</SelectItem>
                                <SelectItem value="fixed" className="focus:bg-primary/10">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button
                    onClick={handleSave}
                    className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                    Save Tax Settings
                </Button>
            </CardFooter>
        </Card>
    );
};
