
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Search, ShoppingCart, Info, X, Heart, Eye, Minus, Plus, Building, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useGetSupplierProductsQuery, useGetSupplierProfileQuery } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { useAppDispatch } from '@repo/store/hooks';
import { addToCart } from '@repo/store/slices/cartSlice';
import { Skeleton } from '@repo/ui/skeleton';
import { Label } from '@repo/ui/label';

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
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { data: supplierData, isLoading: isSupplierLoading } = useGetSupplierProfileQuery(selectedSupplierId, { skip: !selectedSupplierId });
  const dispatch = useAppDispatch();
  
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

  if(isLoading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                        <div className="relative">
                            <Skeleton className="h-10 w-64" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-0">
                                    <div className="relative aspect-square">
                                        <Skeleton className="h-full w-full rounded-t-lg" />
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-6 w-1/4" />
                                        <Skeleton className="h-9 w-full mt-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-center text-destructive">Failed to load products from marketplace. Please try again later.</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Marketplace</h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Supplier Products</CardTitle>
              <CardDescription>Browse and order products from approved suppliers.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full md:w-80 pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <Card key={product._id} className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                  <div className="relative aspect-square cursor-pointer" onClick={() => handleViewDetails(product)}>
                    <Image src={product.productImage || 'https://placehold.co/400x400.png'} alt={product.productName} layout="fill" className="object-cover rounded-t-lg group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold truncate flex-grow">{product.productName}</h3>
                    <p className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={(e) => handleViewSupplier(e, product.vendorId)}>
                      By: {product.supplierName || 'Supplier'}
                    </p>
                    <div className="flex justify-between items-baseline mt-2">
                        <p className="text-lg font-bold">₹{product.price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                    </div>
                    <Button className="w-full mt-3" size="sm" onClick={() => handleAddToCart(product, 1)}>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.productName}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-6 py-4">
              <Image src={selectedProduct.productImage || 'https://placehold.co/400x400.png'} alt={selectedProduct.productName} width={400} height={400} className="rounded-md mx-auto" />
              <div className="space-y-4">
                <p className="text-muted-foreground">{selectedProduct.description}</p>
                <p className="text-sm text-muted-foreground">Category: {selectedProduct.category.name}</p>
                <p className="text-2xl font-bold">₹{selectedProduct.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Stock: {selectedProduct.stock}</p>
                <div className="flex items-center gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <div className="flex items-center gap-1 border rounded-md p-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus className="h-4 w-4" /></Button>
                        <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-12 h-8 text-center border-0" />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setQuantity(q => q+1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
                <Button className="w-full" onClick={() => handleAddToCart(selectedProduct, quantity)}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Supplier Profile Modal */}
      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supplier Profile</DialogTitle>
          </DialogHeader>
          {isSupplierLoading ? <Skeleton className="h-48 w-full" /> : supplierData && (
            <div className="flex flex-col items-center text-center p-4">
              <Image src={supplierData.profileImage || 'https://placehold.co/100x100.png'} alt={supplierData.shopName} width={100} height={100} className="rounded-full mx-auto border-4 border-primary/20 shadow-lg" />
              <h3 className="text-xl font-semibold mt-4">{supplierData.shopName}</h3>
              <p className="text-muted-foreground text-sm">{supplierData.email}</p>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                <MapPin className="h-4 w-4"/>
                <span>{supplierData.city}, {supplierData.country}</span>
              </div>
              <p className="mt-4 text-sm text-center bg-secondary p-3 rounded-lg">{supplierData.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

```
  </change>
  <change>
    <file>apps/crm/src/components/cart/Cart.tsx</file>
    <content><![CDATA[
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
