"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { CreditCard, Lock, CheckCircle, ArrowLeft } from "lucide-react";

interface PaymentStepProps {
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

export function PaymentStep({ amount, onSuccess, onBack }: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 3000);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-400/10 to-blue-400/5 border border-blue-400/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-400" />
          Payment Gateway
        </CardTitle>
        <p className="text-muted-foreground">
          Secure payment powered by Stripe
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isProcessing ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Processing Payment</h3>
            <p className="text-muted-foreground">Please wait while we process your payment...</p>
          </div>
        ) : (
          <>
            {/* Payment Summary */}
            <div className="p-4 bg-background/50 rounded-lg border border-blue-400/10">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-blue-400">${amount}</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">Your payment is secured with 256-bit SSL encryption</span>
            </div>

            {/* Mock Payment Form */}
            <div className="space-y-4 p-6 bg-background/30 rounded-lg border border-blue-400/10">
              <h3 className="font-semibold text-foreground">Payment Method</h3>
              
              <div className="space-y-3">
                <div className="p-4 border border-blue-400/20 rounded-lg bg-blue-400/10">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visa, Mastercard, American Express
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>• No additional charges</p>
                <p>• Instant payment confirmation</p>
                <p>• Refund available as per policy</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 border-blue-400/20 hover:bg-blue-400/10 text-blue-400"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1 bg-blue-400 hover:bg-blue-500 text-white py-3"
                size="lg"
              >
                <Lock className="mr-2 h-4 w-4" />
                Pay ${amount}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}