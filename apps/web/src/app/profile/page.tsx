"use client";

import { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@repo/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
  User,
  Settings,
  Wallet,
  ShoppingCart,
  Calendar,
  CheckCircle,
  Trash,
  LogOut,
  LayoutDashboard,
  Star,
  Gift,
  MapPin,
  Heart,
  MessageSquare,
  X,
  Edit,
  Trash2,
  UserPlus,
  Tag,
  Package,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart,
  Target,
  ArrowRight,
} from "lucide-react";
import { PageContainer } from "@repo/ui/page-container";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Separator } from "@repo/ui/separator";
import { useRouter, useSearchParams } from 'next/navigation';

// Mock Data
const userProfile = {
  name: "Sophia Davis",
  email: "sophia.davis@example.com",
  avatarUrl: "https://picsum.photos/seed/user_avatar/200/200",
  memberSince: "2022-03-15",
  phone: "+1 (555) 123-4567",
  address: "123 Beauty Lane, Glamour City, 54321",
};

const stats = {
  totalAppointments: 24,
  totalSpent: 4580,
  loyaltyPoints: 1250,
  wishlistItems: 8,
};

const upcomingAppointments = [
  {
    id: "APP-025",
    service: "Deep Tissue Massage",
    date: "2024-09-10T14:00:00Z",
    staff: "Michael Chen",
    status: "Confirmed",
    price: 120.0,
  },
  {
    id: "APP-026",
    service: "Deluxe Manicure",
    date: "2024-09-18T11:30:00Z",
    staff: "Jessica Miller",
    status: "Confirmed",
    price: 80.0,
  },
];

const pastAppointments = [
  {
    id: "APP-024",
    service: "Signature Facial",
    date: "2024-08-15T16:00:00Z",
    staff: "Emily White",
    status: "Completed",
    price: 150.0,
  },
  {
    id: "APP-023",
    service: "Haircut & Style",
    date: "2024-07-20T10:00:00Z",
    staff: "Jessica Miller",
    status: "Completed",
    price: 75.0,
  },
  {
    id: "APP-022",
    service: "Hot Stone Massage",
    date: "2024-06-25T13:00:00Z",
    staff: "Michael Chen",
    status: "Cancelled",
    price: 130.0,
  },
];

const orderHistory = [
  {
    id: "ORD-001",
    date: "2024-08-01T10:00:00Z",
    total: 120,
    items: 3,
    status: "Delivered",
  },
  {
    id: "ORD-002",
    date: "2024-07-15T15:30:00Z",
    total: 75,
    items: 2,
    status: "Processing",
  },
  {
    id: "ORD-003",
    date: "2024-06-10T11:00:00Z",
    total: 210,
    items: 5,
    status: "Cancelled",
  },
];

const wallet = {
  balance: 250,
  transactions: [
    {
      id: "W-001",
      date: "2024-08-01T10:00:00Z",
      description: "Refund for cancelled booking",
      amount: 50,
    },
    {
      id: "W-002",
      date: "2024-07-01T11:00:00Z",
      description: "Promotional credit added",
      amount: 200,
    },
  ],
};

const reviews = [
  {
    id: "REV-001",
    service: "Signature Facial",
    rating: 5,
    review: "Absolutely amazing experience. My skin has never felt better!",
  },
];

const currentOffers = [
  {
    title: "Weekday Special",
    description: "20% off on all haircuts, Mon-Wed.",
    icon: Tag,
  },
  {
    title: "First-Time Client",
    description: "Get 15% off your first service with us.",
    icon: UserPlus,
  },
];

const newProducts = [
  {
    name: "Aura Serum",
    price: 68.0,
    image: "https://picsum.photos/id/1027/200/200",
  },
  {
    name: "Chroma Balm",
    price: 24.0,
    image: "https://picsum.photos/id/1028/200/200",
  },
];

const StatCard = ({ icon: Icon, title, value, change }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300 bg-white/50 backdrop-blur-md border rounded-xl overflow-hidden group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-green-600">{change}</p>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </CardContent>
  </Card>
);

