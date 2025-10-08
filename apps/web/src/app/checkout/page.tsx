"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { ArrowLeft, CreditCard, Shield, Lock, Landmark, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  vendorName: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const storedProduct = localStorage.getItem('buyNowProduct');
      if (storedProduct) {
        const parsedProduct = JSON.parse(storedProduct);
        // Ensure quantity is set, default to 1 if not present
        if (!parsedProduct.quantity) {
          parsedProduct.quantity = 1;
        }
        setProduct(parsedProduct);
      } else {
        router.push('/'); // Redirect if no product is in checkout
      }
    } catch (e) {
      console.error('Failed to parse product from localStorage', e);
      router.push('/');
    }
  }, [router]);

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim() || !contactNumber.trim()) {
      toast.error('Please fill in all shipping details.');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to create an order
    try {
      // In a real app, this would be an API call to your backend
      // await createOrder({ product, shippingAddress, contactNumber, paymentMethod });

      toast.success('Order placed successfully!', {
        description: 'You will be redirected to the order confirmation page.',
      });

      // Clear the product from local storage after successful order
      localStorage.removeItem('buyNowProduct');

      // Redirect to a success page
      setTimeout(() => {
        router.push('/order-success');
      }, 2000);
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
      setIsLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const subtotal = product.price * product.quantity;
  const shipping = 5.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Product
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Order Summary & Shipping */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review the item you are about to purchase.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    width={100} 
                    height={100} 
                    className="rounded-lg object-cover" 
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">Sold by: {product.vendorName}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">₹{subtotal.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Details */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping & Contact Details</CardTitle>
                <CardDescription>Please confirm where we should send your order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Input 
                    id="shippingAddress"
                    value={shippingAddress} 
                    onChange={(e) => setShippingAddress(e.target.value)} 
                    placeholder="Enter your full shipping address"
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input 
                    id="contactNumber"
                    value={contactNumber} 
                    onChange={(e) => setContactNumber(e.target.value)} 
                    placeholder="Enter your contact number"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Payment Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Payment Method</Label>
                  <RadioGroup defaultValue="credit-card" className="mt-2 space-y-2">
                    <Label className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <CreditCard className="h-5 w-5" />
                      <span>Credit/Debit Card</span>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                      <RadioGroupItem value="upi" id="upi" />
                      <Landmark className="h-5 w-5" />
                      <span>UPI</span>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                      <RadioGroupItem value="cod" id="cod" />
                      <Wallet className="h-5 w-5" />
                      <span>Cash on Delivery</span>
                    </Label>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                >
                  {isLoading ? 'Placing Order...' : 'Place Order'}
                </Button>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Secure Checkout Guaranteed</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}