
"use client";

import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@repo/store/hooks';
import { updateQuantity, removeFromCart, clearCart } from '@repo/store/slices/cartSlice';
import { useCreateCrmOrderMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';

interface CartProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Cart({ isOpen, onOpenChange }: CartProps) {
  const dispatch = useAppDispatch();
  const { user } = useCrmAuth();
  const cartItems = useAppSelector(state => state.cart.items);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateCrmOrderMutation();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleUpdateQuantity = (_id: string, quantity: number) => {
    if (quantity > 0) {
        dispatch(updateQuantity({ _id, quantity }));
    } else {
        dispatch(removeFromCart(_id));
    }
  };

  const handleRemoveFromCart = (_id: string) => {
    dispatch(removeFromCart(_id));
  };
  
  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
        toast.error("Shipping address is required.");
        return;
    }

    const ordersBySupplier = cartItems.reduce((acc, item) => {
        const supplierId = item.vendorId;
        if (!acc[supplierId]) {
            acc[supplierId] = [];
        }
        acc[supplierId].push({
            productId: item._id,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            price: item.price,
        });
        return acc;
    }, {} as Record<string, any[]>);

    try {
        const orderPromises = Object.entries(ordersBySupplier).map(([supplierId, items]) => {
            const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const orderData = {
                items,
                supplierId,
                totalAmount,
                shippingAddress
            };
            return createOrder(orderData).unwrap();
        });

        await Promise.all(orderPromises);
        
        toast.success("Orders placed successfully!", {
            description: "Your orders have been sent to the respective suppliers."
        });
        
        dispatch(clearCart());
        setIsCheckoutModalOpen(false);
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to place orders:", error);
        toast.error("Failed to place orders. Please try again.");
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onOpenChange(false)}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm mt-1">Add products from the marketplace to get started.</p>
              <Button variant="outline" className="mt-6" onClick={() => onOpenChange(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex items-center gap-4 border-b pb-4 last:border-b-0">
                  <Image src={item.productImage || 'https://placehold.co/64x64.png'} alt={item.productName} width={64} height={64} className="rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="font-medium truncate">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive mt-2" onClick={() => handleRemoveFromCart(item._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="p-6 border-t">
              <div className="flex justify-between font-semibold text-lg mb-4">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <Button size="lg" className="w-full" onClick={() => setIsCheckoutModalOpen(true)}>
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Order</DialogTitle>
            <DialogDescription>Please confirm your shipping address and place your order.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Input
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full shipping address"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="p-4 bg-secondary rounded-md space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(cartItems.reduce((acc, item) => {
                  const supplier = item.supplierName || 'Unknown Supplier';
                  if (!acc[supplier]) {
                    acc[supplier] = { items: [], total: 0 };
                  }
                  acc[supplier].items.push(item);
                  acc[supplier].total += item.price * item.quantity;
                  return acc;
                }, {} as Record<string, { items: any[], total: number }>)).map(([supplier, data]) => (
                  <div key={supplier} className="pb-2 border-b last:border-b-0">
                    <p className="font-semibold text-sm">{supplier}</p>
                    <p className="text-xs text-muted-foreground">{data.items.length} item(s)</p>
                    <p className="text-sm font-medium text-right">Subtotal: ₹{data.total.toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Grand Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)}>Cancel</Button>
            <Button onClick={handlePlaceOrder} disabled={isCreatingOrder}>
                {isCreatingOrder ? 'Placing Orders...' : 'Place Order'}
            </Button>
          