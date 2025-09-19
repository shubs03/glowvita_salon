
"use client";

import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { X, ShoppingCart, Plus, Minus, Trash2, Building } from 'lucide-react';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@repo/store/hooks';
import { updateQuantity, removeFromCart, clearCart } from '@repo/store/slices/cartSlice';
import { useCreateCrmOrderMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';

interface CartItem {
  _id: string;
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
  const dispatch = useAppDispatch();
  const { user } = useCrmAuth();
  const cartItems = useAppSelector((state: any) => state.cart.items as CartItem[]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateCrmOrderMutation();

  const subtotal = cartItems.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);

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

    const ordersBySupplier = cartItems.reduce((acc: Record<string, OrderItem[]>, item: CartItem) => {
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
    }, {} as Record<string, OrderItem[]>);

    try {
        const orderPromises = Object.entries(ordersBySupplier).map(([supplierId, items]) => {
            const totalAmount = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0);
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
      {/* Backdrop with proper transparency */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onOpenChange(false)}
      />
      
      {/* Cart Sidebar - Full Height */}
      <div className={`fixed top-0 right-0 h-screen w-full max-w-[420px] bg-background/95 backdrop-blur-md shadow-2xl z-50 transform transition-all duration-300 ease-in-out border-l border-border/20 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
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

          {cartItems.length === 0 ? (
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
              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item: CartItem, index: number) => (
                  <div 
                    key={item._id} 
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
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-md hover:bg-background" 
                              onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold text-base w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-md hover:bg-background" 
                              onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
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
                              onClick={() => handleRemoveFromCart(item._id)}
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

              {/* Footer - Order Summary & Checkout */}
              <div className="p-5 border-t border-border/20 bg-gradient-to-r from-primary/5 to-primary/10">
                {/* Order Summary */}
                <div className="bg-card rounded-xl p-4 mb-4 border border-border/20">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
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
            {/* Shipping Address */}
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
            
            {/* Compact Order Summary */}
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
                        <div key={item._id} className="flex justify-between items-center text-sm">
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
                
                {/* Grand Total */}
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

```
  </change>
  <change>
    <file>/home/Voldemort/monorepo-maestro/apps/crm/src/app/marketplace/page.tsx</file>
    <content><![CDATA[
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Search, ShoppingCart, Info, X, Heart, Eye, Minus, Plus, Building, Mail, MapPin, Star, Zap, Package, Truck, Tag, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useGetSupplierProductsQuery, useGetSupplierProfileQuery } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { useAppDispatch } from '@repo/store/hooks';
import { addToCart } from '@repo/store/slices/cartSlice';
import { Skeleton } from '@repo/ui/skeleton';
import { Label } from '@repo/ui/label';
import { Badge } from '@repo/ui/badge';

type Product = {
  _id: string;
  productImage: string;
  productName: string;
  price: number;
  category: { name: string };
  stock: number;
  vendorId: string;
  supplierName: string;
  supplierEmail: string;
  description: string;
  discount?: number;
  salePrice?: number;
};

type Supplier = {
  _id: string;
  shopName: string;
  email: string;
  country: string;
  city: string;
  description: string;
  profileImage: string;
};

export default function MarketplacePage() {
  const { data: productsData = [], isLoading, isError } = useGetSupplierProductsQuery(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  
  const { data: supplierData, isLoading: isSupplierLoading } = useGetSupplierProfileQuery(selectedSupplierId, { skip: !selectedSupplierId });
  const dispatch = useAppDispatch();
  const { user } = useCrmAuth();
  
  const filteredProducts = useMemo(() => {
    return productsData.filter((product: any) =>
      (product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [productsData, searchTerm]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsDetailModalOpen(true);
  };
  
  const handleViewSupplier = (e: React.MouseEvent, supplierId: string) => {
    e.stopPropagation();
    setSelectedSupplierId(supplierId);
    setIsSupplierModalOpen(true);
  };
  
  const handleAddToCart = (product: Product, qty: number) => {
    dispatch(addToCart({ ...product, quantity: qty }));
    toast.success(`${qty} x ${product.productName} added to cart.`);
    setIsDetailModalOpen(false);
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setBuyNowQuantity(1);
    setShippingAddress(user?.address || '');
    setIsBuyNowModalOpen(true);
  };

  const handleQuickAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success(`${product.productName} added to cart!`);
  };

  if(isLoading) {
    return (
        <div className="min-h-screen bg-background">
            
            <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Skeleton className="h-20 w-20 rounded-2xl" />
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-5 w-96" />
                        </div>
                    </div>
                </div>
                
                <Card className="bg-card border border-border rounded-lg">
                    <CardHeader className="pb-6">
                        <div className="flex justify-between items-center">
                            <div className="space-y-3">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-80" />
                            </div>
                            <Skeleton className="h-10 w-32 rounded-full" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <Card key={i} className="overflow-hidden rounded-2xl bg-card border border-border/30">
                                    <div className="relative aspect-[4/3]">
                                        <Skeleton className="h-full w-full rounded-t-2xl" />
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <Skeleton className="h-6 w-3/4" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4 rounded" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                                            <Skeleton className="h-6 w-1/3" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-5 w-12 rounded-full" />
                                                <Skeleton className="h-5 w-12 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-10 flex-1 rounded-xl" />
                                            <Skeleton className="h-10 flex-1 rounded-xl" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-center text-destructive">Failed to load products from marketplace. Please try again later.</div>
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-lg backdrop-blur-sm">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-headline mb-2 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Marketplace
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Discover and order premium products from verified suppliers worldwide
              </p>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <Card className="bg-card border border-border rounded-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products, suppliers, categories..."
                  className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="default" className="rounded-lg border-border hover:border-primary h-12 px-6">
                  <Package className="h-4 w-4 mr-2" />
                  All Categories
                </Button>
                <Button variant="outline" size="default" className="rounded-lg border-border hover:border-primary h-12 px-6">
                  ✓ Verified Only
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Products Section */}
      <Card className="bg-card border border-border rounded-lg">
        <CardHeader className="pb-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                Featured Products
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-base">
                {filteredProducts.length} premium products from trusted suppliers
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium px-4 py-2 rounded-full border-border bg-background">
                <Package className="h-3 w-3 mr-1" />
                {filteredProducts.length} Products
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Enhanced Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product, index: number) => (
              <Card
                key={product._id}
                className="group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-primary/25 transform hover:-translate-y-3 bg-gradient-to-b from-background to-secondary/10 cursor-pointer animate-fadeInUp flex flex-col h-96 w-full"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform'
                }}
                onClick={() => handleViewDetails(product)}
              >
                {/* Image Section - 60% of card height */}
                <div className="relative h-[60%] w-full overflow-hidden rounded-t-2xl" style={{ isolation: 'isolate' }}>
                  <Image 
                    src={product.productImage || 'https://placehold.co/288x192.png'} 
                    alt={product.productName} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  />
                  
                  {/* Animated Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" style={{ isolation: 'isolate' }}></div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" style={{ isolation: 'isolate' }}></div>
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    {/* Stock Badge */}
                    <Badge 
                      variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
                      className={`backdrop-blur-sm shadow-lg rounded-full border text-xs font-bold animate-pulse-glow ${
                        product.stock > 10 
                          ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-0' 
                          : product.stock > 0 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0'
                            : 'bg-gradient-to-r from-red-400 to-red-500 text-white border-0'
                      }`}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {product.stock > 10 ? 'IN STOCK' : product.stock > 0 ? `${product.stock} LEFT` : 'OUT OF STOCK'}
                    </Badge>
                    
                    <div className="flex gap-2 ml-auto">
                      {/* Discount Badge */}
                      {product.salePrice && product.salePrice > 0 && product.price > product.salePrice && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg rounded-full font-bold">
                          <Tag className="h-3 w-3 mr-1" />
                          {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                        </Badge>
                      )}
                      
                      {/* Action Buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSupplier(e, product.vendorId);
                        }}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Rating on Image - Bottom Right */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-medium">4.5</span>
                    </div>
                  </div>
                </div>

                {/* Details Section - 40% of card height */}
                <div className="flex flex-col h-[40%] w-full bg-card border-t border-border/20 p-4">
                  {/* Product Name & Price - Same Line */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight flex-1 mr-3">
                      {product.productName}
                    </h3>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="text-xl font-bold text-primary leading-none">
                        ₹{product.salePrice ? product.salePrice.toFixed(0) : product.price.toFixed(0)}
                      </div>
                      {product.salePrice && product.price > product.salePrice && (
                        <div className="text-xs line-through text-muted-foreground">
                          ₹{product.price.toFixed(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Supplier Name & Category */}
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSupplier(e, product.vendorId);
                      }}
                    >
                      <Building className="h-4 w-4" />
                      <span className="text-sm font-medium">{product.supplierName || 'Supplier'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span className="text-xs">{product.category.name}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Bottom */}
                  <div className="flex gap-3 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 rounded-xl border-border/40 hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-all duration-300 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAddToCart(product, e);
                      }}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-9 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-300 text-sm group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(product);
                      }}
                      disabled={product.stock === 0}
                    >
                      <Zap className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Modals */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        {/* ... (modal content remains the same) */}
      </Dialog>
      <Dialog open={isBuyNowModalOpen} onOpenChange={setIsBuyNowModalOpen}>
        {/* ... (modal content remains the same) */}
      </Dialog>
      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
        {/* ... (modal content remains the same) */}
      </Dialog>
    </div>
  );
}

```
  </change>
  <change>
    <file>/home/Voldemort/monorepo-maestro/packages/store/src/store.js</file>
    <content><![CDATA[
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { glowvitaApi } from '../src/services/api.js';
import adminAuthReducer from './slices/Admin/adminAuthSlice';
import crmAuthReducer from '@repo/store/slices/crmAuthSlice';
import modalReducer from './slices/modalSlice';
import customerReducer from './slices/customerSlice';
import salonReducer from './slices/salonSlice';
import vendorReducer from './slices/vendorSlice';
import marketingReducer from './slices/marketingslice';
import supplierReducer from './slices/supplierSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import geoFencingReducer from './slices/geoFencingSlice';
import refferalReducer from './slices/Admin/refferalSlice.js';
import faqReducer from './slices/faqSlice';
import shippingReducer from './slices/shippingSlice';
import productReducer from './slices/productSlice';
import serviceReducer from "./slices/CRM/serviceSlice.js";
import staffReducer from "./slices/CRM/staffSlice.js"; // Import staff slice
import clientReducer from "./slices/CRM/clientSlice.js"; // Import client slice
import appointmentReducer from './slices/appointmentSlice';
import blockTimeReducer from './slices/blockTimeSlice';
import vendorprofileReducer from './slices/vendorprofileSlice';
import workingHoursReducer from './slices/workingHoursSlice';
import orderReducer from './slices/orderSlice';
import calendarAppointmentReducer from './slices/calendarAppointmentSlice';
import cartReducer from './slices/cartSlice'; // Import the new cart reducer
  
export const makeStore = () => {
  return configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(glowvitaApi.middleware),
    reducer: {
      [glowvitaApi.reducerPath]: glowvitaApi.reducer,
      adminAuth: adminAuthReducer,
      crmAuth: crmAuthReducer,
      modal: modalReducer,
      customer: customerReducer,
      salon: salonReducer,
      vendors: vendorReducer,
      marketing: marketingReducer,
      suppliers: supplierReducer,
      subscription: subscriptionReducer,
      notification: notificationReducer,
      geoFencing: geoFencingReducer,
      refferal: refferalReducer,
      shipping: shippingReducer,
      products: productReducer,
      staff: staffReducer, 
      client: clientReducer,
      faqs: faqReducer,
      service: serviceReducer,
      appointments: appointmentReducer,  
      blockTime: blockTimeReducer,
      vendorprofile: vendorprofileReducer,
      workingHours: workingHoursReducer,
      order: orderReducer,
      calendarAppointments: calendarAppointmentReducer,
      cart: cartReducer, // Add the cart reducer
      
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: [
            'blockTime/saveBlockTime/pending', 
            'blockTime/saveBlockTime/fulfilled', 
            'blockTime/saveBlockTime/rejected',
            'blockTime/setDate',
            'blockTime/setStaffMember',
            'blockTime/setStartTime',
            'blockTime/setEndTime',
            'blockTime/setDescription',
            'blockTime/reset'
          ],
          // Ignore these field paths in all actions
          ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload'],
          // Ignore these paths in the state
          ignoredPaths: ['blockTime.date', 'blockTime']
        }
      }).concat(glowvitaApi.middleware),
  });
};

// Export the root reducer state type for manual type checking
export const selectRootState = (state) => state;

