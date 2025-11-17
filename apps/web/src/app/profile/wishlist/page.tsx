"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Search, Heart, Loader2, X } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Pagination } from '@repo/ui/pagination';
import { Button } from '@repo/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { NewProductCard } from '@/components/landing/NewProductCard';
import { toast } from 'sonner';

interface WishlistItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  vendorId: string;
  supplierName: string;
  addedAt: string;
}

export default function WishlistPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['all']);
  const { isAuthenticated, user } = useAuth();

  // Fetch wishlist items from API
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/client/wishlist');
        const result = await response.json();
        
        if (result.success) {
          const items = result.data?.items || [];
          setWishlistItems(items);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(items.map((item: any) => item.supplierName || 'Unknown Vendor'))
          ).map(item => item as string);
          setCategories(['all', ...uniqueCategories]);
        } else {
          toast.error(result.message || 'Failed to fetch wishlist');
        }
      } catch (err) {
        toast.error('Failed to fetch wishlist');
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, user]);

  const filteredItems = useMemo(() => {
    let itemsList = wishlistItems;
    
    // Filter by supplier name as category
    if (activeTab !== 'all') {
      itemsList = wishlistItems.filter(item => 
        item.supplierName?.toLowerCase().includes(activeTab.toLowerCase())
      );
    }

    return itemsList.filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, searchTerm, wishlistItems]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredItems.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page on tab change
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/client/wishlist/${productId}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove item from local state
        setWishlistItems(prevItems => 
          prevItems.filter(item => item.productId !== productId)
        );
        toast.success('Product removed from wishlist');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove product from wishlist');
      }
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      toast.error('Failed to remove product from wishlist');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Wishlist</CardTitle>
          <CardDescription>Your favorite products saved for later.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Wishlist</CardTitle>
          <CardDescription>Your favorite products saved for later.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Please login to view your wishlist</h3>
            <p className="text-muted-foreground mb-4">
              Login to save and manage your favorite products
            </p>
            <Button asChild>
              <a href="/client-login">Login</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>My Wishlist</CardTitle>
            <CardDescription>Your favorite products saved for later.</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search wishlist..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({wishlistItems.length})</TabsTrigger>
            {categories.filter(cat => cat !== 'all').map(category => (
              <TabsTrigger key={category} value={category.toLowerCase()}>
                {category} ({wishlistItems.filter(item => 
                  item.supplierName?.toLowerCase().includes(category.toLowerCase())
                ).length})
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentItems.map((item) => (
                    <div key={item.productId} className="relative">
                      <NewProductCard
                        id={item.productId}
                        name={item.productName}
                        price={item.price}
                        image={item.productImage}
                        hint=""
                        rating={4.5} // Placeholder rating
                        reviewCount={100} // Placeholder review count
                        vendorName={item.supplierName}
                        vendorId={item.vendorId}
                        description="" // Placeholder description
                      />
                      {/* <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 left-2 h-6 w-6 rounded-full bg-white/80 text-destructive hover:bg-white hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(item.productId);
                        }}
                        aria-label="Remove from wishlist"
                      >
                        <X className="h-3 w-3" />
                      </Button> */}
                    </div>
                  ))}
                </div>
                {filteredItems.length > itemsPerPage && (
                  <Pagination
                    className="mt-6"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={filteredItems.length}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Start adding products to your wishlist to save them for later
                </p>
                <Button asChild>
                  <a href="/products">Browse Products</a>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}