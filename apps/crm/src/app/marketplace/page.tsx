
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Search, ShoppingCart, Info, X } from 'lucide-react';
import Image from 'next/image';
import { useGetSupplierProductsQuery, useGetSupplierProfileQuery, useCreateCrmOrderMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { toast } from 'sonner';

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
  
  const { data: supplierData } = useGetSupplierProfileQuery(selectedSupplierId, { skip: !selectedSupplierId });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateCrmOrderMutation();
  const { user } = useCrmAuth();
  
  const filteredProducts = useMemo(() => {
    return productsData.filter((product: any) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productsData, searchTerm]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };
  
  const handleViewSupplier = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsSupplierModalOpen(true);
  };
  
  const handlePurchase = async (product: Product) => {
    if (!user) {
      toast.error("You must be logged in to purchase.");
      return;
    }

    const orderData = {
      items: [{
        productId: product._id,
        productName: product.productName,
        productImage: product.productImage,
        quantity: 1,
        price: product.price,
      }],
      supplierId: product.vendorId,
      vendorId: user._id, // The vendor purchasing
      totalAmount: product.price,
      shippingAddress: user.address,
    };
    
    try {
      await createOrder(orderData).unwrap();
      toast.success(`${product.productName} has been added to your orders.`);
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Failed to place order.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Marketplace</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Supplier Products</CardTitle>
              <CardDescription>Browse and order products from approved suppliers.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full md:w-64 pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <Card key={product._id} className="group">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image src={product.productImage || 'https://placehold.co/400x400.png'} alt={product.productName} layout="fill" className="object-cover rounded-t-lg" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{product.productName}</h3>
                    <p className="text-sm text-muted-foreground cursor-pointer hover:underline" onClick={() => handleViewSupplier(product.vendorId)}>
                      From: {product.supplierName || 'Supplier'}
                    </p>
                    <p className="text-lg font-bold mt-2">₹{product.price.toFixed(2)}</p>
                    <div className="mt-4 flex gap-2">
                      <Button className="w-full" size="sm" onClick={() => handlePurchase(product)} disabled={isCreatingOrder}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> {isCreatingOrder ? 'Ordering...' : 'Order Now'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(product)}>
                        <Info className="mr-2 h-4 w-4" /> Details
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.productName}</DialogTitle>
            <DialogDescription>Product details</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div>
              <Image src={selectedProduct.productImage || 'https://placehold.co/400x400.png'} alt={selectedProduct.productName} width={400} height={400} className="rounded-md mx-auto" />
              <p className="mt-4">{selectedProduct.category.name}</p>
              <p className="mt-2 text-lg font-bold">₹{selectedProduct.price.toFixed(2)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Stock: {selectedProduct.stock}</p>
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
          {supplierData && (
            <div>
              <Image src={supplierData.profileImage || 'https://placehold.co/100x100.png'} alt={supplierData.shopName} width={100} height={100} className="rounded-full mx-auto" />
              <h3 className="text-xl font-semibold text-center mt-4">{supplierData.shopName}</h3>
              <p className="text-center text-muted-foreground">{supplierData.email}</p>
              <p className="text-center text-sm mt-2">{supplierData.city}, {supplierData.country}</p>
              <p className="mt-4 text-sm">{supplierData.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
