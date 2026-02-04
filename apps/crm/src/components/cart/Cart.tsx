
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
import { clearCart } from '@repo/store/slices/cartSlice';
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
        className={`fixed top-16 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onOpenChange(false)}
      />
      
      <div className={`fixed top-0 right-0 h-screen w-full sm:max-w-md md:max-w-lg lg:max-w-[420px] bg-background sm:border-l border-border z-50 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 h-14 sm:h-16 border-b border-border flex items-center justify-between px-3 sm:px-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold tracking-tight">Shopping Cart</h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="group rounded-md transition-all duration-300 text-muted-foreground hover:text-primary hover:bg-accent h-8 w-8 sm:h-9 sm:w-9"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:rotate-90" />
            </Button>
          </div>

          {isCartLoading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-8">
              <div className="p-4 sm:p-6 bg-muted border border-border rounded-lg mb-4 sm:mb-6">
                <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6 max-w-xs px-4">Start adding products to see them here</p>
              <Button 
                className="px-6 sm:px-8 py-2 rounded-lg transition-all duration-300 text-sm" 
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
              <div className="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                {cartItems.map((item: CartItem) => (
                  <div 
                    key={item.productId} 
                    className="bg-card rounded-lg p-2 sm:p-3 border border-border transition-all duration-300 hover:bg-accent"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative flex-shrink-0">
                        <Image 
                          src={item.productImage || 'https://placehold.co/80x80.png'} 
                          alt={item.productName} 
                          width={60} 
                          height={60} 
                          className="rounded-lg object-cover border border-border sm:w-[72px] sm:h-[72px]" 
                        />
                        <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm line-clamp-2 mb-0.5 sm:mb-1">{item.productName}</h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">₹{item.price.toFixed(2)} each</p>
                        
                        <div className="flex items-center justify-between gap-1 sm:gap-0">
                          <div className="flex items-center gap-0.5 sm:gap-1 bg-muted border border-border rounded-lg p-0.5 sm:p-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-md hover:bg-accent transition-all duration-300" 
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                            <span className="font-medium text-xs sm:text-sm w-5 sm:w-7 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-md hover:bg-accent transition-all duration-300" 
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2">
                            <p className="font-semibold text-xs sm:text-sm text-primary">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-muted-foreground hover:text-destructive rounded-md transition-all duration-300" 
                              onClick={() => handleRemoveFromCart(item.productId)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-shrink-0 border-t border-border p-3 sm:p-4">
                <div className="bg-card rounded-lg p-2.5 sm:p-3 mb-2 sm:mb-3 border border-border">
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-muted-foreground">Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="border-t border-border pt-1.5 sm:pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-semibold">Total</span>
                        <span className="text-base sm:text-lg font-bold text-primary">₹{subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full rounded-lg h-9 sm:h-10 text-sm sm:text-base font-medium transition-all duration-300" 
                  onClick={() => setIsCheckoutModalOpen(true)}
                >
                  <ShoppingCart className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg no-scrollbar mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-0.5 sm:space-y-1">
            <DialogTitle className="text-base sm:text-lg font-semibold">Quick Checkout</DialogTitle>
            <DialogDescription className="text-[10px] sm:text-xs">Review your order and complete purchase</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 sm:space-y-3 py-1.5 sm:py-2">
              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-xs sm:text-sm font-medium">Shipping Address</Label>
                <Input
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  className="h-8 sm:h-9 text-xs sm:text-sm rounded-lg border-border transition-all duration-300"
                />
              </div>

              <div className="bg-muted border border-border rounded-lg p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                <h4 className="font-medium text-xs sm:text-sm mb-1.5 sm:mb-2">Order Summary</h4>
                <div className="space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t border-border pt-1.5">
                    <div className="flex justify-between font-semibold text-sm">
                      <span>Total</span>
                      <span className="text-primary">₹{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <DialogFooter className="gap-1.5 sm:gap-2 pt-1 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)} className="w-full sm:w-auto px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm rounded-lg transition-all duration-300">
              Cancel
            </Button>
            <Button 
              onClick={handlePlaceOrder} 
              disabled={isCreatingOrder}
              className="w-full sm:w-auto px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm rounded-lg transition-all duration-300"
            >
                {isCreatingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-1.5 sm:mr-2"></div>
                    Placing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
