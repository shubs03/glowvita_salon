
"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Package,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { StatCard } from '../../components/profile/StatCard';
import { Appointment, AppointmentCard } from '../../components/profile/AppointmentCard';
import { useAuth } from '../../hooks/useAuth';
import { useGetPublicProductsQuery, useGetClientOrdersQuery, useGetClientCartQuery, useGetPublicAllOffersQuery } from "@repo/store/api";
import { useGetDoctorWishlistQuery, useGetSalonWishlistQuery } from "@repo/store/services/api";
import { useUserAppointments } from '../../hooks/useUserAppointments';
import { useSalonFilter } from "@/components/landing/SalonFilterContext";

function OverviewContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { userLat, userLng } = useSalonFilter();

  // Fetch user appointments
  const { appointments: appointmentsData = [], isLoading: isLoadingAppointments } = useUserAppointments();

  // Fetch products for new products section
  const { data: productsResponse, isLoading: isLoadingProducts } = useGetPublicProductsQuery({
    lat: userLat || undefined,
    lng: userLng || undefined,
  });

  // // Fetch offers
  const { data: offersResponse, isLoading: isLoadingOffers } = useGetPublicAllOffersQuery(undefined);

  // Fetch client orders
  const { data: ordersData = [] } = useGetClientOrdersQuery(undefined, {
    skip: !isAuthenticated || !user?._id,
    pollingInterval: 5000,
    refetchOnMountOrArgChange: true,
  });

  // Fetch client cart
  const { data: cartData } = useGetClientCartQuery(undefined, { skip: !isAuthenticated || !user?._id });

  // Fetch wishlists
  const { data: doctorWishlistData } = useGetDoctorWishlistQuery(undefined, { skip: !isAuthenticated || !user?._id });
  const { data: salonWishlistData } = useGetSalonWishlistQuery(undefined, { skip: !isAuthenticated || !user?._id });
  const [productWishlistCount, setProductWishlistCount] = useState(0);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetch('/api/client/wishlist')
        .then(res => res.json())
        .then(data => {
          if (data?.success && data?.data?.items) {
            setProductWishlistCount(data.data.items.length);
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated, user?._id]);

  // Transform and filter appointments to get only upcoming appointments
  const upcomingAppointments = useMemo(() => {
    if (!appointmentsData || appointmentsData.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const seen = new Set();

    return appointmentsData
      .filter((apt: any) => {
        const id = apt.id;
        if (seen.has(id)) return false;
        try {
          const appointmentDate = new Date(apt.date);
          const isUpcoming = appointmentDate >= today && ['Confirmed', 'Scheduled'].includes(apt.status);
          if (isUpcoming) seen.add(id);
          return isUpcoming;
        } catch (e) {
          return false;
        }
      })
      .map((apt: any) => ({
        ...apt,
      }))
      .sort((a: any, b: any) => {
        // Sort by date first
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;

        // Then sort by startTime within same date
        const timeA = a.startTime || (a.serviceItems?.[0]?.startTime) || '00:00';
        const timeB = b.startTime || (b.serviceItems?.[0]?.startTime) || '00:00';
        return timeA.localeCompare(timeB);
      });
  }, [appointmentsData]);

  // Get upcoming (non-delivered) orders sorted by date
  const upcomingOrders = useMemo(() => {
    const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData as any)?.orders || (ordersData as any)?.data || [];
    if (!ordersArray.length) return [];

    const excludedStatuses = ['delivered', 'cancelled', 'rejected'];
    const seen = new Set();

    return ordersArray
      .filter((order: any) => {
        const id = order._id || order.id;
        if (seen.has(id)) return false;
        const status = (order.orderStatus || order.status || '').toLowerCase();
        const isUpcoming = !excludedStatuses.includes(status);
        if (isUpcoming) seen.add(id);
        return isUpcoming;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.createdAt || b.date || 0).getTime();
        return dateB - dateA; // latest first
      });
  }, [ordersData]);

  const displayUpcomingOrders = showAllOrders ? upcomingOrders : upcomingOrders.slice(0, 3);

  // Sliced version for display
  const displayUpcomingAppointments = showAllAppointments
    ? upcomingAppointments
    : upcomingAppointments.slice(0, 3);

  // Get new products (recently added products)
  const newProducts = useMemo(() => {
    if (!productsResponse) return [];

    // Handle different response structures
    const productsArray = Array.isArray(productsResponse)
      ? productsResponse
      : productsResponse?.products || productsResponse?.data || [];

    if (!Array.isArray(productsArray) || productsArray.length === 0) return [];

    // Filter available products (stock > 0)
    const availableProducts = productsArray.filter((p: any) => (p.stock || 0) > 0);
    if (availableProducts.length === 0) return [];

    // Sort by creation date and get the newest 2 products
    const sortedProducts = [...availableProducts].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return sortedProducts.slice(0, 2).map((product: any) => ({
      id: product._id || product.id,
      name: product.productName || product.name,
      price: product.salePrice || product.price || 0,
      image: product.productImage || product.image || "https://picsum.photos/id/1027/200/200",
      vendorId: product.vendorId || "",
      vendorName: product.vendorName || "Vendor",
    }));
  }, [productsResponse]);

  // Get current offers (newest offers from database)
  const currentOffers = useMemo(() => {
    if (!offersResponse) return [];

    // Handle different response structures
    let offersArray = Array.isArray(offersResponse)
      ? offersResponse
      : offersResponse?.offers || offersResponse?.data || [];

    if (!Array.isArray(offersArray) || offersArray.length === 0) return [];

    // Filter to show ONLY Admin offers (exclude CRM/Vendor offers)
    offersArray = offersArray.filter((offer: any) => offer.isVendorOffer === false);

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

    return sortedOffers.map((offer: any) => ({
      title: offer.type === 'percentage' ? `${offer.value}% Special Discount` : `₹${offer.value} Exclusive Off`,
      description: offer.type === 'percentage'
        ? `Get ${offer.value}% off on your next booking`
        : `Get a flat ₹${offer.value} off on your next booking`,
      icon: offer.type === 'percentage' ? Tag : Gift,
      code: offer.code,
      image: offer.offerImage || "/images/Offer Placeholder.png",
      discount: offer.type === 'percentage' ? `${offer.value}%` : `₹${offer.value}`,
      applicableServices: (offer.applicableServiceNames || offer.applicableServices || []).filter(Boolean),
      applicableSpecialties: (offer.applicableSpecialties || []).filter(Boolean),
      applicableCategories: (offer.applicableCategories || []).filter(Boolean),
    }));
  }, [offersResponse]);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    // Total appointments count
    const totalAppointments = appointmentsData?.length || 0;

    // Completed appointments count
    const completedAppointments = appointmentsData?.filter((apt: any) => apt.status?.toLowerCase() === 'completed')?.length || 0;

    // Cart items count (matching cart page structure)
    const cartItems = cartData?.data?.items || [];
    const cartItemsCount = Array.isArray(cartItems) ? cartItems.length : 0;

    // Total product orders count
    const ordersArray = Array.isArray(ordersData) ? ordersData : ordersData?.orders || ordersData?.data || [];
    const totalOrders = ordersArray.length;
    const deliveredOrders = ordersArray.filter((order: any) => order.orderStatus?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'delivered').length;

    // Calculate total spent (delivered orders using totalAmount + completed appointments using amountPaid)
    const totalProductSpent = ordersArray.reduce((sum: number, order: any) => {
      const isDelivered = order.orderStatus?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'delivered';
      if (!isDelivered) return sum;
      return sum + (order.totalAmount || order.total || 0);
    }, 0);

    const totalAppointmentSpent = (appointmentsData || []).reduce((sum: number, apt: any) => {
      if (apt.status?.toLowerCase() !== 'completed') return sum;
      // amountPaid is the actual amount paid; fallback to finalAmount, then price
      return sum + (apt.amountPaid || apt.finalAmount || apt.price || 0);
    }, 0);

    const totalSpent = totalProductSpent + totalAppointmentSpent;

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

    // Calculate total wishlist items
    const doctorItemsCount = doctorWishlistData?.data?.items?.length || 0;
    const salonItemsCount = salonWishlistData?.data?.items?.length || 0;
    const totalWishlistItems = productWishlistCount + doctorItemsCount + salonItemsCount;

    // Calculate historical monthly spend for bar chart
    const monthlySpends = [0, 0, 0, 0, 0];
    const currentDate = new Date();

    ordersArray.forEach((order: any) => {
      const isDelivered = order.orderStatus?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'delivered';
      if (!isDelivered) return;

      const orderDate = new Date(order.createdAt || order.date);
      const diffMonths = (currentDate.getFullYear() - orderDate.getFullYear()) * 12 + (currentDate.getMonth() - orderDate.getMonth());
      if (diffMonths >= 0 && diffMonths < 5) {
        monthlySpends[4 - diffMonths] += (order.totalAmount || order.total || 0);
      }
    });

    (appointmentsData || []).forEach((apt: any) => {
      if (apt.status?.toLowerCase() !== 'completed') return;

      const aptDate = new Date(apt.date);
      const diffMonths = (currentDate.getFullYear() - aptDate.getFullYear()) * 12 + (currentDate.getMonth() - aptDate.getMonth());
      if (diffMonths >= 0 && diffMonths < 5) {
        monthlySpends[4 - diffMonths] += (apt.amountPaid || apt.finalAmount || apt.price || 0);
      }
    });

    const currentMonthSpend = monthlySpends[4];

    const maxSpend = Math.max(...monthlySpends, 1); // Avoid division by zero
    const monthlySpendPercentages = monthlySpends.map(spend => Math.max(10, Math.round((spend / maxSpend) * 100)));

    // Service Mix percentages
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const totalCategoryCount = topCategories.reduce((sum, [, count]) => sum + count, 0);

    const serviceMix = topCategories.map(([, count]) =>
      totalCategoryCount > 0 ? Math.round((count / totalCategoryCount) * 100) : 0
    );

    // Ensure we always have 3 values for the donuts
    while (serviceMix.length < 3) serviceMix.push(0);

    // Calculate Pro Tier based on total spent
    let tier = "BASIC";
    if (totalSpent >= 10000) tier = "PRO";
    else if (totalSpent >= 5000) tier = "GOLD";
    else if (totalSpent >= 1000) tier = "SILVER";

    return {
      totalAppointments,
      completedAppointments,
      cartItemsCount,
      totalOrders,
      totalSpent,
      currentMonthSpend,
      mostPurchasedCategory,
      wishlistItems: totalWishlistItems,
      monthlySpendPercentages,
      serviceMix,
      tier,
      deliveredOrders,
    };
  }, [appointmentsData, ordersData, cartData, productWishlistCount, doctorWishlistData, salonWishlistData]);

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
          change={`${stats.wishlistItems} items saved`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <text x="18" y="22" className="text-xs font-bold fill-blue-600" textAnchor="middle">{stats.completedAppointments}</text>
                </svg>
              </div>
              <div className="text-center text-sm text-muted-foreground">Completed appointments</div>
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" /> Delivered Orders
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
                    strokeDasharray={`${stats.totalOrders > 0 ? (stats.deliveredOrders / stats.totalOrders) * 100 : 0}, 100`}
                  />
                  <text x="18" y="22" className="text-xs font-bold fill-blue-600" textAnchor="middle">{stats.deliveredOrders}</text>
                </svg>
              </div>
              <div className="text-center text-sm text-muted-foreground">Successfully delivered</div>
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
                <div className="w-3 bg-blue-200 rounded-t" style={{ height: `${stats.monthlySpendPercentages[0]}%` }}></div>
                <div className="w-3 bg-blue-300 rounded-t" style={{ height: `${stats.monthlySpendPercentages[1]}%` }}></div>
                <div className="w-3 bg-blue-400 rounded-t" style={{ height: `${stats.monthlySpendPercentages[2]}%` }}></div>
                <div className="w-3 bg-blue-500 rounded-t" style={{ height: `${stats.monthlySpendPercentages[3]}%` }}></div>
                <div className="w-3 bg-blue-600 rounded-t" style={{ height: `${stats.monthlySpendPercentages[4]}%` }}></div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  ₹{stats.currentMonthSpend >= 1000 ? `${(stats.currentMonthSpend / 1000).toFixed(1)}k` : stats.currentMonthSpend.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OFFERS */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Current Offers</CardTitle>
                <CardDescription className="text-[11px] mt-0.5">Don't miss out on these special deals.</CardDescription>
              </div>
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {currentOffers.length} Active
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-1">
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5 custom-scrollbar">
              {isLoadingOffers ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] text-muted-foreground">Loading offers...</span>
                </div>
              ) : currentOffers.length > 0 ? (
                currentOffers.map((offer, idx) => (
                  <div key={offer.title + idx} className="flex items-center gap-2 p-2 bg-secondary/40 hover:bg-secondary/70 border border-border/40 rounded-lg relative transition-colors group">
                    {/* Thumbnail */}
                    <div className="w-9 h-9 flex-shrink-0 rounded-md overflow-hidden border border-border/30">
                      <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-9">
                      {/* Title + code row */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="font-semibold text-[11px] text-foreground leading-none truncate max-w-[120px]">{offer.title}</span>
                        <span className="bg-primary/10 text-primary text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-primary/20 leading-none flex-shrink-0">
                          {offer.code}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[9px] text-muted-foreground line-clamp-1 leading-tight">{offer.description}</p>

                      {/* Applicable tags */}
                      {((offer.applicableServices && offer.applicableServices.length > 0) ||
                        (offer.applicableSpecialties && offer.applicableSpecialties.length > 0) ||
                        (offer.applicableCategories && offer.applicableCategories.length > 0)) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {offer.applicableServices?.slice(0, 2).map((s: string) => (
                            <span key={s} className="text-[8px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium leading-none border border-blue-200/50">
                              {s}
                            </span>
                          ))}
                          {offer.applicableSpecialties?.slice(0, 1).map((s: string) => (
                            <span key={s} className="text-[8px] bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-medium leading-none border border-purple-200/50">
                              {s}
                            </span>
                          ))}
                          {offer.applicableCategories?.slice(0, 1).map((c: string) => (
                            <span key={c} className="text-[8px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-1.5 py-0.5 rounded-full font-medium leading-none border border-green-200/50">
                              {c}
                            </span>
                          ))}
                          {((offer.applicableServices?.length ?? 0) > 2) && (
                            <span className="text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium leading-none">
                              +{(offer.applicableServices?.length ?? 0) - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Discount Badge */}
                    <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground min-w-[32px] h-8 px-1.5 rounded-lg flex items-center justify-center text-[9px] font-bold shadow-sm flex-shrink-0 leading-none">
                      {offer.discount}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-[11px] text-muted-foreground">No offers available at the moment.</p>
                </div>
              )}
            </div>
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
                  <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md relative">
                    <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <div
                      onClick={() => router.push(`/product-details/${product.id}`)}
                      className="cursor-pointer"
                    >
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push(`/client-login?redirect=${encodeURIComponent(window.location.pathname)}`);
                          return;
                        }

                        // Buy Now logic
                        const productForCheckout = {
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          originalPrice: product.price,
                          hasSale: false,
                          image: product.image,
                          vendorId: product.vendorId || "", // We might need to fetch this or ensure it's in the mapped product
                          vendorName: product.vendorName || "Vendor",
                          quantity: 1,
                        };
                        localStorage.setItem("buyNowProduct", JSON.stringify(productForCheckout));
                        router.push("/checkout");
                      }}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No new products available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UPCOMING APPOINTMENTS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div
              onClick={() => router.push("/profile/appointments")}
              className="hover:opacity-70 transition-opacity cursor-pointer"
            >
              <CardTitle>Upcoming Appointments ({upcomingAppointments.length})</CardTitle>
              <CardDescription>Your next scheduled appointments.</CardDescription>
            </div>
            {upcomingAppointments.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllAppointments(!showAllAppointments)}
              >
                {showAllAppointments ? "Show Less" : "View All"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <p className="text-muted-foreground text-center py-8">Loading appointments...</p>
            ) : displayUpcomingAppointments.length > 0 ? (
              <div className="space-y-4 pt-4">
                {displayUpcomingAppointments.map(appt => (
                  <div
                    key={appt.id}
                    onClick={() => router.push("/profile/appointments")}
                    className="block cursor-pointer hover:shadow-md transition-shadow rounded-lg"
                  >
                    <AppointmentCard appointment={appt} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No upcoming appointments.</p>
            )}
          </CardContent>
        </Card>

        {/* UPCOMING ORDERS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div
              onClick={() => router.push("/profile/orders")}
              className="hover:opacity-70 transition-opacity cursor-pointer"
            >
              <CardTitle>Upcoming Orders ({upcomingOrders.length})</CardTitle>
              <CardDescription>Your active and pending orders.</CardDescription>
            </div>
            {upcomingOrders.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllOrders(!showAllOrders)}
              >
                {showAllOrders ? "Show Less" : "View All"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {displayUpcomingOrders.length > 0 ? (
              <div className="space-y-4 pt-4">
                {displayUpcomingOrders.map((order: any) => {
                  const orderId = order._id || order.id;
                  const status = order.orderStatus || order.status || 'Pending';
                  const date = order.createdAt || order.date;
                  const total = order.totalAmount || 0;
                  const itemCount = (order.items || order.products || []).length;
                  return (
                    <div
                      key={orderId}
                      onClick={() => router.push("/profile/orders")}
                      className="block p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{itemCount} item{itemCount !== 1 ? 's' : ''}</h4>
                          <p className="text-sm text-muted-foreground">Order #{orderId?.slice(-6)?.toUpperCase()}</p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">{status}</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-sm text-muted-foreground">
                          {date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </p>
                        <p className="text-lg font-bold text-primary">₹{total.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No upcoming orders.</p>
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
