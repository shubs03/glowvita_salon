
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Search, ShoppingCart, Info, X, Heart, Eye, Minus, Plus, Building, Mail, MapPin, Star, Zap, Package, Truck, Tag, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useGetSupplierProductsQuery, useGetSupplierProfileQuery, useCreateCrmOrderMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { useAppDispatch } from '@repo/store/hooks';
import { Skeleton } from '@repo/ui/skeleton';
import { Label } from '@repo/ui/label';
import { Badge } from '@repo/ui/badge';
import { useAddToCartMutation } from '@repo/store/api';

type Product = {
  _id: string;
  productImage: string;
  productName: string;
  price: number;
  salePrice?: number;
  category: { name: string };
  stock: number;
  vendorId: string;
  supplierName: string;
  supplierEmail: string;
  description: string;
  discount?: number;
  rating?: number;
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
  const { data: productsData = [], isLoading, isError, refetch } = useGetSupplierProductsQuery(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);
  const { user } = useCrmAuth();
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  
  const { data: supplierData, isLoading: isSupplierLoading } = useGetSupplierProfileQuery(selectedSupplierId, { skip: !selectedSupplierId });
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateCrmOrderMutation();
  
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
  
  const handleAddToCart = async (product: Product, qty: number) => {
    try {
      await addToCart({
        productId: product._id,
        productName: product.productName,
        price: product.salePrice || product.price,
        quantity: qty,
        productImage: product.productImage,
        vendorId: product.vendorId, // This is the supplier's ID
        supplierName: product.supplierName,
      }).unwrap();
      toast.success(`${qty} x ${product.productName} added to cart.`);
      setIsDetailModalOpen(false);
    } catch (error) {
      toast.error("Failed to add to cart.");
    }
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setBuyNowQuantity(1);
    setShippingAddress(user?.address || '');
    setIsBuyNowModalOpen(true);
  };

  const handleQuickAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart({
        productId: product._id,
        productName: product.productName,
        price: product.salePrice || product.price,
        quantity: 1,
        productImage: product.productImage,
        vendorId: product.vendorId,
        supplierName: product.supplierName,
      }).unwrap();
      toast.success(`${product.productName} added to cart!`);
    } catch (error) {
       toast.error("Failed to add to cart.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
        toast.error("Shipping address is required.");
        return;
    }

    if (!selectedProduct) return;

    const orderData = {
      items: [{
        productId: selectedProduct._id,
        productName: selectedProduct.productName,
        quantity: buyNowQuantity,
        price: selectedProduct.salePrice || selectedProduct.price,
      }],
      supplierId: selectedProduct.vendorId,
      totalAmount: (selectedProduct.salePrice || selectedProduct.price) * buyNowQuantity,
      shippingAddress
    };

    try {
        await createOrder(orderData).unwrap();
        toast.success("Order placed successfully!");
        setIsBuyNowModalOpen(false);
    } catch (error) {
        toast.error("Failed to place order. Please try again.");
    }
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
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" style={{ isolation: 'isolate' }}></div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" style={{ isolation: 'isolate' }}></div>
                  
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
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
                  
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>

                  {product.salePrice && product.price > product.salePrice && (
                    <div className="absolute bottom-3 left-3 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg rounded-full font-bold">
                            <Tag className="h-3 w-3 mr-1" />
                            {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                        </Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-col h-[40%] w-full bg-card border-t border-border/20 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight flex-1 mr-3">
                      {product.productName}
                    </h3>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="text-xl font-bold text-primary leading-none">₹{product.salePrice ? product.salePrice.toFixed(0) : product.price.toFixed(0)}</div>
                      {product.salePrice && (
                          <span className="text-xs line-through text-muted-foreground">₹{product.price.toFixed(0)}</span>
                      )}
                    </div>
                  </div>
                  
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
                  
                  <div className="flex gap-3 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 rounded-xl border-border/40 hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-all duration-300 text-sm"
                      onClick={(e) => handleQuickAddToCart(product, e)}
                      disabled={product.stock === 0 || isAddingToCart}
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
          
          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="mx-auto w-32 h-32 mb-8 bg-muted/20 rounded-2xl flex items-center justify-center border border-border">
                <Search className="h-16 w-16 text-muted-foreground/60" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">No products found</h3>
              <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto leading-relaxed">
                We couldn't find any products matching your search. Try adjusting your filters or browse all products.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="rounded-lg bg-background hover:bg-muted border-border px-6 h-12"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
                <Button 
                  variant="default" 
                  className="rounded-lg px-6 h-12"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Browse All
                </Button>
              </div>
            </div>
          )}
          
          {productsData.length > 20 && filteredProducts.length >= 20 && (
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                className="px-10 py-4 rounded-lg border-dashed border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 bg-background h-14 text-base"
                onClick={() => {
                  console.log('Loading more products...');
                }}
              >
                <Package className="h-5 w-5 mr-3" />
                Load More Products
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Product Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] scrollbar-hidden overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedProduct?.productName}</DialogTitle>
            <DialogDescription>Product details and specifications</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-8 py-6">
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
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedProduct.supplierName || 'Supplier'}</p>
                    <p className="text-sm text-muted-foreground">Verified Supplier</p>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground leading-relaxed">{selectedProduct.description}</p>
                  </div>
                )}

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

                <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-primary">₹{selectedProduct.salePrice ? selectedProduct.salePrice.toFixed(2) : selectedProduct.price.toFixed(2)}</p>
                      {selectedProduct.salePrice && (
                        <p className="text-sm text-muted-foreground line-through">₹{selectedProduct.price.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Stock Available</p>
                      <p className="text-xl font-bold">{selectedProduct.stock}</p>
                    </div>
                  </div>
                </div>
                
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

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl" 
                    onClick={() => handleAddToCart(selectedProduct, quantity)}
                    disabled={selectedProduct.stock === 0 || isAddingToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
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
      
      <Dialog open={isBuyNowModalOpen} onOpenChange={setIsBuyNowModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg lg:max-w-xl scrollbar-hidden mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold">Quick Checkout</DialogTitle>
            <DialogDescription className="text-sm">Complete your purchase in just a few clicks</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-2">
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
                  <p className="text-lg font-bold text-primary">₹{selectedProduct.salePrice ? selectedProduct.salePrice.toFixed(0) : selectedProduct.price.toFixed(0)}</p>
                </div>
              </div>

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
                    <p className="text-lg font-bold text-primary">₹{((selectedProduct.salePrice || selectedProduct.price) * buyNowQuantity).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>

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
                    <span>Subtotal ({buyNowQuantity} items)</span>
                    <span>₹{((selectedProduct.salePrice || selectedProduct.price) * buyNowQuantity).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t border-border/20 pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{((selectedProduct.salePrice || selectedProduct.price) * buyNowQuantity).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>

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
      
      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
        <DialogContent className="max-w-sm w-[85vw] h-[70vh] p-0 gap-0 overflow-hidden">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-4 py-3 border-b border-border/20 flex-shrink-0">
              <DialogTitle className="text-base font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Supplier Profile
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">Verified supplier information</DialogDescription>
            </DialogHeader>
            
            {isSupplierLoading ? (
              <div className="flex-1 p-4 space-y-3">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : supplierData && (
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <Image 
                      src={supplierData.profileImage || 'https://placehold.co/60x60.png'} 
                      alt={supplierData.shopName} 
                      width={60} 
                      height={60} 
                      className="rounded-full mx-auto border-2 border-primary/20 shadow-lg" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="text-base font-bold mt-2 mb-1">{supplierData.shopName}</h3>
                  <Badge variant="secondary" className="rounded-full text-xs">
                    Verified Supplier
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs truncate">{supplierData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs truncate">{supplierData.city}, {supplierData.country}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-medium">4.8 (120 reviews)</span>
                </div>

                {supplierData.description && (
                  <div className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg p-3">
                    <h4 className="font-semibold mb-2 text-xs">About</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                      {supplierData.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
