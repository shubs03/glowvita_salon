"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { CheckCircle, CreditCard, User, Users, Phone, Activity, Tag, DollarSign, Star, MapPin, Stethoscope } from "lucide-react";
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Name</span>
                  </div>
                  <span className="font-semibold text-sm">{data.patientName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Phone</span>
                  </div>
                  <span className="font-semibold text-sm">+91 {data.phoneNumber}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Type</span>
                  </div>
                  <span className="font-semibold text-sm">{data.consultationType === 'self' ? 'For myself' : 'For someone else'}</span>
                </div>
                {data.selectedSpecialty && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Specialty</span>
                    </div>
                    <span className="font-semibold text-sm">{data.selectedSpecialty}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Doctor Information */}
          {data.doctorName && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Your Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2 border-b">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{data.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{data.doctorSpecialty}</p>
                    </div>
                  </div>
                  
                  {data.doctorRating && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">{data.doctorRating}</span>
                        <span className="text-xs text-muted-foreground">({data.doctorReviewCount})</span>
                      </div>
                    </div>
                  )}
                  
                  {data.doctorClinic && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Clinic</span>
                      </div>
                      <span className="font-semibold text-sm text-right">{data.doctorClinic}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Payment */}
        <div className="space-y-8">
          {/* Coupon Code */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5 text-primary" />
                Coupon Code
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!data.couponCode ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="uppercase h-10 text-sm"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      variant="outline"
                      className="h-10 px-4"
                      size="sm"
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-destructive">{couponError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between py-2 border rounded-lg px-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{data.couponCode}</span>
                    <span className="text-xs text-muted-foreground">
                      (-₹{data.discount})
                    </span>
                  </div>
                  <Button
                    onClick={handleRemoveCoupon}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Consultation Fee</span>
                  <span className="font-semibold text-sm">₹{data.consultationFee}</span>
                </div>
                {data.discount && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Discount ({data.couponCode})</span>
                    <span className="font-semibold text-sm">-₹{data.discount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-t-2">
                  <span className="font-semibold text-sm">Total Amount</span>
                  <span className="font-bold text-lg">₹{data.finalAmount}</span>
                </div>
                <div className="pt-2 border-t space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Secure payment processing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">100% money-back guarantee</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">24/7 customer support</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Concerns */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Health Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="py-2">
                <p className="text-xs text-muted-foreground mb-2">Patient's concerns:</p>
                <p className="text-sm leading-relaxed">{data.concerns}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}