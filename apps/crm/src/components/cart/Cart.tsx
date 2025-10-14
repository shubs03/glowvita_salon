
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
import { useDispatch } from 'react-redux';
import { clearCart } from '@repo/store';
import { useRouter } from 'next/navigation';

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
  const dispatch = useDispatch();
  const router = useRouter();

  const { data: cartData, isLoading: isCartLoading, refetch } = useGetCartQuery(user?._id, {
    skip: !isCrmAuthenticated || !user?._id,
  });
  
  const cartItems: CartItem[] = cartData?.data?.items || [];
  
  console.log("Cart component rendered with items:", cartItems.length);

  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateCrmOrderMutation();

  const subtotal = cartItems.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    console.log("Updating cart item quantity:", { productId, quantity });
    try {
      if (quantity > 0) {
        // Pass just the productId and quantity, not an object
        await updateCartItem({ productId, quantity }).unwrap();
        console.log("Successfully updated cart item quantity:", { productId, quantity });
      } else {
        // Pass just the productId string, not an object
        await removeFromCart(productId).unwrap();
        console.log("Successfully removed item from cart:", productId);
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error('Failed to update quantity.');
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    console.log("Removing item from cart:", productId);
    try {
      // Pass just the productId string, not an object
      await removeFromCart(productId).unwrap();
      console.log("Successfully removed item from cart:", productId);
      toast.success('Item removed from cart.');
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      toast.error('Failed to remove item.');
    }
  };
  
  const handlePlaceOrder = async () => {
    console.log("=== Starting order placement process ===");
    console.log("Current cart items:", cartItems);
    
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

    console.log("Orders to be created:", ordersBySupplier);

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
            console.log(`Creating order for supplier ${supplierId} with ${items.length} items`);
            return createOrder(orderData).unwrap();
        });

        const results = await Promise.all(orderPromises);
        console.log("All orders created successfully:", results);
        
        toast.success("Orders placed successfully!", {
            description: "Your orders have been sent to the respective suppliers."
        });
        
        // Clear all items from the cart one by one
        console.log("Clearing cart items from database...");
        const removePromises = cartItems.map(item => {
            console.log("Removing item from database:", item.productId);
            // Pass just the productId string, not an object
            return removeFromCart(item.productId).unwrap();
        });
        
        try {
            await Promise.all(removePromises);
            console.log("All items removed from database successfully");
        } catch (removeError) {
            console.error("Failed to remove items from database:", removeError);
        }
        
        // Clear the cart in Redux state
        console.log("Dispatching clearCart action...");
        dispatch(clearCart());
        console.log("clearCart action dispatched");
        
        // Also refetch to ensure consistency with backend
        console.log("Refetching cart data...");
        await refetch();
        console.log("Cart data refetched");
        
        // Close the modals
        console.log("Closing modals...");
        setIsCheckoutModalOpen(false);
        onOpenChange(false);
        console.log("Modals closed");
        console.log("=== Order placement process completed ===");
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
                onClick={() => {
                  onOpenChange(false);
                  router.push('/marketplace');
                }}
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
        <DialogContent className="max-w-md sm:max-w-lg lg:max-w-xl scrollbar-hidden mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold">Quick Checkout</DialogTitle>
            <DialogDescription className="text-sm">Review your order and complete purchase</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Shipping Address</Label>
                <Input
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  className="h-10 rounded-lg border-border/30 focus-visible:border-primary"
                />
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-base mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t border-border/20 pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)} className="px-4 h-9">
              Cancel
            </Button>
            <Button 
              onClick={handlePlaceOrder} 
              disabled={isCreatingOrder}
              className="px-6 h-9 bg-blue-600 hover:bg-blue-700"
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
