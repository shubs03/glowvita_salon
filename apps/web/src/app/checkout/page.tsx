
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { ArrowLeft, CreditCard, Shield, Lock, Landmark, Wallet, Plus, Minus, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateClientOrderMutation, useCreatePaymentOrderMutation, useVerifyPaymentMutation, useGetPublicTaxFeeSettingsQuery, useGetPublicShippingConfigQuery } from '@repo/store/api';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  vendorName: string;
  vendorId: string;
  originalPrice: number;
  hasSale: boolean;
  isCartOrder?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    mobileNo: '',
    pincode: '',
    houseNo: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    isPrimary: false
  });

  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const { user } = useAuth();
  const { data: taxSettings } = useGetPublicTaxFeeSettingsQuery(undefined);
  const { data: shippingConfig } = useGetPublicShippingConfigQuery(product?.vendorId);
  const [createOrder, { isLoading }] = useCreateClientOrderMutation();
  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  console.log('Shipping Config Full Data: ', shippingConfig);
  console.log('Shipping Config Amount: ', shippingConfig?.amount);
  console.log('Shipping Config ChargeType: ', shippingConfig?.chargeType);
  console.log('Shipping Config IsEnabled: ', shippingConfig?.isEnabled);

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

  // Fetch saved addresses
  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/client/addresses');
      const data = await res.json();
      if (data.savedAddresses && data.savedAddresses.length > 0) {
        setSavedAddresses(data.savedAddresses);
        // Set default address if exists
        const primary = data.savedAddresses.find((addr: any) => addr.isPrimary);
        if (primary) {
          setSelectedAddressId(primary._id);
          setShippingAddress(`${primary.address}, ${primary.landmark ? primary.landmark + ', ' : ''}${primary.city}, ${primary.state} - ${primary.pincode}`);
          setContactNumber(primary.mobileNo || '');
        } else {
          const first = data.savedAddresses[0];
          setSelectedAddressId(first._id);
          setShippingAddress(`${first.address}, ${first.landmark ? first.landmark + ', ' : ''}${first.city}, ${first.state} - ${first.pincode}`);
          setContactNumber(first.mobileNo || '');
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    try {
      const storedProduct = localStorage.getItem('buyNowProduct');
      const storedCartItems = localStorage.getItem('cartItems');
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

        if (storedCartItems) {
          setCartItems(JSON.parse(storedCartItems));
        }

        // Only set default from user profile if no saved addresses are available
        if (savedAddresses.length === 0) {
          setShippingAddress(user?.address || '');
          setContactNumber(user?.mobileNo || '');
        }
      } else {
        console.log('No product found in localStorage, redirecting to home');
        router.push('/');
      }
    } catch (e) {
      console.error('Failed to parse product from localStorage', e);
      router.push('/');
    }
  }, [router, user, savedAddresses.length]);

  const handleAddressSelect = (addr: any) => {
    setSelectedAddressId(addr._id);
    setShippingAddress(`${addr.address}, ${addr.landmark ? addr.landmark + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`);
    setContactNumber(addr.mobileNo || '');
    setAddressError('');
    setPhoneError('');
  };

  const handleEditAddress = (addr: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddressId(addr._id);
    const parts = addr.address.split(', ');
    const houseNo = parts[0] || '';
    const area = parts.slice(1).join(', ') || '';
    
    setNewAddress({
      fullName: addr.fullName || '',
      mobileNo: addr.mobileNo || '',
      pincode: addr.pincode || '',
      houseNo: houseNo,
      area: area,
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      isPrimary: addr.isPrimary || false
    });
    setShowAddressForm(true);
  };

  const handleSaveNewAddress = async () => {
    // Basic validation
    if (!newAddress.fullName || !newAddress.mobileNo || !newAddress.pincode || !newAddress.houseNo || !newAddress.area || !newAddress.city || !newAddress.state) {
      toast.error('Please fill all required fields');
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    const pincodeRegex = /^[0-9]{6}$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!nameRegex.test(newAddress.fullName)) {
      toast.error('Full Name should only contain letters');
      return;
    }
    if (!mobileRegex.test(newAddress.mobileNo)) {
      toast.error('Mobile Number must be exactly 10 digits');
      return;
    }
    if (!pincodeRegex.test(newAddress.pincode)) {
      toast.error('Pincode must be exactly 6 digits');
      return;
    }
    if (!nameRegex.test(newAddress.city)) {
      toast.error('City should only contain letters');
      return;
    }
    if (!nameRegex.test(newAddress.state)) {
      toast.error('State should only contain letters');
      return;
    }

    try {
      const fullAddress = `${newAddress.houseNo}, ${newAddress.area}`;
      const url = editingAddressId 
        ? `/api/client/addresses/${editingAddressId}`
        : '/api/client/addresses';
      const method = editingAddressId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newAddress.fullName,
          mobileNo: newAddress.mobileNo,
          address: fullAddress,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          landmark: newAddress.landmark,
          lat: 1, 
          lng: 1,
          isPrimary: newAddress.isPrimary
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingAddressId ? 'Address updated successfully' : 'Address saved successfully');
        await fetchAddresses();
        setShowAddressForm(false);
        setEditingAddressId(null);
        // Reset form
        setNewAddress({
          fullName: '',
          mobileNo: '',
          pincode: '',
          houseNo: '',
          area: '',
          landmark: '',
          city: '',
          state: '',
          isPrimary: false
        });
      } else {
        toast.error(data.message || (editingAddressId ? 'Failed to update address' : 'Failed to save address'));
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('An error occurred while saving the address');
    }
  };
  const handleQuantityChange = (delta: number) => {
    if (!product) return;

    const newQuantity = Math.max(1, (product.quantity || 1) + delta);
    if (newQuantity === product.quantity) return;

    const updatedProduct = { ...product, quantity: newQuantity };
    setProduct(updatedProduct);

    // Persist to localStorage
    try {
      localStorage.setItem('buyNowProduct', JSON.stringify(updatedProduct));
    } catch (e) {
      console.error('Failed to update product in localStorage', e);
    }
  };

  const handlePlaceOrder = async () => {
    let isValid = true;

    if (!shippingAddress.trim()) {
      setAddressError('Shipping address is required');
      isValid = false;
    } else {
      setAddressError('');
    }

    if (!contactNumber.trim()) {
      setPhoneError('Contact number is required');
      isValid = false;
    } else if (contactNumber.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (!isValid) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    if (!product) return;

    // Use the correct calculation for totalAmount that matches the checkout page display
    const subtotal = Number(product.price) * Number(product.quantity);
    const shippingAmount = Number(shippingConfig?.amount || 0);
    const shipping = subtotal > 0 && shippingConfig?.isEnabled
      ? (shippingConfig.chargeType === 'percentage'
        ? (subtotal * shippingAmount) / 100
        : shippingAmount)
      : 0;

    // Calculate tax based on dynamic tax settings from API
    const productGST = taxSettings?.productGST || 18;
    const productGSTType = taxSettings?.productGSTType || 'percentage';
    const productPlatformFee = taxSettings?.productPlatformFee || 10;
    const productPlatformFeeType = taxSettings?.productPlatformFeeType || 'percentage';
    const productGSTEnabled = taxSettings?.productGSTEnabled ?? true;
    const productPlatformFeeEnabled = taxSettings?.productPlatformFeeEnabled ?? true;

    const gst = productGSTEnabled
      ? (productGSTType === 'percentage' ? subtotal * (Number(productGST) / 100) : Number(productGST))
      : 0;
    const platformFee = productPlatformFeeEnabled
      ? (productPlatformFeeType === 'percentage' ? subtotal * (Number(productPlatformFee) / 100) : Number(productPlatformFee))
      : 0;
    const tax = gst + platformFee;

    const totalAmount = subtotal + shipping + tax;

    try {
      // For cash on delivery, directly create order
      if (paymentMethod === 'cash-on-delivery') {
        // Check if this is a cart checkout (product ID starts with 'cart-')
        let orderData;
        if (product.id.startsWith('cart-')) {
          // This is a cart checkout, we need to get the actual cart items
          const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
          if (cartItems.length === 0) {
            toast.error('Cart is empty. Cannot place order.');
            return;
          }

          orderData = {
            items: cartItems.map((item: any) => ({
              productId: item.productId || item._id,
              name: item.productName,
              quantity: item.quantity,
              price: item.price,
              image: item.productImage || "/images/placeholder.jpg",
            })),
            vendorId: product.vendorId,
            totalAmount,
            shippingAmount: shipping,
            taxAmount: tax,
            gstAmount: gst,
            platformFeeAmount: platformFee,
            shippingAddress,
            contactNumber,
            paymentMethod,
          };
        } else {
          // This is a single product checkout
          orderData = {
            items: [{
              productId: product.id,
              name: product.name,
              quantity: product.quantity,
              price: product.price,
              image: product.image,
            }],
            vendorId: product.vendorId,
            totalAmount,
            shippingAmount: shipping,
            taxAmount: tax,
            gstAmount: gst,
            platformFeeAmount: platformFee,
            shippingAddress,
            contactNumber,
            paymentMethod,
          };
        }

        await createOrder(orderData).unwrap();
        toast.success('Order placed successfully!', {
          description: 'You will be redirected to your orders page.',
        });

        localStorage.removeItem('buyNowProduct');
        localStorage.removeItem('cartItems');
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

        const razorpayOrder = paymentOrderResponse;

        // Check if Razorpay is loaded
        if (!(window as any).Razorpay) {
          throw new Error('Razorpay SDK not loaded');
        }



        // Determine method sequence based on selection
        let displaySequence = ['block.upi', 'card', 'netbanking'];
        if (paymentMethod === 'upi') displaySequence = ['block.upi'];
        else if (paymentMethod === 'credit-card') displaySequence = ['card'];
        else if (paymentMethod === 'netbanking') displaySequence = ['netbanking'];

        // Initialize Razorpay payment
        const options = {
          key: razorpayOrder.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SLBxzQHGTzUTCO',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'GlowVita Salon',
          description: `Order for ${product.name}`,
          image: '/images/logo.png', // Add your logo here
          order_id: razorpayOrder.id,
          retry: { enabled: true, max_count: 3 },
          // Simplified config to prevent interaction lag
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'UPI / QR',
                  instruments: [
                    { method: 'upi', vpa: true }, // UPI ID entry
                    { method: 'upi', qr: true }   // QR Code
                  ],
                },
              },
              sequence: displaySequence,
            },
          },
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }).unwrap();

              if (verifyResponse.success) {
                // Check if this is a cart checkout (product ID starts with 'cart-')
                let orderData;
                if (product.id.startsWith('cart-')) {
                  // This is a cart checkout, we need to get the actual cart items
                  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                  if (cartItems.length === 0) {
                    toast.error('Cart is empty. Cannot place order.');
                    return;
                  }

                  orderData = {
                    items: cartItems.map((item: any) => ({
                      productId: item.productId || item._id,
                      name: item.productName,
                      quantity: item.quantity,
                      price: item.price,
                      image: item.productImage || "/images/placeholder.jpg",
                    })),
                    vendorId: product.vendorId,
                    totalAmount,
                    shippingAmount: shipping,
                    taxAmount: tax,
                    gstAmount: gst,
                    platformFeeAmount: platformFee,
                    shippingAddress,
                    contactNumber,
                    paymentMethod,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  };
                } else {
                  // This is a single product checkout
                  orderData = {
                    items: [{
                      productId: product.id,
                      name: product.name,
                      quantity: product.quantity,
                      price: product.price,
                      image: product.image,
                    }],
                    vendorId: product.vendorId,
                    totalAmount,
                    shippingAmount: shipping,
                    taxAmount: tax,
                    gstAmount: gst,
                    platformFeeAmount: platformFee,
                    shippingAddress,
                    contactNumber,
                    paymentMethod,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  };
                }

                await createOrder(orderData).unwrap();
                toast.success('Payment successful! Order placed successfully!', {
                  description: 'You will be redirected to your orders page.',
                });

                localStorage.removeItem('buyNowProduct');
                localStorage.removeItem('cartItems');
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
            name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            email: user?.emailAddress || '',
            contact: contactNumber || user?.mobileNo || '',
          },
          theme: {
            color: '#7c3aed',
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled by user');
            },
            escape: true,
            backdropClose: false,
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
        return;
      }

      // Fallback for any other payment method
      toast.error('Selected payment method is not supported yet.');

    } catch (error: any) {
      console.error('Failed to place order:', error);
      toast.error(error?.data?.message || 'Failed to place order. Please try again.');
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

  const subtotal = Number(product.price) * Number(product.quantity);

  // Calculate dynamic shipping based on config
  const shippingAmount = Number(shippingConfig?.amount || 0);
  const shipping = subtotal > 0 && shippingConfig?.isEnabled
    ? (shippingConfig.chargeType === 'percentage'
      ? (subtotal * shippingAmount) / 100
      : shippingAmount)
    : 0;

  // Calculate tax based on dynamic tax settings from API
  const productGST = taxSettings?.productGST || 18;
  const productGSTType = taxSettings?.productGSTType || 'percentage';
  const productPlatformFee = taxSettings?.productPlatformFee || 10;
  const productPlatformFeeType = taxSettings?.productPlatformFeeType || 'percentage';
  const productGSTEnabled = taxSettings?.productGSTEnabled ?? true;
  const productPlatformFeeEnabled = taxSettings?.productPlatformFeeEnabled ?? true;

  const gst = productGSTEnabled
    ? (productGSTType === 'percentage' ? subtotal * (Number(productGST) / 100) : Number(productGST))
    : 0;
  const platformFee = productPlatformFeeEnabled
    ? (productPlatformFeeType === 'percentage' ? subtotal * (Number(productPlatformFee) / 100) : Number(productPlatformFee))
    : 0;
  const tax = gst + platformFee;

  const total = subtotal + shipping + tax;

  // Calculate total savings
  let originalSubtotal = 0;
  if (product.id.startsWith('cart-') && cartItems.length > 0) {
    originalSubtotal = cartItems.reduce((acc, item) => acc + (item.originalPrice || item.price) * item.quantity, 0);
  } else {
    originalSubtotal = (product.originalPrice || product.price) * product.quantity;
  }
  const totalSavings = originalSubtotal - subtotal;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {product?.isCartOrder ? 'Back to Cart' : 'Back to Product'}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details and costs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {product.id.startsWith('cart-') && cartItems.length > 0 ? (
                  <div className="space-y-6">
                    {cartItems.map((item, index) => (
                      <div key={item.productId || item._id || index} className={`flex items-center gap-6 ${index !== 0 ? 'pt-6 border-t border-gray-100' : ''}`}>
                        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border">
                          <Image
                            src={item.productImage || item.image || "/images/placeholder.jpg"}
                            alt={item.productName || item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{item.productName || item.name}</h3>
                          <p className="text-sm text-muted-foreground">Sold by: {item.vendorName || product.vendorName}</p>
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">Quantity: {item.quantity}</span>
                              <span className="text-xs text-muted-foreground">Price: ₹{item.price.toFixed(2)}</span>
                            </div>
                            {item.hasSale && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground line-through">₹{item.originalPrice.toFixed(2)}</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] px-1 py-0 h-4 hover:bg-green-100">
                                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2 text-right">
                            {(item.hasSale || (item.originalPrice && item.originalPrice > item.price)) ? (
                              <>
                                <span className="text-muted-foreground line-through text-xs sm:text-sm">
                                  ₹{(item.originalPrice * item.quantity).toFixed(2)}
                                </span>
                                <span className="font-semibold text-foreground">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] px-1 py-0 h-4 hover:bg-green-100 flex-shrink-0">
                                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                                </Badge>
                              </>
                            ) : (
                              <p className="font-semibold text-foreground text-right">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">Sold by: {product.vendorName}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        {product.isCartOrder ? (
                          <span className="font-medium text-sm">{product.quantity}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(-1)}
                              disabled={product.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-medium text-sm w-4 text-center">{product.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2 text-right">
                        {(product.hasSale || (product.originalPrice && product.originalPrice > product.price)) ? (
                          <>
                            <span className="text-muted-foreground line-through text-sm sm:text-base">
                              ₹{(product.originalPrice * product.quantity).toFixed(2)}
                            </span>
                            <span className="font-semibold text-lg text-foreground">
                              ₹{subtotal.toFixed(2)}
                            </span>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] px-1 py-0 h-4 hover:bg-green-100 flex-shrink-0">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </Badge>
                          </>
                        ) : (
                          <p className="font-semibold text-lg text-foreground text-right w-full">
                            ₹{subtotal.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping & Contact Details</CardTitle>
                <CardDescription>Please confirm where we should send your order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-6">
                  {savedAddresses.length > 0 && !showAddressForm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`relative p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                          onClick={() => handleAddressSelect(addr)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-bold text-sm">{addr.fullName || user?.firstName + ' ' + user?.lastName}</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{addr.address}</p>
                              <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                              <p className="text-sm text-muted-foreground">Phone: {addr.mobileNo || contactNumber}</p>
                              <div className="pt-2">
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="h-auto p-0 text-sky-600 hover:text-sky-700 font-normal"
                                  onClick={(e) => handleEditAddress(addr, e)}
                                >
                                  Edit address
                                </Button>
                              </div>
                            </div>
                            {selectedAddressId === addr._id && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group"
                        onClick={() => setShowAddressForm(true)}
                      >
                        <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Add New Address</span>
                      </button>
                    </div>
                  )}

                  {(savedAddresses.length === 0 || showAddressForm) && (
                    <div className="space-y-4 border p-4 rounded-lg bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{editingAddressId ? 'Edit shipping address' : 'Enter a new shipping address'}</h3>
                        {savedAddresses.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddressId(null);
                              setNewAddress({
                                fullName: '', mobileNo: '', pincode: '', houseNo: '',
                                area: '', landmark: '', city: '', state: '', isPrimary: false
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name (First and Last name)</Label>
                          <Input
                            id="fullName"
                            value={newAddress.fullName}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[a-zA-Z\s]+$/.test(val)) {
                                setNewAddress({ ...newAddress, fullName: val });
                              }
                            }}
                            placeholder="e.g. John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newMobileNo">Mobile Number</Label>
                          <Input
                            id="newMobileNo"
                            value={newAddress.mobileNo}
                            onChange={(e) => {
                              const val = e.target.value;
                              if ((val === '' || /^[0-9]+$/.test(val)) && val.length <= 10) {
                                setNewAddress({ ...newAddress, mobileNo: val });
                              }
                            }}
                            placeholder="10-digit mobile number"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            onChange={(e) => {
                              const val = e.target.value;
                              if ((val === '' || /^[0-9]+$/.test(val)) && val.length <= 6) {
                                setNewAddress({ ...newAddress, pincode: val });
                              }
                            }}
                            placeholder="6-digit [0-9] PIN code"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="houseNo">Flat, House no., Building, Company, Apartment</Label>
                          <Input
                            id="houseNo"
                            value={newAddress.houseNo}
                            onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="area">Area, Street, Sector, Village</Label>
                        <Input
                          id="area"
                          value={newAddress.area}
                          onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="landmark">Landmark</Label>
                          <Input
                            id="landmark"
                            value={newAddress.landmark}
                            onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                            placeholder="e.g. near Apollo Hospital"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Town/City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[a-zA-Z\s]+$/.test(val)) {
                                setNewAddress({ ...newAddress, city: val });
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[a-zA-Z\s]+$/.test(val)) {
                                setNewAddress({ ...newAddress, state: val });
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id="isPrimary"
                          checked={newAddress.isPrimary}
                          onChange={(e) => setNewAddress({ ...newAddress, isPrimary: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="isPrimary">Make this my default address</Label>
                      </div>

                      <div className="pt-4">
                        <Button className="w-full md:w-auto px-8" onClick={handleSaveNewAddress}>
                          {editingAddressId ? 'Save changes' : 'Use this address'}
                        </Button>
                      </div>
                    </div>
                  )}
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
                  {totalSavings > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="text-muted-foreground line-through">₹{originalSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount</span>
                        <span>-₹{totalSavings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  {productGSTEnabled && (
                    <div className="flex justify-between">
                      <span>GST ({productGSTType === 'percentage' ? `${productGST}%` : '₹' + productGST})</span>
                      <span>₹{gst.toFixed(2)}</span>
                    </div>
                  )}
                  {productPlatformFeeEnabled && (
                    <div className="flex justify-between">
                      <span>Platform Fee ({productPlatformFeeType === 'percentage' ? `${productPlatformFee}%` : '₹' + productPlatformFee})</span>
                      <span>₹{platformFee.toFixed(2)}</span>
                    </div>
                  )}
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
