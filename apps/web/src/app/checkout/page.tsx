
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
import { useCreateClientOrderMutation, useCreatePaymentOrderMutation, useVerifyPaymentMutation } from '@repo/store/api';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  vendorName: string;
  vendorId: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  
  const { user } = useAuth();
  const [createOrder, { isLoading }] = useCreateClientOrderMutation();
  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    try {
      const storedProduct = localStorage.getItem('buyNowProduct');
      console.log('Stored product from localStorage:', storedProduct);
      if (storedProduct) {
        const parsedProduct = JSON.parse(storedProduct);
        if (!parsedProduct.quantity) {
          parsedProduct.quantity = 1;
        }
        // Ensure vendorId is not undefined
        if (!parsedProduct.vendorId) {
          console.warn('vendorId is missing from stored product data, using fallback');
          parsedProduct.vendorId = 'unknown-vendor';
        }
        setProduct(parsedProduct);
        setShippingAddress(user?.address || '');
        setContactNumber(user?.mobileNo || '');
      } else {
        console.log('No product found in localStorage, redirecting to home');
        router.push('/');
      }
    } catch (e) {
      console.error('Failed to parse product from localStorage', e);
      router.push('/');
    }
  }, [router, user]);

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim() || !contactNumber.trim()) {
      toast.error('Please fill in all shipping details.');
      return;
    }
    if (!product) return;

    const totalAmount = (product.price * product.quantity) + 5.00 + (product.price * product.quantity * 0.08);

    try {
      // For cash on delivery, directly create order
      if (paymentMethod === 'cash-on-delivery') {
        const orderData = {
          items: [{
            productId: product.id,
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            image: product.image,
          }],
          vendorId: product.vendorId,
          totalAmount,
          shippingAddress,
          contactNumber,
          paymentMethod,
        };
        
        await createOrder(orderData).unwrap();
        toast.success('Order placed successfully!', {
          description: 'You will be redirected to your orders page.',
        });

        localStorage.removeItem('buyNowProduct');
        setTimeout(() => {
          router.push('/profile/orders');
        }, 2000);
        return;
      }
      
      // For UPI, Credit/Debit Card, and Net Banking payments, use Razorpay
      if (paymentMethod === 'upi' || paymentMethod === 'credit-card' || paymentMethod === 'netbanking') {
        // Create Razorpay payment order
        const paymentOrderResponse = await createPaymentOrder({
          amount: totalAmount,
          receipt: `order_${Date.now()}`,
        }).unwrap();

        if (!paymentOrderResponse.success) {
          throw new Error('Failed to create payment order');
        }

        const razorpayOrder = paymentOrderResponse.order;

        // Check if Razorpay is loaded
        if (!(window as any).Razorpay) {
          throw new Error('Razorpay SDK not loaded');
        }

        // Configure payment methods based on selection
        let paymentMethods = {};
        if (paymentMethod === 'credit-card') {
          paymentMethods = {
            card: true,
            upi: false,
            netbanking: false,
            wallet: false,
          };
        } else if (paymentMethod === 'upi') {
          paymentMethods = {
            card: false,
            upi: true,
            netbanking: false,
            wallet: false,
          };
        } else if (paymentMethod === 'netbanking') {
          paymentMethods = {
            card: false,
            upi: false,
            netbanking: true,
            wallet: false,
          };
        }

        // Initialize Razorpay payment
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'GlowVita Salon',
          description: `Order for ${product.name}`,
          image: '/images/logo.png', // Add your logo here
          order_id: razorpayOrder.id,
          method: paymentMethods,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }).unwrap();

              if (verifyResponse.success) {
                // Create order after successful payment
                const orderData = {
                  items: [{
                    productId: product.id,
                    name: product.name,
                    quantity: product.quantity,
                    price: product.price,
                    image: product.image,
                  }],
                  vendorId: product.vendorId,
                  totalAmount,
                  shippingAddress,
                  contactNumber,
                  paymentMethod,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                };
                
                await createOrder(orderData).unwrap();
                toast.success('Payment successful! Order placed successfully!', {
                  description: 'You will be redirected to your orders page.',
                });

                localStorage.removeItem('buyNowProduct');
                setTimeout(() => {
                  router.push('/profile/orders');
                }, 2000);
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('Error after payment:', error);
              toast.error('Payment was successful but order creation failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.firstName + ' ' + user?.lastName || '',
            email: user?.emailAddress || '',
            contact: contactNumber,
          },
          theme: {
            color: '#3B82F6',
          },
          modal: {
            ondismiss: function() {
              toast.error('Payment cancelled by user');
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
        return;
      }

      // Fallback for any other payment method
      toast.error('Selected payment method is not supported yet.');

    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
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
          <div className="lg:col-span-2 space-y-8">
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
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2 space-y-2">
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
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Landmark className="h-5 w-5" />
                      <span>Net Banking</span>
                    </Label>
                    <Label className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                      <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
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
                  {isLoading ? 'Processing...' : 
                   paymentMethod === 'cash-on-delivery' ? 'Place Order' :
                   paymentMethod === 'credit-card' ? 'Pay with Card' :
                   paymentMethod === 'upi' ? 'Pay with UPI' :
                   paymentMethod === 'netbanking' ? 'Pay with Net Banking' :
                   'Place Order'
                  }
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
