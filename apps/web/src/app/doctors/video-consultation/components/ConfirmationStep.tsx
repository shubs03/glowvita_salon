"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { CheckCircle, CreditCard, User, Activity, Tag, Stethoscope } from "lucide-react";
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

  // Debug logging
  console.log('🔍 ConfirmationStep - Received data:', {
    doctorName: data.doctorName,
    doctorSpecialty: data.doctorSpecialty,
    doctorRating: data.doctorRating,
    doctorClinic: data.doctorClinic,
    consultationFee: data.consultationFee,
    finalAmount: data.finalAmount,
  });

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
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Confirmation & Payment</h2>
            <p className="text-muted-foreground">Review your information and proceed to payment</p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Patient Information */}
        <div className="space-y-6">
          {/* Patient Information */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">Your basic details</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{data.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">+91 {data.phoneNumber}</span>
              </div>
            </CardContent>
          </Card>

          {/* Health Concerns */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-5 w-5 text-primary" />
                Health Concerns
              </CardTitle>
              <p className="text-sm text-muted-foreground">Reason for consultation</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{data.concerns}</p>
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Stethoscope className="h-5 w-5 text-primary" />
                Your Doctor
              </CardTitle>
              <p className="text-sm text-muted-foreground">Consultation details</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium">{data.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialty</span>
                <span className="font-medium">{data.doctorSpecialty}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment */}
        <div className="space-y-6">
          {/* Coupon Code */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Tag className="h-5 w-5 text-primary" />
                Coupon Code
              </CardTitle>
              <p className="text-sm text-muted-foreground">Have a discount code?</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {!data.couponCode ? (
                <>
                  <div className="flex gap-2">
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
                </>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{data.couponCode}</span>
                    <span className="text-sm text-muted-foreground">
                      (-₹{data.discount})
                    </span>
                  </div>
                  <Button
                    onClick={handleRemoveCoupon}
                    variant="ghost"
                    size="sm"
                    className="h-8"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Summary
              </CardTitle>
              <p className="text-sm text-muted-foreground">Total amount to pay</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-medium">₹{data.consultationFee}</span>
              </div>
              {data.discount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount ({data.couponCode})</span>
                  <span className="font-medium text-green-600">-₹{data.discount}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold text-lg">₹{data.finalAmount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}