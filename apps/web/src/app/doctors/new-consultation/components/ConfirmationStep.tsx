"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { CheckCircle, CreditCard, User, Phone, Activity, Tag, DollarSign } from "lucide-react";
import { cn } from '@repo/ui/cn';
import { ConsultationData } from '../page';

interface ConfirmationStepProps {
  data: ConsultationData;
  onUpdate: (updates: Partial<ConsultationData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onNext: () => void;
}

export function ConfirmationStep({ data, onUpdate, currentStep, setCurrentStep, onNext }: ConfirmationStepProps) {
  const [couponCode, setCouponCode] = useState(data.couponCode || '');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    // Simulate coupon validation
    setTimeout(() => {
      const validCoupons = {
        'WELCOME10': { discount: 15, type: 'fixed' },
        'HEALTH20': { discount: 20, type: 'percentage' },
        'FIRST50': { discount: 50, type: 'percentage' }
      };
      
      const coupon = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons];
      
      if (coupon) {
        const discountAmount = coupon.type === 'percentage' 
          ? (data.consultationFee * coupon.discount) / 100 
          : coupon.discount;
        
        onUpdate({
          couponCode: couponCode.toUpperCase(),
          discount: discountAmount,
          finalAmount: data.consultationFee - discountAmount
        });
      } else {
        setCouponError('Invalid coupon code');
      }
      
      setIsApplyingCoupon(false);
    }, 1000);
  };

  const handleRemoveCoupon = () => {
    onUpdate({
      couponCode: undefined,
      discount: undefined,
      finalAmount: data.consultationFee
    });
    setCouponCode('');
    setCouponError('');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Consultation Summary</h2>
            <p className="text-lg text-muted-foreground">Review your information and proceed to payment</p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Patient Information */}
        <div className="space-y-8">
          {/* Patient Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <User className="h-6 w-6 text-primary" />
                Patient Information
              </CardTitle>
              <p className="text-muted-foreground mt-2">Verify the patient details below</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Patient Name</Label>
                  <p className="font-semibold text-lg">{data.patientName}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Phone Number</Label>
                  <p className="font-semibold text-lg">+91 {data.phoneNumber}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <Label className="text-sm text-muted-foreground">Consultation Type</Label>
                  <p className="font-semibold text-lg capitalize">{data.consultationType === 'self' ? 'For myself' : 'For someone else'}</p>
                </div>
                {data.selectedSpecialty && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm text-blue-600">Selected Specialty</Label>
                    <p className="font-semibold text-lg text-blue-900">{data.selectedSpecialty}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Concerns */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Activity className="h-6 w-6 text-primary" />
                Health Concerns
              </CardTitle>
              <p className="text-muted-foreground mt-2">Your described symptoms and conditions</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Patient's concerns:</p>
                <p className="text-base">{data.concerns}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment */}
        <div className="space-y-8">
          {/* Coupon Code */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Tag className="h-6 w-6 text-primary" />
                Coupon Code
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Apply a coupon code to get discount on consultation fee
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {!data.couponCode ? (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="uppercase h-12 text-base"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      variant="outline"
                      className="h-12 px-6"
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-sm text-destructive">{couponError}</p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Available coupons:</p>
                    <p>• WELCOME10 - ₹15 off</p>
                    <p>• HEALTH20 - 20% off</p>
                    <p>• FIRST50 - 50% off</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900 text-lg">{data.couponCode}</span>
                    <span className="text-sm text-green-600">
                      (-₹{data.discount})
                    </span>
                  </div>
                  <Button
                    onClick={handleRemoveCoupon}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <DollarSign className="h-6 w-6 text-primary" />
                Payment Summary
              </CardTitle>
              <p className="text-muted-foreground mt-2">Review your consultation charges</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                  <span className="font-medium">Consultation Fee</span>
                  <span className="font-semibold text-lg">₹{data.consultationFee}</span>
                </div>
                {data.discount && (
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-700">Discount ({data.couponCode})</span>
                    <span className="font-semibold text-lg text-green-700">-₹{data.discount}</span>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                    <span className="font-bold text-lg">Total Amount</span>
                    <span className="font-bold text-2xl text-primary">₹{data.finalAmount}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>• Secure payment processing</p>
                  <p>• 100% money-back guarantee</p>
                  <p>• 24/7 customer support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}