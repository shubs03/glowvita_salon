
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Search, ShoppingCart, Info, X, Heart, Eye, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useGetSupplierProductsQuery, useGetSupplierProfileQuery, useCreateCrmOrderMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';
import { useAppDispatch } from '@repo/store/hooks';
import { addToCart } from '@repo/store/slices/cartSlice';
import { Skeleton } from '@repo/ui/skeleton';

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
              <Card key={product._id} className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative aspect-square cursor-pointer" onClick={() => handleViewDetails(product)}>
                    <Image src={product.productImage || 'https://placehold.co/400x400.png'} alt={product.productName} layout="fill" className="object-cover rounded-t-lg group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{product.productName}</h3>
                    <p className="text-sm text-muted-foreground cursor-pointer hover:underline" onClick={(e) => handleViewSupplier(e, product.vendorId)}>
                      By: {product.supplierName || 'Supplier'}
                    </p>
                    <p className="text-lg font-bold mt-2">₹{product.price.toFixed(2)}</p>
                    <div className="mt-4 flex gap-2">
                       <Button className="w-full" size="sm" onClick={() => handleAddToCart(product, 1)}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(product)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </div>
                  </div>
                </CardContent>
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
            <div className="grid md:grid-cols-2 gap-6">
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
          {isSupplierLoading ? <Skeleton className="h-24 w-full" /> : supplierData && (
            <div className="flex flex-col items-center text-center">
              <Image src={supplierData.profileImage || 'https://placehold.co/100x100.png'} alt={supplierData.shopName} width={100} height={100} className="rounded-full mx-auto" />
              <h3 className="text-xl font-semibold mt-4">{supplierData.shopName}</h3>
              <p className="text-muted-foreground">{supplierData.email}</p>
              <p className="text-sm mt-2">{supplierData.city}, {supplierData.country}</p>
              <p className="mt-4 text-sm text-center">{supplierData.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

