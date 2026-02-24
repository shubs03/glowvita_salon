
"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/card";
import {
  Tag,
  UserPlus,
  DollarSign,
  LayoutDashboard,
  Star,
  Gift,
  Heart,
  PieChart,
  BarChart,
  TrendingUp,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from '../../components/profile/StatCard';
import { Appointment, AppointmentCard } from '../../components/profile/AppointmentCard';
import { useAuth } from '../../hooks/useAuth';
import { useGetPublicProductsQuery, useGetPublicAppointmentsQuery, useGetAdminOffersQuery, useGetClientOrdersQuery, useGetClientCartQuery } from "@repo/store/api";

function OverviewContent() {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch user appointments
  const { data: appointmentsData = [], isLoading: isLoadingAppointments } = useGetPublicAppointmentsQuery(
    { userId: user?._id },
    { skip: !isAuthenticated || !user?._id }
  );
  
  // Fetch products for new products section
  const { data: productsResponse, isLoading: isLoadingProducts } = useGetPublicProductsQuery(undefined);
  
  // Fetch offers
  const { data: offersResponse, isLoading: isLoadingOffers } = useGetAdminOffersQuery(undefined);
  
  // Fetch client orders
  const { data: ordersData = [] } = useGetClientOrdersQuery(undefined, { skip: !isAuthenticated || !user?._id });
  
  // Fetch client cart
  const { data: cartData } = useGetClientCartQuery(undefined, { skip: !isAuthenticated || !user?._id });
  
  // Transform and filter appointments to get only upcoming appointments
  const upcomingAppointments: Appointment[] = useMemo(() => {
    if (!appointmentsData || appointmentsData.length === 0) return [];
    
    const now = new Date();
    return appointmentsData
      .filter((apt: any) => {
        const appointmentDate = new Date(apt.date);
        return appointmentDate >= now && (apt.status === 'Confirmed' || apt.status === 'confirmed' || apt.status === 'scheduled');
      })
      .slice(0, 2) // Get only first 2 upcoming appointments
      .map((apt: any) => {
        // Calculate total price from all services
        let totalPrice = 0;
        
        // If there are multiple service items, sum up all their amounts
        if (apt.serviceItems && Array.isArray(apt.serviceItems) && apt.serviceItems.length > 0) {
          totalPrice = apt.serviceItems.reduce((sum: number, item: any) => {
            return sum + (item.amount || 0);
          }, 0);
        } else {
          // Fallback to single amount fields
          totalPrice = apt.totalAmount || apt.amount || 0;
        }
        
        return {
          id: apt._id || apt.id,
          service: apt.serviceName || apt.service || 'Service',
          date: apt.date,
          staff: apt.staffName || apt.staff || 'Staff Member',
          status: apt.status === 'confirmed' || apt.status === 'scheduled' ? 'Confirmed' : apt.status,
          price: totalPrice,
        };
      });
  }, [appointmentsData]);
  
  // Get new products (recently added products)
  const newProducts = useMemo(() => {
    if (!productsResponse) return [];
    
    // Handle different response structures
    const productsArray = Array.isArray(productsResponse) 
      ? productsResponse 
      : productsResponse?.products || productsResponse?.data || [];
    
    if (!Array.isArray(productsArray) || productsArray.length === 0) return [];
    
    // Sort by creation date and get the newest 2 products
    const sortedProducts = [...productsArray].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    return sortedProducts.slice(0, 2).map((product: any) => ({
      name: product.productName || product.name,
      price: product.salePrice || product.price || 0,
      image: product.productImage || product.image || "https://picsum.photos/id/1027/200/200",
    }));
  }, [productsResponse]);
  
  // Get current offers (newest offers from database)
  const currentOffers = useMemo(() => {
    if (!offersResponse) return [];
    
    // Handle different response structures
    const offersArray = Array.isArray(offersResponse) 
      ? offersResponse 
      : offersResponse?.offers || offersResponse?.data || [];
    
    if (!Array.isArray(offersArray) || offersArray.length === 0) return [];
    
    // Filter only active offers
    const now = new Date();
    const activeOffers = offersArray.filter((offer: any) => {
      const startDate = new Date(offer.startDate);
      const expiryDate = offer.expires ? new Date(offer.expires) : null;
      
      return offer.status === 'Active' && 
             startDate <= now && 
             (!expiryDate || expiryDate >= now);
    });
    
    // Sort by creation date (newest first) and get the top 2
    const sortedOffers = [...activeOffers].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    return sortedOffers.slice(0, 2).map((offer: any) => ({
      title: offer.code || 'Special Offer',
      description: offer.type === 'percentage' 
        ? `Get ${offer.value}% off` 
        : `Get ₹${offer.value} off`,
      icon: offer.type === 'percentage' ? Tag : Gift,
      code: offer.code,
    }));
  }, [offersResponse]);
  
  // Calculate dynamic stats
  const stats = useMemo(() => {
    // Total appointments count
    const totalAppointments = appointmentsData?.length || 0;
    
    // Cart items count (matching cart page structure)
    const cartItems = cartData?.data?.items || [];
    const cartItemsCount = Array.isArray(cartItems) ? cartItems.length : 0;
    
    // Total product orders count
    const ordersArray = Array.isArray(ordersData) ? ordersData : ordersData?.orders || ordersData?.data || [];
    const totalOrders = ordersArray.length;
    
    // Calculate total spent (product orders + appointments)
    const totalProductSpent = ordersArray.reduce((sum: number, order: any) => {
      return sum + (order.totalAmount || order.total || 0);
    }, 0);
    
    const totalAppointmentSpent = (appointmentsData || []).reduce((sum: number, apt: any) => {
      // Calculate appointment total from service items or fallback to amount fields
      let aptTotal = 0;
      if (apt.serviceItems && Array.isArray(apt.serviceItems) && apt.serviceItems.length > 0) {
        aptTotal = apt.serviceItems.reduce((itemSum: number, item: any) => itemSum + (item.amount || 0), 0);
      } else {
        aptTotal = apt.totalAmount || apt.amount || 0;
      }
      return sum + aptTotal;
    }, 0);
    
    const totalSpent = totalProductSpent + totalAppointmentSpent;
    
    // Calculate average monthly spend
    const oldestOrderDate = ordersArray.length > 0 
      ? Math.min(...ordersArray.map((order: any) => new Date(order.createdAt || order.date || Date.now()).getTime()))
      : Date.now();
    const monthsSinceFirstOrder = Math.max(1, Math.ceil((Date.now() - oldestOrderDate) / (1000 * 60 * 60 * 24 * 30)));
    const avgMonthlySpend = Math.round(totalSpent / monthsSinceFirstOrder);
    
    // Find most purchased product category
    const categoryCount: { [key: string]: number } = {};
    ordersArray.forEach((order: any) => {
      const items = order.items || order.products || [];
      items.forEach((item: any) => {
        const category = item.category?.name || item.categoryName || item.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + (item.quantity || 1);
      });
    });
    
    const mostPurchasedCategory = Object.keys(categoryCount).length > 0
      ? Object.entries(categoryCount).reduce((max, [cat, count]) => count > max[1] ? [cat, count] : max, ['', 0])[0]
      : 'None';
    
    return {
      totalAppointments,
      cartItemsCount,
      totalOrders,
      totalSpent,
      avgMonthlySpend,
      mostPurchasedCategory,
      wishlistItems: 8, // Keep static for now
    };
  }, [appointmentsData, ordersData, cartData]);
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={LayoutDashboard}
          title="Total Appointments"
          value={stats.totalAppointments}
          change={`${stats.totalAppointments} bookings`}
        />
        <StatCard
          icon={DollarSign}
          title="Cart Items"
          value={stats.cartItemsCount}
          change={`${stats.cartItemsCount} items in cart`}
        />
        <StatCard
          icon={Gift}
          title="Total Spent"
          value={`₹${stats.totalSpent.toLocaleString()}`}
          change="Orders + Appointments"
        />
        <StatCard
          icon={Heart}
          title="My Wishlist"
          value={stats.wishlistItems}
          change="+2 new items"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* CHARTS */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" /> Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 relative mb-2">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="75, 100"
                  />
                  <text x="18" y="22" className="text-xs font-bold fill-blue-600" textAnchor="middle">24</text>
                </svg>
              </div>
              <div className="text-center text-sm text-muted-foreground">Total appointments</div>
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-5 w-5" /> Monthly Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-2 flex items-end justify-center gap-1">
                <div className="w-3 bg-blue-200 rounded-t" style={{ height: "40%" }}></div>
                <div className="w-3 bg-blue-300 rounded-t" style={{ height: "60%" }}></div>
                <div className="w-3 bg-blue-400 rounded-t" style={{ height: "80%" }}></div>
                <div className="w-3 bg-blue-500 rounded-t" style={{ height: "100%" }}></div>
                <div className="w-3 bg-blue-600 rounded-t" style={{ height: "70%" }}></div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  ₹{stats.avgMonthlySpend >= 1000 ? `${(stats.avgMonthlySpend / 1000).toFixed(1)}k` : stats.avgMonthlySpend}
                </div>
                <div className="text-sm text-muted-foreground">Avg. per month</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Service Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 relative mb-2">
                <svg viewBox="0 0 42 42" className="w-full h-full">
                  <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#e5e7eb" strokeWidth="2" />
                  <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="40 100" strokeDashoffset="25" transform="rotate(-90 21 21)" />
                  <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#06b6d4" strokeWidth="2" strokeDasharray="30 100" strokeDashoffset="15" transform="rotate(-90 21 21)" />
                  <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#f59e0b" strokeWidth="2" strokeDasharray="30 100" strokeDashoffset="-15" transform="rotate(-90 21 21)" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.mostPurchasedCategory}</div>
                <div className="text-sm text-muted-foreground">Top Category</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" /> Loyalty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-2 flex items-center justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-blue-100 rounded-full"></div>
                  <div className="absolute inset-2 bg-blue-200 rounded-full"></div>
                  <div className="absolute inset-4 bg-blue-300 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">PRO</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">Pro Tier</div>
                <div className="text-sm text-muted-foreground">Current Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OFFERS */}
        <Card>
          <CardHeader>
            <CardTitle>Current Offers</CardTitle>
            <CardDescription>Don't miss out on these special deals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingOffers ? (
              <p className="text-muted-foreground text-center py-8">Loading offers...</p>
            ) : currentOffers.length > 0 ? (
              currentOffers.map((offer) => {
                const Icon = offer.icon;
                return (
                  <div key={offer.title} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                    <div className="p-3 bg-primary/10 rounded-full text-primary"><Icon className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{offer.title}</h4>
                      <p className="text-sm text-muted-foreground">{offer.description}</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">Use Code</Button>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-8">No offers available at the moment.</p>
            )}
          </CardContent>
        </Card>
        {/* NEW PRODUCTS */}
        <Card>
          <CardHeader>
            <CardTitle>New Products</CardTitle>
            <CardDescription>Check out the latest arrivals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingProducts ? (
              <p className="text-muted-foreground text-center py-8">Loading products...</p>
            ) : newProducts.length > 0 ? (
              newProducts.map((product) => (
                <div key={product.name} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                  <img src={product.image} alt={product.name} width={48} height={48} className="rounded-md" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)}</p>
                  </div>
                  <Link href="/products">
                    <Button variant="outline" size="sm" className="ml-auto">View</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No new products available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your next scheduled appointments.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <p className="text-muted-foreground text-center py-8">Loading appointments...</p>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map(appt => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No upcoming appointments.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OverviewContent />
    </Suspense>
  );
}
