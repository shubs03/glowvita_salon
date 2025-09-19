
"use client";

import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { X, ShoppingCart, Plus, Minus, Trash2, Building } from 'lucide-react';
import Image from 'next/image';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation, useCreateCrmOrderMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Skeleton } from '@repo/ui/skeleton';

interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  productImage?: string;
  vendorId: string;
  supplierName?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

interface CartProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Cart({ isOpen, onOpenChange }: CartProps) {
  const { user, isCrmAuthenticated } = useCrmAuth();

  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(undefined, {
    skip: !isCrmAuthenticated, // Skip query if user is not authenticated
  });
  
  const cartItems: CartItem[] = cartData?.data?.items || [];

  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateCrmOrderMutation();

  const subtotal = cartItems.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity > 0) {
        await updateCartItem({ productId, quantity }).unwrap();
      } else {
        await removeFromCart({ productId }).unwrap();
      }
    } catch (error) {
      toast.error('Failed to update quantity.');
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await removeFromCart({ productId }).unwrap();
      toast.success('Item removed from cart.');
    } catch (error) {
      toast.error('Failed to remove item.');
    }
  };
  
  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
        toast.error("Shipping address is required.");
        return;
    }

    const ordersBySupplier = cartItems.reduce((acc: Record<string, OrderItem[]>, item: CartItem) => {
        const supplierId = item.vendorId; // `vendorId` on the cart item is actually the supplier ID
        if (!acc[supplierId]) {
            acc[supplierId] = [];
        }
        acc[supplierId].push({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            price: item.price,
        });
        return acc;
    }, {} as Record<string, OrderItem[]>);

    try {
        const orderPromises = Object.entries(ordersBySupplier).map(([supplierId, items]) => {
            const totalAmount = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0);
            const orderData = {
                items,
                supplierId,
                totalAmount,
                shippingAddress,
                vendorId: user?._id // The logged-in vendor is the one placing the order
            };
            return createOrder(orderData).unwrap();
        });

        await Promise.all(orderPromises);
        
        toast.success("Orders placed successfully!", {
            description: "Your orders have been sent to the respective suppliers."
        });
        
        // This will trigger a refetch of the cart, which should now be empty
        // No need to dispatch clearCart manually if the backend clears it
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
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onOpenChange(false)}
      />
      
      <div className={`fixed top-0 right-0 h-screen w-full max-w-[420px] bg-background/95 backdrop-blur-md shadow-2xl z-50 transform transition-all duration-300 ease-in-out border-l border-border/20 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-border/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <p className="text-sm text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 hover:bg-muted rounded-xl"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isCartLoading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="p-6 bg-muted/50 rounded-full mb-6">
                <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs">Start adding products to see them here</p>
              <Button 
                size="lg"
                className="px-8 py-3 rounded-xl" 
                onClick={() => onOpenChange(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item: CartItem) => (
                  <div 
                    key={item.productId} 
                    className="bg-card rounded-xl p-4 border border-border/50 hover:shadow-lg transition-all duration-200 hover:border-primary/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image 
                          src={item.productImage || 'https://placehold.co/80x80.png'} 
                          alt={item.productName} 
                          width={80} 
                          height={80} 
                          className="rounded-xl object-cover border border-border/20" 
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base line-clamp-2 mb-1">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground mb-3">₹{item.price.toFixed(2)} each</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-md hover:bg-background" 
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold text-base w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-md hover:bg-background" 
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-lg text-primary">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive rounded-md" 
                              onClick={() => handleRemoveFromCart(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-border/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="bg-card rounded-xl p-4 mb-4 border border-border/20">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="border-t border-border/20 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-primary">₹{subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary h-12 text-base font-semibold" 
                  onClick={() => setIsCheckoutModalOpen(true)}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Checkout</DialogTitle>
            <DialogDescription>Review your order and complete purchase</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shippingAddress" className="text-base font-medium">Shipping Address</Label>
              <Input
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your complete address"
                className="h-10 rounded-lg"
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="text-base font-semibold">Order Summary</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                {Object.entries(cartItems.reduce((acc: Record<string, { items: CartItem[], total: number }>, item: CartItem) => {
                  const supplier = item.supplierName || 'Unknown Supplier';
                  if (!acc[supplier]) {
                    acc[supplier] = { items: [], total: 0 };
                  }
                  acc[supplier].items.push(item);
                  acc[supplier].total += item.price * item.quantity;
                  return acc;
                }, {} as Record<string, { items: CartItem[], total: number }>)).map(([supplier, data]) => (
                  <div key={supplier} className="bg-white dark:bg-gray-700 rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{supplier}</p>
                        <p className="text-xs text-gray-500">{data.items.length} item(s)</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {data.items.slice(0, 2).map((item: CartItem) => (
                        <div key={item.productId} className="flex justify-between items-center text-sm">
                          <span className="truncate">{item.productName} × {item.quantity}</span>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {data.items.length > 2 && (
                        <p className="text-xs text-gray-500">+{data.items.length - 2} more items</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-sm">Subtotal</span>
                      <span className="font-bold text-blue-600">₹{data.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-xl font-bold text-blue-600">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)} className="px-4">
              Cancel
            </Button>
            <Button 
              onClick={handlePlaceOrder} 
              disabled={isCreatingOrder}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
                {isCreatingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Placing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
