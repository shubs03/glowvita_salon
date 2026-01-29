"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
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
import { ProductCard } from '@/components/marketplace/ProductCard';

// Import new components
import { MarketplaceHeader } from './components/MarketplaceHeader';
import { MarketplaceFiltersToolbar } from './components/MarketplaceFiltersToolbar';
import { MarketplaceStatsCards } from './components/MarketplaceStatsCards';
import { MarketplaceProductsSection } from './components/MarketplaceProductsSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BuyNowModal } from './components/BuyNowModal';
import { SupplierModal } from './components/SupplierModal';
import PaginationControls from './components/PaginationControls';

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

interface MarketplaceStats {
  totalProducts: number;
  totalSuppliers: number;
  totalValue: number;
  averageRating: number;
}

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
  const { data: productsData, isLoading, isError, refetch } = useGetSupplierProductsQuery(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
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
  
  // Extract the products array from the API response
  const productsArray = useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    if (productsData.data && Array.isArray(productsData.data)) return productsData.data;
    return [];
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    return productsArray.filter((product: any) =>
      (product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || 
       (statusFilter === 'in_stock' && product.stock > 10) ||
       (statusFilter === 'low_stock' && product.stock > 0 && product.stock <= 10) ||
       (statusFilter === 'out_of_stock' && product.stock === 0))
    );
  }, [productsArray, searchTerm, statusFilter]);

  const paginatedProducts = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(
      firstItemIndex,
      firstItemIndex + itemsPerPage
    );
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );

  const productStats = useMemo(() => {
    if (!Array.isArray(productsData))
      return {
        totalProducts: 0,
        totalSuppliers: 0,
        totalValue: 0,
        averageRating: 0,
      };

    const totalProducts = productsData.length;
    
    // Count unique suppliers
    var uniqueSuppliers = [];
    for (var i = 0; i < productsData.length; i++) {
      var supplier = productsData[i].vendorId;
      if (uniqueSuppliers.indexOf(supplier) === -1) {
        uniqueSuppliers.push(supplier);
      }
    }
    const totalSuppliers = uniqueSuppliers.length;

    const totalValue = productsData.reduce(
      (sum, p) => sum + (p.salePrice || p.price) * p.stock,
      0
    );

    // Mock average rating
    const averageRating = 4.3;

    return {
      totalProducts,
      totalSuppliers,
      totalValue,
      averageRating,
    };
  }, [productsData]);

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
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Skeleton className="w-full h-12 rounded-lg" />
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="w-32 h-12 rounded-lg" />
                                <Skeleton className="w-32 h-12 rounded-lg" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border rounded-lg">
                    <CardHeader className="pb-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                        <Skeleton className="h-6 w-6 rounded" />
                                    </div>
                                    <Skeleton className="h-8 w-48" />
                                </div>
                                <div className="space-y-3 mt-2">
                                    <Skeleton className="h-4 w-80" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-32 rounded-full" />
                            </div>
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
        <MarketplaceHeader />
        
        <MarketplaceStatsCards stats={productStats} />

            <MarketplaceFiltersToolbar 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              viewMode={viewMode}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onViewModeChange={setViewMode}
            />
        
        <MarketplaceProductsSection 
          filteredProducts={paginatedProducts}
          isLoading={isLoading}
          searchTerm={searchTerm}
          viewMode={viewMode}
          onSearchClear={() => setSearchTerm('')}
          onQuickAddToCart={handleQuickAddToCart}
          onViewDetails={handleViewDetails}
          onBuyNow={handleBuyNow}
          onViewSupplier={handleViewSupplier}
        />

        {filteredProducts.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredProducts.length}
          />
        )}
      </div>

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedProduct}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={(product, qty) => handleAddToCart(product, qty)}
        isAddingToCart={isAddingToCart}
        onBuyNow={(product) => handleBuyNow(product)}
      />
      
      <BuyNowModal
        isOpen={isBuyNowModalOpen}
        onClose={() => setIsBuyNowModalOpen(false)}
        product={selectedProduct}
        quantity={buyNowQuantity}
        onQuantityChange={setBuyNowQuantity}
        shippingAddress={shippingAddress}
        onShippingAddressChange={setShippingAddress}
        onPlaceOrder={handlePlaceOrder}
        isCreatingOrder={isCreatingOrder}
      />
      
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        supplier={supplierData}
        isLoading={isSupplierLoading}
      />
    </div>
  );
}