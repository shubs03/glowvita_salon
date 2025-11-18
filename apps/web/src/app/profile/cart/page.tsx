
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { X, Plus, Minus, ShoppingCart, ArrowLeft, Trash2, Shield, Tag, Search, DollarSign, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetClientCartQuery, useUpdateClientCartItemMutation, useRemoveFromClientCartMutation } from '@repo/store/api';
import { useAppSelector, useAppDispatch } from "@repo/store/hooks";
import {
  updateQuantity,
  removeFromCart as removeFromLocalCart,
  setCurrentUser,
} from "@repo/store/slices/cartSlice";
import { useAuth } from '@/hooks/useAuth';
import { useCartSync } from "@/hooks/useCartSync";
import { toast } from 'sonner';
import { StatCard } from '../../../components/profile/StatCard';
import { cn } from '@repo/ui/cn';

interface CartItem {
  _id: string;
  productId: string; 
  productName: string;
  price: number;
  quantity: number;
  productImage?: string;
}

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const localCartItems = useAppSelector((state) => state.cart.items);
  const currentUserId = useAppSelector((state) => state.cart.currentUserId);

  // Initialize cart sync
  useCartSync();

  const { data: cartData, isLoading } = useGetClientCartQuery(undefined, { skip: !isAuthenticated || !user?._id });
  const [updateCartItem] = useUpdateClientCartItemMutation();
  const [removeFromCartAPI] = useRemoveFromClientCartMutation();
  
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Use API cart if authenticated, otherwise use local cart
  const cartItems =
    isAuthenticated && user?._id ? cartData?.data?.items || [] : localCartItems;

  // Filter cart items based on search term
  const filteredCartItems = cartItems.filter((item: any) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      if (isAuthenticated && user?._id) {
        // User is authenticated, use API
        if (quantity > 0) {
          const result = await updateCartItem({ productId, quantity }).unwrap();
          toast.success('Cart updated successfully');
        } else {
          await removeFromCartAPI({ productId }).unwrap();
          toast.success('Item removed from cart');
        }
      } else {
        // User is not authenticated, use local Redux store
        if (quantity > 0) {
          dispatch(updateQuantity({ _id: productId, quantity }));
        } else {
          dispatch(removeFromLocalCart(productId));
        }
      }
    } catch (error: any) {
      // Handle stock validation errors from the API
      const errorMessage = error?.data?.message || 'Failed to update quantity.';
      toast.error(errorMessage);
      
      // If there's an available stock value, show it
      if (error?.data?.availableStock !== undefined) {
        toast.warning(`Only ${error.data.availableStock} units available in stock.`);
      }
    }
  };

  const openRemoveModal = (productId: string) => {
    setItemToRemove(productId);
    setIsRemoveModalOpen(true);
  };

  const handleRemoveItem = async () => {
    if (itemToRemove) {
      try {
        if (isAuthenticated && user?._id) {
          // User is authenticated, use API
          await removeFromCartAPI({ productId: itemToRemove }).unwrap();
        } else {
          // User is not authenticated, use local Redux store
          dispatch(removeFromLocalCart(itemToRemove));
        }
        setIsRemoveModalOpen(false);
        setItemToRemove(null);
        toast.success("Item removed from cart.");
      } catch (error) {
        toast.error("Failed to remove item.");
      }
    }
  };

  const cancelRemove = () => {
    setIsRemoveModalOpen(false);
    setItemToRemove(null);
  };

  const subtotal = cartItems.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 50.00 : 0; 
  const tax = subtotal * 0.08;
  const discount = subtotal * 0.1; // 10% discount
  const total = subtotal + shipping + tax - discount;
  const itemCount = cartItems.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      // Try to get vendorId from the first cart item
      let vendorId = (cartItems[0] as any).vendorId;
      
      // If vendorId is not directly available, check other possible fields
      if (!vendorId) {
        vendorId = (cartItems[0] as any).supplierId || 
                  (cartItems[0] as any).vendor_id ||
                  null;
      }
      
      const checkoutProduct = {
        id: cartItems.map((item: any) => item.productId || item._id).join(','),
        name: cartItems.length > 1 ? `${cartItems.length} items` : cartItems[0].productName,
        price: total,
        image: cartItems[0].productImage,
        quantity: 1,
        vendorId: vendorId,
        vendorName: (cartItems[0] as any).supplierName || (cartItems[0] as any).vendorName,
      };
      
      // Log for debugging
      console.log('Checkout product data:', checkoutProduct);
      
      localStorage.setItem('buyNowProduct', JSON.stringify(checkoutProduct));
      router.push('/checkout');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={ShoppingCart} title="Items in Cart" value={cartItems.length} change={`Total quantity: ${itemCount}`} />
        <StatCard icon={DollarSign} title="Cart Value" value={`₹${subtotal.toFixed(0)}`} change="Before discounts" />
        <StatCard icon={Tag} title="You Save" value={`₹${discount.toFixed(0)}`} change="Total savings" />
      </div>

      {/* Main Cart Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>My Cart Items</CardTitle>
              <CardDescription>Review and manage your cart items before checkout.</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cart items..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && isAuthenticated ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading cart...
                    </TableCell>
                  </TableRow>
                ) : filteredCartItems.length > 0 ? (
                  filteredCartItems.map((item: any) => (
                    <TableRow key={item.productId || item._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={item.productImage || "https://placehold.co/48x48.png"}
                              alt={item.productName}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.productId || item._id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.productId || item._id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openRemoveModal(item.productId || item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : cartItems.length > 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No items match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Your cart is empty</p>
                        <Button asChild size="sm">
                          <Link href="/profile">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Cart Summary and Checkout */}
          {cartItems.length > 0 && (
            <div className="mt-6 border-t pt-6">
              {/* Continue Shopping Section */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" asChild className="shrink-0">
                      <Link href="/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
                      </Link>
                    </Button>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                  </div>
                  
                  {/* Free shipping info - compact version */}
                  <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>Free shipping on orders over ₹500</span>
                  </div>
                </div>
              </div>

              {/* Order Summary Card - Landscape Layout */}
              <Card className="bg-gradient-to-r from-muted/20 to-muted/40 border-muted shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Order Summary
                    </CardTitle>
                    {discount > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 py-2 px-4 rounded-lg">
                        <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                          <span>🎉</span>
                          You saved ₹{discount.toFixed(2)}!
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Section - Order Details */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">₹{subtotal.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Subtotal</div>
                          <div className="text-xs text-muted-foreground mt-1">({itemCount} items)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">-₹{discount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Discount</div>
                          <div className="text-xs text-green-600 mt-1">You save!</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {shipping > 0 ? `₹${shipping.toFixed(2)}` : 'Free'}
                          </div>
                          <div className="text-sm text-muted-foreground">Shipping</div>
                          <div className="text-xs text-green-600 mt-1">
                            {shipping === 0 ? 'Qualified!' : 'Standard'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">₹{tax.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Tax</div>
                          <div className="text-xs text-muted-foreground mt-1">(8% incl.)</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Total & Checkout */}
                    <div className="lg:col-span-1 flex flex-col justify-center">
                      <div className="bg-white/60 border border-border/40 rounded-lg p-6 text-center">
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground mb-2">Total Amount</div>
                          <div className="text-4xl font-bold text-primary mb-2">₹{total.toFixed(2)}</div>
                        </div>
                        
                        <Button 
                          size="lg" 
                          className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 mb-4"
                          onClick={handleCheckout}
                          disabled={cartItems.length === 0}
                        >
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Proceed to Checkout
                        </Button>
                        
                        <p className="text-xs text-muted-foreground">
                          By proceeding, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Item Confirmation Modal */}
      <Dialog open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold">
              Remove Item from Cart
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Are you sure you want to remove this item from your cart? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {itemToRemove && (
            <div className="py-4">
              {(() => {
                const item = cartItems.find(
                  (i: any) => (i.productId || i._id) === itemToRemove
                );
                return item ? (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.productImage || "https://placehold.co/80x80.png"}
                        alt={item.productName}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-sm">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                      <p className="text-sm font-medium">
                        Total: ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={cancelRemove} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveItem}
              className="flex-1"
            >
              Remove Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
