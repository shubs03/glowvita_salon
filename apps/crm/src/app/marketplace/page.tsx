"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Search, ShoppingCart, Info, X, Heart, Eye, Minus, Plus, Building, Mail, MapPin, Star, Zap, Package, Truck, Tag } from 'lucide-react';
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
  const [shippingAddress, setShippingAddress] = useState('');
  
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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and order premium products from verified suppliers
          </p>
        </div>
        
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products, suppliers..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  All Categories
                </Button>
                <Button variant="outline" size="sm">
                  Verified Only
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Featured Products
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredProducts.length} products available from trusted suppliers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm font-medium px-3 py-1 rounded-full">
                {filteredProducts.length} Products
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product, index) => (
              <Card 
                key={product._id} 
                className="group relative w-72 h-[28rem] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 hover:border-primary/30"
                onClick={() => handleViewDetails(product)}
              >
                {/* Gradient Overlay for Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                {/* Product Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={product.productImage || 'https://placehold.co/288x192.png'} 
                    alt={product.productName} 
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  {/* Stock Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <Badge 
                      variant={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "destructive"}
                      className="px-3 py-1 text-sm font-semibold rounded-full bg-opacity-90 shadow-sm"
                    >
                      {product.stock > 0 ? `${product.stock} in Stock` : 'Out of Stock'}
                    </Badge>
                  </div>
                  {/* Discount Badge */}
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-4 right-4 z-20">
                      <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold rounded-full bg-red-500 text-white">
                        <Tag className="h-4 w-4 mr-1" />
                        {product.discount}% Off
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 space-y-4 flex flex-col h-[calc(100%-12rem)]">
                  {/* Header: Category and Rating */}
                  {/* <div className="flex justify-between items-center">
                    <Badge 
                      variant="outline" 
                      className="text-xs font-semibold bg-primary/10 text-primary border-primary/30 rounded-full px-3 py-1"
                    >
                      {product.category.name}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div> */}

                  {/* Product Title */}
                  <h3 className="text-lg font-semibold line-clamp-2 leading-6 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors duration-300">
                    {product.productName}
                  </h3>

                  {/* Supplier Info */}
                  <div 
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors cursor-pointer"
                    onClick={(e) => handleViewSupplier(e, product.vendorId)}
                  >
                    <Building className="h-4 w-4" />
                    <span className="truncate font-medium">{product.supplierName || 'Supplier'}</span>
                  </div>

                  {/* Price and Features */}
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <div className="text-xl font-bold text-primary">₹{product.price.toFixed(0)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">per unit</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <Truck className="h-4 w-4" />
                        Free
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Zap className="h-4 w-4" />
                        Fast
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10 rounded-full text-sm font-semibold border-gray-300 dark:border-gray-700 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                      onClick={(e) => handleQuickAddToCart(product, e)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-10 rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(product);
                      }}
                      disabled={product.stock === 0}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>

                  {/* Quick Action Buttons (Hover) */}
                  <div className="absolute top-48 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full bg-white/95 dark:bg-gray-800/95 shadow-md hover:bg-white dark:hover:bg-gray-800 hover:scale-110 transition-transform duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSupplier(e, product.vendorId);
                      }}
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full bg-white/95 dark:bg-gray-800/95 shadow-md hover:bg-white dark:hover:bg-gray-800 hover:scale-110 transition-transform duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Empty State */}
          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 mb-6 bg-muted rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search terms or browse all products.</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          )}
          
          {/* Load More */}
          {productsData.length > 20 && filteredProducts.length >= 20 && (
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 rounded-xl border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                onClick={() => {
                  // Logic to load more products
                  console.log('Loading more products...');
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Load More Products
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedProduct?.productName}</DialogTitle>
            <DialogDescription>Product details and specifications</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-8 py-6">
              {/* Product Image */}
              <div className="relative">
                <div className="aspect-square relative rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                  <Image 
                    src={selectedProduct.productImage || 'https://placehold.co/500x500.png'} 
                    alt={selectedProduct.productName} 
                    fill
                    className="object-cover" 
                  />
                </div>
                <div className="absolute top-4 left-4">
                  <Badge variant={selectedProduct.stock > 10 ? "secondary" : "destructive"} className="rounded-full">
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                  </Badge>
                </div>
              </div>
              
              {/* Product Details */}
              <div className="space-y-6">
                {/* Supplier Info */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedProduct.supplierName || 'Supplier'}</p>
                    <p className="text-sm text-muted-foreground">Verified Supplier</p>
                  </div>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                  </div>
                )}

                {/* Category & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <Badge variant="outline" className="mt-1 rounded-full">
                      {selectedProduct.category.name}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">(4.5)</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-primary">₹{selectedProduct.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">per unit</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Stock Available</p>
                      <p className="text-xl font-bold">{selectedProduct.stock}</p>
                    </div>
                  </div>
                </div>
                
                {/* Quantity Selector */}
                <div className="space-y-3">
                  <Label htmlFor="quantity" className="text-base font-semibold">Quantity</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border/30 rounded-xl p-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-lg" 
                        onClick={() => setQuantity(q => Math.max(1, q-1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        id="quantity" 
                        type="number" 
                        value={quantity} 
                        onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} 
                        className="w-20 h-10 text-center border-0 focus:ring-0 font-bold text-lg" 
                        min="1"
                        max={selectedProduct.stock}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-lg" 
                        onClick={() => setQuantity(q => Math.min(selectedProduct.stock, q+1))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold">Total: ₹{(selectedProduct.price * quantity).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {quantity > 1 && `₹${selectedProduct.price.toFixed(2)} × ${quantity}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl" 
                    onClick={() => handleAddToCart(selectedProduct, quantity)}
                    disabled={selectedProduct.stock === 0}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button 
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80" 
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleBuyNow(selectedProduct);
                    }}
                    disabled={selectedProduct.stock === 0}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Buy Now Modal */}
      <Dialog open={isBuyNowModalOpen} onOpenChange={setIsBuyNowModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg lg:max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold">Quick Checkout</DialogTitle>
            <DialogDescription className="text-sm">Complete your purchase in just a few clicks</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-2">
              {/* Product Summary */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/20 to-muted/5 rounded-lg">
                <Image 
                  src={selectedProduct.productImage || 'https://placehold.co/60x60.png'} 
                  alt={selectedProduct.productName} 
                  width={60} 
                  height={60} 
                  className="rounded-lg object-cover border border-border/20" 
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base truncate">{selectedProduct.productName}</h4>
                  <p className="text-xs text-muted-foreground truncate">By: {selectedProduct.supplierName}</p>
                  <p className="text-lg font-bold text-primary">₹{selectedProduct.price.toFixed(0)}</p>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center border border-border/30 rounded-lg overflow-hidden">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-none hover:bg-muted" 
                      onClick={() => setBuyNowQuantity(q => Math.max(1, q-1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input 
                      type="number" 
                      value={buyNowQuantity} 
                      onChange={e => setBuyNowQuantity(Math.max(1, Number(e.target.value)))} 
                      className="w-16 h-9 text-center border-0 focus-visible:ring-0 font-medium" 
                      min="1"
                      max={selectedProduct.stock}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-none hover:bg-muted" 
                      onClick={() => setBuyNowQuantity(q => Math.min(selectedProduct.stock, q+1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">₹{(selectedProduct.price * buyNowQuantity).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Shipping Address</Label>
                <Input
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  className="h-10 rounded-lg border-border/30 focus-visible:border-primary"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-base mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({buyNowQuantity} items)</span>
                    <span>₹{(selectedProduct.price * buyNowQuantity).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹0</span>
                  </div>
                  <div className="border-t border-border/20 pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{(selectedProduct.price * buyNowQuantity).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Truck className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 dark:text-green-300">Fast Delivery</p>
                  <p className="text-green-600 dark:text-green-400">3-5 business days</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsBuyNowModalOpen(false)} className="px-4 h-9">
              Cancel
            </Button>
            <Button 
              className="px-6 h-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              onClick={() => {
                if (!shippingAddress.trim()) {
                  toast.error("Please enter a shipping address");
                  return;
                }
                // Add the product to cart and proceed to checkout
                if (selectedProduct) {
                  dispatch(addToCart({ ...selectedProduct, quantity: buyNowQuantity }));
                  toast.success("Order placed successfully!");
                  setIsBuyNowModalOpen(false);
                }
              }}
            >
              <Package className="mr-2 h-4 w-4" />
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Supplier Profile Modal */}
      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Supplier Profile</DialogTitle>
            <DialogDescription>Verified supplier information</DialogDescription>
          </DialogHeader>
          {isSupplierLoading ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : supplierData && (
            <div className="py-6">
              {/* Supplier Header */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Image 
                    src={supplierData.profileImage || 'https://placehold.co/100x100.png'} 
                    alt={supplierData.shopName} 
                    width={100} 
                    height={100} 
                    className="rounded-full mx-auto border-4 border-primary/20 shadow-lg" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mt-4 mb-2">{supplierData.shopName}</h3>
                <Badge variant="secondary" className="rounded-full">
                  Verified Supplier
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplierData.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplierData.city}, {supplierData.country}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-medium">4.8 (120 reviews)</span>
              </div>

              {/* Description */}
              {supplierData.description && (
                <div className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {supplierData.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}