function ProfilePageComponent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<
    (typeof orderHistory)[0] | null
  >(null);

  const handleCancelOrderClick = (order) => {
    setOrderToCancel(order);
    setIsCancelOrderModalOpen(true);
  };

  const handleConfirmCancelOrder = () => {
    console.log("Cancelling order:", orderToCancel?.id);
    setIsCancelOrderModalOpen(false);
    setOrderToCancel(null);
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "appointments", label: "My Appointments", icon: Calendar },
    { id: "orders", label: "My Orders", icon: ShoppingCart },
    { id: "reviews", label: "My Reviews", icon: Star },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "settings", label: "Account Settings", icon: Settings },
  ];

  const isAppointmentCancellable = (appointmentDate: string) => {
    const now = new Date();
    const apptDate = new Date(appointmentDate);
    const hoursDifference =
      (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDifference > 24;
  };
  
  const isOrderCancellable = (orderDate: string) => {
    const now = new Date();
    const ordDate = new Date(orderDate);
    const hoursDifference =
      (now.getTime() - ordDate.getTime()) / (1000 * 60 * 60);
    return hoursDifference < 1;
  };

  return (
    <PageContainer>
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 xl:col-span-2 mb-8 lg:mb-0 lg:sticky top-24 self-start">
          <Card className="bg-gradient-to-b from-card to-card/90 backdrop-blur-lg border-border/30">
            <CardHeader className="text-center p-6 border-b border-border/20">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20 shadow-xl">
                <AvatarImage
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  data-ai-hint="woman portrait smiling"
                />
                <AvatarFallback className="text-3xl">
                  {userProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl font-bold">
                {userProfile.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {userProfile.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className="justify-start gap-3 h-12 text-sm rounded-lg"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
                <div className="pt-2 border-t border-border/20 mx-2 mt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 xl:col-span-10">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={Calendar}
                    title="Total Appointments"
                    value={stats.totalAppointments}
                    change="+2 this month"
                  />
                  <StatCard
                    icon={DollarSign}
                    title="Total Spent"
                    value={`₹${stats.totalSpent.toLocaleString()}`}
                    change="+5% vs last month"
                  />
                  <StatCard
                    icon={Gift}
                    title="Loyalty Points"
                    value={stats.loyaltyPoints}
                    change="+100 points"
                  />
                   <StatCard
                    icon={Heart}
                    title="My Wishlist"
                    value={stats.wishlistItems}
                    change="+2 new items"
                  />
                </div>
                 <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
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
                              d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="2"
                            />
                            <path
                              d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2"
                              strokeDasharray="75, 100"
                            />
                            <text
                              x="18"
                              y="22"
                              className="text-xs font-bold fill-blue-600"
                              textAnchor="middle"
                            >
                              24
                            </text>
                          </svg>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                          Total appointments
                        </div>
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
                          <div
                            className="w-3 bg-blue-200 rounded-t"
                            style={{ height: "40%" }}
                          ></div>
                          <div
                            className="w-3 bg-blue-300 rounded-t"
                            style={{ height: "60%" }}
                          ></div>
                          <div
                            className="w-3 bg-blue-400 rounded-t"
                            style={{ height: "80%" }}
                          ></div>
                          <div
                            className="w-3 bg-blue-500 rounded-t"
                            style={{ height: "100%" }}
                          ></div>
                          <div
                            className="w-3 bg-blue-600 rounded-t"
                            style={{ height: "70%" }}
                          ></div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            ₹8k
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg. per month
                          </div>
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
                            <circle
                              cx="21"
                              cy="21"
                              r="15.9155"
                              fill="transparent"
                              stroke="#e5e7eb"
                              strokeWidth="2"
                            />
                            <circle
                              cx="21"
                              cy="21"
                              r="15.9155"
                              fill="transparent"
                              stroke="#8b5cf6"
                              strokeWidth="2"
                              strokeDasharray="40 100"
                              strokeDashoffset="25"
                              transform="rotate(-90 21 21)"
                            />
                            <circle
                              cx="21"
                              cy="21"
                              r="15.9155"
                              fill="transparent"
                              stroke="#06b6d4"
                              strokeWidth="2"
                              strokeDasharray="30 100"
                              strokeDashoffset="15"
                              transform="rotate(-90 21 21)"
                            />
                            <circle
                              cx="21"
                              cy="21"
                              r="15.9155"
                              fill="transparent"
                              stroke="#f59e0b"
                              strokeWidth="2"
                              strokeDasharray="30 100"
                              strokeDashoffset="-15"
                              transform="rotate(-90 21 21)"
                            />
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            Hair
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Top Category
                          </div>
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
                              <span className="text-blue-700 font-bold text-sm">
                                PRO
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            Pro Tier
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current Status
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Offers</CardTitle>
                      <CardDescription>
                        Don't miss out on these special deals.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentOffers.map((offer) => {
                        const Icon = offer.icon;
                        return (
                          <div
                            key={offer.title}
                            className="flex items-center gap-4 p-3 bg-secondary rounded-lg"
                          >
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{offer.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {offer.description}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                            >
                              Claim
                            </Button>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>New Products</CardTitle>
                      <CardDescription>
                        Check out the latest arrivals.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {newProducts.map((product) => (
                        <div
                          key={product.name}
                          className="flex items-center gap-4 p-3 bg-secondary rounded-lg"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="rounded-md"
                          />
                          <div>
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ₹{product.price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>My Appointments</CardTitle>
                  <CardDescription>
                    View your upcoming and past appointments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <StatCard icon={Calendar} title="Upcoming" value={upcomingAppointments.length} change="Next in 3 days" />
                    <StatCard icon={CheckCircle} title="Completed" value={pastAppointments.filter(a => a.status === 'Completed').length} change="All time" />
                    <StatCard icon={X} title="Cancelled" value={pastAppointments.filter(a => a.status === 'Cancelled').length} change="All time" />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...upcomingAppointments, ...pastAppointments].map(
                        (appt) => (
                          <TableRow key={appt.id}>
                            <TableCell>{appt.service}</TableCell>
                            <TableCell>
                              {new Date(appt.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{appt.staff}</TableCell>
                            <TableCell>₹{appt.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  appt.status === "Completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {appt.status}
                              </Badge>
                            </TableCell>
                           <TableCell className="text-right">
                              {isAppointmentCancellable(appt.date) && appt.status === 'Confirmed' ? (
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                  <Trash className="h-4 w-4 mr-1" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" disabled className="text-gray-400">
                                  <Trash className="h-4 w-4 mr-1" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                  <CardDescription>Your product order history.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <StatCard icon={ShoppingCart} title="Total Orders" value={orderHistory.length} change="All time" />
                      <StatCard icon={TrendingUp} title="Total Spent" value={`₹${orderHistory.reduce((acc, o) => acc + o.total, 0).toFixed(2)}`} change="On products" />
                      <StatCard icon={Package} title="Delivered" value={orderHistory.filter(o => o.status === 'Delivered').length} change="All time" />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderHistory.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>
                            {new Date(order.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>₹{order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "Delivered"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                              {isOrderCancellable(order.date) && order.status === 'Processing' ? (
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleCancelOrderClick(order)}>
                                      <Trash className="h-4 w-4 mr-1"/>
                                  </Button>
                              ) : (
                                  <Button variant="ghost" size="sm" disabled className="text-gray-400">
                                      <Trash className="h-4 w-4 mr-1"/>
                                  </Button>
                              )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>My Reviews</CardTitle>
                  <CardDescription>
                    Your feedback on our services.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold">{review.service}</p>
                          <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 text-blue-400 fill-current"
                              />
                            ))}
                            {[...Array(5 - review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-gray-300" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.review}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet">
              <Card>
                <CardHeader>
                  <CardTitle>My Wallet</CardTitle>
                  <CardDescription>
                    Your wallet balance and transaction history.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <StatCard icon={Wallet} title="Current Balance" value={`₹${wallet.balance.toFixed(2)}`} change="+₹50 last week" />
                    <StatCard icon={Gift} title="Total Credits" value={`₹${wallet.transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}`} change="All time" />
                  </div>
                  <h4 className="font-semibold mb-4">Transaction History</h4>
                  <div className="space-y-2">
                    {wallet.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-3 bg-secondary rounded-md"
                      >
                        <div>
                          <p>{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold text-blue-600">
                          +₹{tx.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

             <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Update your personal information and password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input defaultValue={userProfile.name} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input defaultValue={userProfile.email} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input defaultValue={userProfile.phone} />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input defaultValue={userProfile.address} />
                    </div>
                    <Button>Save Changes</Button>
                  </form>
                  <Separator />
                  <form className="space-y-4">
                    <h3 className="font-semibold">Change Password</h3>
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <Input type="password" />
                      </div>
                    </div>
                    <Button>Update Password</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <Dialog
        open={isCancelOrderModalOpen}
        onOpenChange={setIsCancelOrderModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order {orderToCancel?.id}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelOrderModalOpen(false)}
            >
              No
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancelOrder}>
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageComponent />
    </Suspense>
  );
}
```
- packages/web/src/hooks/useAuth.ts
- apps/web/src/components/AuthInitializer.tsx