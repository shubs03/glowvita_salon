
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Switch } from '@repo/ui/switch';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { useGetShippingConfigQuery, useUpdateShippingConfigMutation } from '@repo/store/api';
import { toast } from 'sonner';
import { Skeleton } from '@repo/ui/skeleton';

const ShippingPageSkeleton = () => (
  <div className="p-4 sm:p-6 lg:p-8">
    <Skeleton className="h-8 w-64 mb-6" />
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="space-y-4 pt-4 border-t">
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  </div>
);

const ShippingPage = () => {
  const { data: shippingConfig, isLoading, isError, refetch } = useGetShippingConfigQuery(undefined);
  const [updateShipping, { isLoading: isUpdating }] = useUpdateShippingConfigMutation();
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [chargeType, setChargeType] = useState('fixed');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (shippingConfig) {
      setIsEnabled(shippingConfig.isEnabled ?? false);
      setChargeType(shippingConfig.chargeType ?? 'fixed');
      setAmount(shippingConfig.amount ?? 0);
    }
  }, [shippingConfig]);

  const handleSave = async () => {
    try {
      await updateShipping({
        isEnabled,
        chargeType,
        amount: Number(amount) || 0,
      }).unwrap();
      toast.success('Shipping settings saved successfully');
      refetch();
    } catch (error) {
      console.error('Failed to save shipping settings:', error);
      toast.error('Failed to save shipping settings');
    }
  };
  
  if (isLoading) {
    return <ShippingPageSkeleton />;
  }

  if (isError) {
    return <div className="p-8 text-center text-destructive">Failed to load shipping configuration.</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Enhanced Header Section matching marketplace design */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Shipping Configuration
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Manage your shipping settings efficiently.
              </p>
            </div>
          </div>
        </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Shipping Charges</CardTitle>
          <CardDescription>
            Set up how you want to charge for shipping on product orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
            <Label htmlFor="enable-shipping" className="text-base font-medium">
              Enable Shipping Charges
            </Label>
            <Switch
              id="enable-shipping"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          {isEnabled && (
            <div className="space-y-6 pt-6 border-t animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <Label>Charge Type</Label>
                <RadioGroup 
                  value={chargeType} 
                  onValueChange={(value) => setChargeType(value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fixed Amount (₹)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage">Percentage (%)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping-amount">
                  {chargeType === 'percentage' ? 'Percentage' : 'Amount'}
                </Label>
                <div className="relative">
                  <Input
                    id="shipping-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={0}
                    max={chargeType === 'percentage' ? 100 : undefined}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {chargeType === 'percentage' ? '%' : '₹'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button
            className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90"
          onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShippingPage;

    