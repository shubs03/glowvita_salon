
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
import { ArrowLeft, CreditCard, Shield, Lock, Landmark, Wallet, Plus, Minus, MapPin, CheckCircle2, Trash2, Truck, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateClientOrderMutation, useCreatePaymentOrderMutation, useVerifyPaymentMutation, useGetPublicTaxFeeSettingsQuery, useGetPublicShippingConfigQuery, useGetPublicVendorByIdQuery } from '@repo/store/api';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

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
  const [addressFormErrors, setAddressFormErrors] = useState<any>({});

  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('pay-online');
  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const { user, isAuthenticated } = useAuth();
  const { data: taxSettings } = useGetPublicTaxFeeSettingsQuery(undefined);
  const { data: shippingConfig, isFetching: isShippingLoading } = useGetPublicShippingConfigQuery(product?.vendorId, {
    skip: !product?.vendorId
  });
  const [createOrder, { isLoading }] = useCreateClientOrderMutation();
  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  // Fetch vendor data to check subscription
  const { data: vendorResponse } = useGetPublicVendorByIdQuery(product?.vendorId, {
    skip: !product?.vendorId,
  });

  const vendorData = vendorResponse?.vendor;

  const isSubscriptionExpired = useMemo(() => {
    if (!vendorData) return false;

    const subscription = vendorData.subscription;
    if (!subscription) return false;

    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    const status = (subscription.status || '').toLowerCase().trim();

    const isStatusActive = status === 'active';
    const expiredStatuses = ['expired', 'expaired', 'inactive', 'suspended', 'cancelled', 'canceled'];
    const isStatusExpired = expiredStatuses.includes(status);
    const isDateExpired = endDate ? endDate < now : false;

    if (isStatusActive && !isDateExpired) return false;
    return isStatusExpired || isDateExpired;
  }, [vendorData]);

  // Enhanced logging for debugging shipping issues in production
  useEffect(() => {
    if (shippingConfig) {
      console.log('Shipping Config Received:', {
        vendorId: product?.vendorId,
        config: shippingConfig,
        isArray: Array.isArray(shippingConfig)
      });
    }
  }, [shippingConfig, product?.vendorId]);

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
    setAddressFormErrors({});
    setShowAddressForm(true);
  };

  const handleSaveNewAddress = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save your address.');
      router.push('/client-login?redirect=/checkout');
      return;
    }

    // Basic validation
    const errors: any = {};
    if (!newAddress.fullName) errors.fullName = 'Full Name is required';
    if (!newAddress.mobileNo) errors.mobileNo = 'Mobile Number is required';
    if (!newAddress.pincode) errors.pincode = 'Pincode is required';
    if (!newAddress.houseNo) errors.houseNo = 'House no. is required';
    if (!newAddress.area) errors.area = 'Area is required';
    if (!newAddress.city) errors.city = 'City is required';
    if (!newAddress.state) errors.state = 'State is required';

    if (Object.keys(errors).length > 0) {
      setAddressFormErrors(errors);
      toast.error('Please fill all required fields');
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    const pincodeRegex = /^[0-9]{6}$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!nameRegex.test(newAddress.fullName)) {
      setAddressFormErrors({ fullName: 'Full Name should only contain letters' });
      toast.error('Full Name should only contain letters');
      return;
    }
    if (!mobileRegex.test(newAddress.mobileNo)) {
      setAddressFormErrors({ mobileNo: 'Mobile Number must be exactly 10 digits' });
      toast.error('Mobile Number must be exactly 10 digits');
      return;
    }
    if (!pincodeRegex.test(newAddress.pincode)) {
      setAddressFormErrors({ pincode: 'Pincode must be exactly 6 digits' });
      toast.error('Pincode must be exactly 6 digits');
      return;
    }
    if (!nameRegex.test(newAddress.city)) {
      setAddressFormErrors({ city: 'City should only contain letters' });
      toast.error('City should only contain letters');
      return;
    }
    if (!nameRegex.test(newAddress.state)) {
      setAddressFormErrors({ state: 'State should only contain letters' });
      toast.error('State should only contain letters');
      return;
    }

    setAddressFormErrors({});

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

  const handleDeleteAddress = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const res = await fetch(`/api/client/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Address deleted successfully');
        await fetchAddresses();
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
          setShippingAddress('');
          setContactNumber('');
        }
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('An error occurred while deleting the address');
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
    if (isSubscriptionExpired) {
      toast.error('Checkout Unavailable', {
        description: 'This salon is temporarily closed. Orders cannot be placed at this time.'
      });
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in before placing your order.');
      router.push('/client-login?redirect=/checkout');
      return;
    }

    if (showAddressForm) {
      toast.error('Please save your address first before placing the order.');
      return;
    }

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

    // Calculate dynamic shipping based on config - Robust calculation
    // Support both direct object and nested data property if transformResponse was bypassed
    const configData = (shippingConfig as any)?.data || shippingConfig;
    const config = Array.isArray(configData) ? configData[0] : configData;

    const shippingAmount = Number(config?.amount || 0);
    const shippingEnabled = config?.isEnabled === true || String(config?.isEnabled) === 'true';

    console.log('Shipping calculation debug (Place Order):', {
      config,
      shippingAmount,
      shippingEnabled,
      subtotal
    });

    const shipping = subtotal > 0 && shippingEnabled
      ? (config?.chargeType === 'percentage'
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

      // For online payments (UPI, Credit/Debit Card, and Net Banking), use Razorpay
      if (paymentMethod === 'pay-online') {
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
        // Show all payment methods (UPI, Card, NetBanking)
        const displaySequence = ['block.upi', 'card', 'netbanking'];

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
          // Removed restrictive config to allow all payment methods (Cards, NetBanking, etc.) to be visible.
          // The sequence can still be customized if desired.
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

  // Calculate dynamic shipping based on config - Robust calculation
  // Support both direct object and nested data property if transformResponse was bypassed
  const configData = (shippingConfig as any)?.data || shippingConfig;
  const config = Array.isArray(configData) ? configData[0] : configData;

  const shippingAmount = Number(config?.amount || 0);
  const shippingEnabled = config?.isEnabled === true || String(config?.isEnabled) === 'true';

  const shipping = subtotal > 0 && shippingEnabled
    ? (config?.chargeType === 'percentage'
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {product?.isCartOrder ? 'Back to Cart' : 'Back to Product'}
        </Button>

        {isSubscriptionExpired && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">
              <strong>Attention:</strong> This salon is temporarily closed. You won't be able to place your order until the salon is back online.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="space-y-6">
              {product.id.startsWith('cart-') && cartItems.length > 0 ? (
                <div className="space-y-6">
                  {cartItems.map((item, index) => (
                    <div key={item.productId || item._id || index} className={`border border-gray-200 rounded-lg overflow-hidden flex flex-col ${index !== 0 ? 'mt-4' : ''}`}>
                      <div className="bg-white p-3 px-4 border-b border-gray-100 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Fast Delivery</span>
                      </div>
                      <div className="bg-[#EBF3FD] p-4 flex gap-4 sm:gap-6 items-start">
                        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border bg-white p-1">
                          <img
                            src={item.productImage || item.image || "/images/product-placeholder.png"}
                            alt={item.productName || item.name}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/images/product-placeholder.png"; }}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <h3 className="font-semibold text-base text-gray-900">{item.productName || item.name}</h3>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
                            <span className="font-bold text-gray-900">₹{item.price.toFixed(2)}</span>
                            {item.hasSale && (
                              <>
                                <span className="text-sm text-gray-500 line-through">₹{item.originalPrice.toFixed(2)}</span>
                                <span className="text-sm font-bold text-green-600">
                                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-sm text-gray-600 font-medium">Qty</span>
                            <span className="font-medium text-sm bg-white border px-4 py-1 rounded-md">{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-3 px-4 flex justify-between items-center text-sm border-t border-gray-100">
                        <span className="text-gray-500">Sold by : <span className="text-gray-700 font-medium">{item.vendorName || product.vendorName}</span></span>
                        <span className="text-gray-500 font-medium">{shippingEnabled ? 'Standard Delivery' : 'Free Delivery'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-white p-3 px-4 border-b border-gray-100 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Fast Delivery</span>
                  </div>
                  <div className="bg-[#EBF3FD] p-4 flex gap-4 sm:gap-6 items-start">
                    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg border bg-white p-1">
                      <img
                        src={(product.image && product.image.trim()) ? product.image : "/images/product-placeholder.png"}
                        alt={product.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/product-placeholder.png"; }}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
                        <span className="font-bold text-gray-900 text-lg">₹{product.price.toFixed(2)}</span>
                        {(product.hasSale || (product.originalPrice && product.originalPrice > product.price)) && (
                          <>
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</span>
                            <span className="text-sm font-bold text-green-600">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-gray-600 font-medium">Qty</span>
                        {product.isCartOrder ? (
                          <span className="font-medium text-sm bg-white border px-4 py-1 rounded-md">{product.quantity}</span>
                        ) : (
                          <div className="flex items-center bg-white border rounded-md overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-gray-100"
                              onClick={() => handleQuantityChange(-1)}
                              disabled={product.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-medium text-sm w-8 text-center border-x py-1">{product.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-gray-100"
                              onClick={() => handleQuantityChange(1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 px-4 flex justify-between items-center text-sm border-t border-gray-100">
                    <span className="text-gray-500">Sold by : <span className="text-gray-700 font-medium">{product.vendorName}</span></span>
                    <span className="text-gray-500 font-medium">{shippingEnabled ? 'Standard Delivery' : 'Free Delivery'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {savedAddresses.length > 0 && !showAddressForm && (
                <div className="flex flex-col gap-4">
                  {savedAddresses.map((addr, index) => (
                    <div
                      key={addr._id}
                      className={`relative p-5 border rounded-xl cursor-pointer transition-all w-full ${selectedAddressId === addr._id ? 'border-primary/50 bg-primary/[0.02] ring-1 ring-primary/50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      onClick={() => handleAddressSelect(addr)}
                    >
                      {index === 0 && (
                        <div className="mb-3">
                          <h2 className="text-[17px] font-bold text-gray-900 mb-0.5">Shipping & Contact Details</h2>
                          <p className="text-[14px] text-gray-500">Please confirm where you should send your order.</p>
                        </div>
                      )}
                      <div className="flex justify-between items-end">
                        <div className="border-l-[1.5px] border-black pl-4 ml-1">
                          <p className="font-medium text-[15px] text-gray-900">{addr.fullName || user?.firstName + ' ' + user?.lastName}</p>
                          <p className="text-[14px] text-gray-500 mt-1 whitespace-pre-wrap">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-[14px] text-gray-500 mt-0.5">Phone: {addr.mobileNo || contactNumber}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-indigo-100/50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAddressForm(true);
                                setAddressFormErrors({});
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-indigo-100/50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
                            onClick={(e) => { e.stopPropagation(); handleEditAddress(addr, e); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id, e); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(savedAddresses.length === 0 || showAddressForm) && (
                <div className="space-y-4 border p-6 rounded-xl bg-white">
                  <div className="mb-6">
                    <h2 className="text-[17px] font-bold text-gray-900 mb-1">Shipping & Contact Details</h2>
                    <p className="text-[14px] text-gray-500">Please confirm where you should send your order.</p>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{editingAddressId ? 'Edit shipping address' : 'Enter a new shipping address'}</h3>
                    {savedAddresses.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                          setAddressFormErrors({});
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
                      <Label htmlFor="fullName">Full Name (First and Last name) <span className="text-red-500">*</span></Label>
                      <Input
                        id="fullName"
                        value={newAddress.fullName}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^[a-zA-Z\s]+$/.test(val)) {
                            setNewAddress({ ...newAddress, fullName: val });
                            if (addressFormErrors.fullName) {
                              setAddressFormErrors({ ...addressFormErrors, fullName: '' });
                            }
                          }
                        }}
                        placeholder="e.g. John Doe"
                        className={addressFormErrors.fullName ? "border-red-500" : ""}
                      />
                      {addressFormErrors.fullName && <span className="text-red-500 text-xs mt-1 block">{addressFormErrors.fullName}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newMobileNo">Mobile Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="newMobileNo"
                        value={newAddress.mobileNo}
                        onChange={(e) => {
                          const val = e.target.value;
                          if ((val === '' || /^[0-9]+$/.test(val)) && val.length <= 10) {
                            setNewAddress({ ...newAddress, mobileNo: val });
                            if (addressFormErrors.mobileNo) {
                              setAddressFormErrors({ ...addressFormErrors, mobileNo: '' });
                            }
                          }
                        }}
                        placeholder="10-digit mobile number"
                        className={addressFormErrors.mobileNo ? "border-red-500" : ""}
                      />
                      {addressFormErrors.mobileNo && <span className="text-red-500 text-xs mt-1 block">{addressFormErrors.mobileNo}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                      <Input
                        id="pincode"
                        value={newAddress.pincode}
                        onChange={(e) => {
                          const val = e.target.value;
                          if ((val === '' || /^[0-9]+$/.test(val)) && val.length <= 6) {
                            setNewAddress({ ...newAddress, pincode: val });
                            if (addressFormErrors.pincode) {
                              setAddressFormErrors({ ...addressFormErrors, pincode: '' });
                            }
                          }
                        }}
                        placeholder="6-digit [0-9] PIN code"
                        className={addressFormErrors.pincode ? "border-red-500" : ""}
                      />
                      {addressFormErrors.pincode && <span className="text-red-500 text-xs mt-1 block">{addressFormErrors.pincode}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="houseNo">Flat, House no., Building, Company, Apartment <span className="text-red-500">*</span></Label>
                      <Input
                        id="houseNo"
                        value={newAddress.houseNo}
                        onChange={(e) => {
                          setNewAddress({ ...newAddress, houseNo: e.target.value });
                          if (addressFormErrors.houseNo) {
                            setAddressFormErrors({ ...addressFormErrors, houseNo: '' });
                          }
                        }}
                        className={addressFormErrors.houseNo ? "border-red-500" : ""}
                      />
                      {addressFormErrors.houseNo && <span className="text-red-500 text-xs mt-1 block">{addressFormErrors.houseNo}</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area, Street, Sector, Village <span className="text-red-500">*</span></Label>
                    <Input
                      id="area"
                      value={newAddress.area}
                      onChange={(e) => {
                        setNewAddress({ ...newAddress, area: e.target.value });
                        if (addressFormErrors.area) {
                          setAddressFormErrors({ ...addressFormErrors, area: '' });
                        }
                      }}
                      className={addressFormErrors.area ? "border-red-500" : ""}
                    />
                    {addressFormErrors.area && <span className="text-red-500 text-xs mt-1 block">{addressFormErrors.area}</span>}
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
                      <Label htmlFor="city">Town/City <span className="text-red-500">*</span></Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^[a-zA-Z\s]+$/.test(val)) {
                            setNewAddress({ ...newAddress, city: val });
                            if (addressFormErrors.city) {
                              setAddressFormErrors({ ...addressFormErrors, city: '' });
                            }
                          }
                        }}
                        className={addressFormErrors.city ? "border-red-500" : ""}
                      />
                      {addressFormErrors.city && <span className="text-red-500 text-xs mt-1 block">{addressFormErrors.city}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                      <Input
                        id="state"
                        value={newAddress.state}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^[a-zA-Z\s]+$/.test(val)) {
                            setNewAddress({ ...newAddress, state: val });
                            if (addressFormErrors.state) {
                              setAddressFormErrors({ ...addressFormErrors, state: '' });
                            }
                          }
                        }}
                        className={addressFormErrors.state ? "border-red-500" : ""}
                      />
                      {addressFormErrors.state && <span className="text-red-500 text-xs mt-1 block">{addressFormErrors.state}</span>}
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
          </div>

          <div>
            <Card className="lg:sticky lg:top-24 w-full min-h-[446px] rounded-[11px] border border-gray-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-4 pt-5 px-6 border-b-0">
                <CardTitle className="text-[16px] font-bold text-gray-900">Payment Details ({product?.isCartOrder ? cartItems.length : product.quantity} Items)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 p-0">
                <div className="space-y-3 text-[14px] px-6 pb-5">
                  {totalSavings > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Original Price :</span>
                        <span className="text-gray-900 font-medium">₹ {originalSubtotal.toFixed(2)}/-</span>
                      </div>
                      <div className="flex justify-between items-center text-green-600 font-medium">
                        <span>Total Discount :</span>
                        <span>- ₹ {totalSavings.toFixed(2)}/-</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Subtotal :</span>
                        <span className="text-gray-900 font-medium">₹ {subtotal.toFixed(2)}/-</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal :</span>
                      <span className="text-gray-900 font-medium">₹ {subtotal.toFixed(2)}/-</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Shipping :</span>
                    {isShippingLoading ? (
                      <span className="text-xs text-muted-foreground italic animate-pulse">Calculating...</span>
                    ) : (
                      <span className="text-gray-900 font-medium">₹ {shipping.toFixed(2)}/-</span>
                    )}
                  </div>
                  {productGSTEnabled && (
                    <div className="flex justify-between items-center text-green-600 font-medium">
                      <span>GST ({productGSTType === 'percentage' ? `${productGST}%` : '₹' + productGST}) :</span>
                      <span>₹ {gst.toFixed(2)}/-</span>
                    </div>
                  )}
                  {productPlatformFeeEnabled && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Platform Fee ({productPlatformFeeType === 'percentage' ? `${productPlatformFee}%` : '₹' + productPlatformFee}) :</span>
                      <span className="text-gray-900 font-medium">₹ {platformFee.toFixed(2)}/-</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-[15px] text-gray-900">
                    <span>Total Amount :</span>
                    <span>₹ {total.toFixed(2)}/-</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 w-full"></div>

                <div className="p-6">
                  <Label className="font-bold text-[15px] text-gray-900">Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-4 space-y-3">
                    <Label className="flex items-center space-x-4 p-3.5 border border-gray-800 rounded-lg cursor-pointer transition-all has-[:checked]:border-black hover:bg-gray-50 group bg-white">
                      <RadioGroupItem value="pay-online" id="pay-online" className="mt-0 border-gray-400 text-gray-800" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 text-[14.5px]">Pay Online Securely</span>
                          <div className="flex items-center gap-1.5 opacity-90">
                            <div className="h-[18px] w-7 bg-blue-500 rounded flex items-center justify-center"><CreditCard className="h-2.5 w-2.5 text-white" /></div>
                            <div className="h-[18px] w-7 bg-teal-500 rounded flex items-center justify-center"><Landmark className="h-2.5 w-2.5 text-white" /></div>
                            <div className="h-[18px] w-7 bg-green-500 rounded flex items-center justify-center"><Shield className="h-2.5 w-2.5 text-white" /></div>
                          </div>
                        </div>
                        <p className="text-[13px] text-gray-400 mt-0.5">Pay via UPI, Cards or Net Banking</p>
                      </div>
                    </Label>
                    <Label className="flex items-center space-x-4 p-3.5 border border-gray-800 rounded-lg cursor-pointer transition-all has-[:checked]:border-black hover:bg-gray-50 group bg-white">
                      <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" className="mt-0 border-gray-400 text-gray-800" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 text-[14.5px]">Cash on Delivery</span>
                          <div className="flex items-center gap-1.5 opacity-90">
                            <div className="h-[18px] w-7 bg-green-500 rounded flex items-center justify-center"><Wallet className="h-2.5 w-2.5 text-white" /></div>
                          </div>
                        </div>
                        <p className="text-[13px] text-gray-400 mt-0.5">Pay when your order arrives</p>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4 px-6 pb-6 pt-0 border-t-0">
                <div className="flex justify-center w-full">
                  <Button
                    size="lg"
                    className="bg-[#463143] hover:bg-[#342431] text-white font-medium rounded-lg h-[42px] px-10"
                    onClick={handlePlaceOrder}
                    disabled={isLoading || isSubscriptionExpired}
                  >
                    {isLoading ? 'Processing...' :
                      isSubscriptionExpired ? 'Salon Temporarily Closed' :
                        paymentMethod === 'pay-online' ? 'Pay & Place Order' : 'Place Order'
                    }
                  </Button>
                </div>
                <div className="flex items-center justify-center text-[12.5px] text-gray-400 mt-1">
                  <Shield className="h-4 w-4 mr-1.5 opacity-70" />
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
