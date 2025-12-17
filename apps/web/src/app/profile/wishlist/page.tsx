"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Search, Heart, Loader2 } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Pagination } from '@repo/ui/pagination';
import { Button } from '@repo/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { NewProductCard } from '@/components/landing/NewProductCard';
import { DoctorCard } from '@/components/landing/DoctorCard';
import { toast } from 'sonner';
import { useGetDoctorWishlistQuery, useRemoveDoctorFromWishlistMutation } from '@repo/store/services/api';

interface WishlistItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  vendorId: string;
  supplierName: string;
  addedAt: string;
}

interface DoctorWishlistItem {
  doctorId: string;
  doctorName: string;
  doctorImage: string;
  specialty: string;
  experience: number;
  rating: number;
  consultationFee: number;
  clinicName: string;
  city: string;
  state: string;
  addedAt: string;
}

export default function WishlistPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const { isAuthenticated, user } = useAuth();

  // Fetch doctor wishlist using RTK Query
  const { 
    data: doctorWishlistData, 
    isLoading: isDoctorWishlistLoading,
    error: doctorWishlistError,
    refetch: refetchDoctorWishlist
  } = useGetDoctorWishlistQuery(undefined, {
    skip: !isAuthenticated || !user,
  });

  const [removeDoctorFromWishlist] = useRemoveDoctorFromWishlistMutation();

  const doctorWishlistItems: DoctorWishlistItem[] = doctorWishlistData?.data?.items || [];

  // Fetch product wishlist (using fetch for now as it's not converted yet)
  const [productWishlistLoading, setProductWishlistLoading] = useState(false);

  // Fetch product wishlist items from API
  const fetchProductWishlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      setProductWishlistLoading(true);
      
      // Fetch product wishlist
      const productResponse = await fetch('/api/client/wishlist');
      const productResult = await productResponse.json();
      
      if (productResult.success) {
        const items = productResult.data?.items || [];
        setWishlistItems(items);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(items.map((item: any) => item.supplierName || 'Unknown Vendor'))
        ).map(item => item as string);
        setCategories(['all', ...uniqueCategories]);
      } else {
        toast.error(productResult.message || 'Failed to fetch product wishlist');
      }
    } catch (err) {
      toast.error('Failed to fetch product wishlist');
      console.error('Error fetching product wishlist:', err);
    } finally {
      setProductWishlistLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch product wishlist on mount
  useEffect(() => {
    fetchProductWishlist();
  }, [fetchProductWishlist]);

  const loading = productWishlistLoading || isDoctorWishlistLoading;

  const filteredItems = useMemo(() => {
    let itemsList = wishlistItems;
    
    // Filter by supplier name as category
    if (activeTab !== 'all' && activeTab !== 'products' && activeTab !== 'doctors') {
      itemsList = wishlistItems.filter(item => 
        item.supplierName?.toLowerCase().includes(activeTab.toLowerCase())
      );
    }

    return itemsList.filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, searchTerm, wishlistItems]);

  const filteredDoctors = useMemo(() => {
    return doctorWishlistItems.filter(doctor =>
      doctor.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.clinicName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, doctorWishlistItems]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = activeTab === 'doctors' ? 
    filteredDoctors.slice(firstItemIndex, lastItemIndex) : 
    filteredItems.slice(firstItemIndex, lastItemIndex);
  
  const totalPages = activeTab === 'doctors' ? 
    Math.ceil(filteredDoctors.length / itemsPerPage) : 
    Math.ceil(filteredItems.length / itemsPerPage);
  
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

  const removeFromDoctorWishlist = async (doctorId: string) => {
    try {
      await removeDoctorFromWishlist(doctorId).unwrap();
      toast.success('Doctor removed from wishlist');
      // Refetch to update the UI
      refetchDoctorWishlist();
    } catch (error: any) {
      console.error('Error removing doctor from wishlist:', error);
      toast.error(error?.data?.message || 'Failed to remove doctor from wishlist');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Wishlist</CardTitle>
          <CardDescription>Your favorite products and doctors saved for later.</CardDescription>
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
          <CardDescription>Your favorite products and doctors saved for later.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Please login to view your wishlist</h3>
            <p className="text-muted-foreground mb-4">
              Login to save and manage your favorite products and doctors
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
            <CardDescription>Your favorite products and doctors saved for later.</CardDescription>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products ({wishlistItems.length})</TabsTrigger>
            <TabsTrigger value="doctors">Doctors ({doctorWishlistItems.length})</TabsTrigger>
            <TabsTrigger value="all">All ({wishlistItems.length + doctorWishlistItems.length})</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {activeTab === 'doctors' ? (
              // Doctors tab content
              doctorWishlistItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(currentItems as DoctorWishlistItem[]).map((doctor) => (
                      <DoctorCard
                        key={doctor.doctorId}
                        id={doctor.doctorId}
                        name={doctor.doctorName}
                        specialty={doctor.specialty}
                        experience={doctor.experience}
                        image={doctor.doctorImage}
                        rating={doctor.rating}
                        consultationFee={doctor.consultationFee}
                        clinicName={doctor.clinicName}
                        city={doctor.city}
                        state={doctor.state}
                      />
                    ))}
                  </div>
                  {filteredDoctors.length > itemsPerPage && (
                    <Pagination
                      className="mt-6"
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={setItemsPerPage}
                      totalItems={filteredDoctors.length}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your doctor wishlist is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding doctors to your wishlist to save them for later
                  </p>
                  <Button asChild>
                    <a href="/doctors">Browse Doctors</a>
                  </Button>
                </div>
              )
            ) : activeTab === 'all' ? (
              // All items tab content
              (wishlistItems.length + doctorWishlistItems.length) > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Show products first */}
                    {wishlistItems.map((item) => (
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
                      </div>
                    ))}
                    {/* Then show doctors */}
                    {doctorWishlistItems.map((doctor) => (
                      <DoctorCard
                        key={doctor.doctorId}
                        id={doctor.doctorId}
                        name={doctor.doctorName}
                        specialty={doctor.specialty}
                        experience={doctor.experience}
                        image={doctor.doctorImage}
                        rating={doctor.rating}
                        consultationFee={doctor.consultationFee}
                        clinicName={doctor.clinicName}
                        city={doctor.city}
                        state={doctor.state}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding products and doctors to your wishlist to save them for later
                  </p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <a href="/products">Browse Products</a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="/doctors">Browse Doctors</a>
                    </Button>
                  </div>
                </div>
              )
            ) : (
              // Products tab content (default)
              wishlistItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(currentItems as WishlistItem[]).map((item) => (
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
                  <h3 className="text-lg font-semibold mb-2">Your product wishlist is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding products to your wishlist to save them for later
                  </p>
                  <Button asChild>
                    <a href="/products">Browse Products</a>
                  </Button>
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}