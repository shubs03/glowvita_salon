
"use client";

import { useState, useMemo, Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/card";
import {
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

// Mock Data
const stats = {
  totalAppointments: 24,
  totalSpent: 4580,
  loyaltyPoints: 1250,
  wishlistItems: 8,
};

const upcomingAppointments: Appointment[] = [
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

function OverviewContent() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={LayoutDashboard}
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
                <div className="text-lg font-bold text-blue-600">₹8k</div>
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
                <div className="text-lg font-bold text-blue-600">Hair</div>
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
            {currentOffers.map((offer) => {
              const Icon = offer.icon;
              return (
                <div key={offer.title} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                  <div className="p-3 bg-primary/10 rounded-full text-primary"><Icon className="h-5 w-5" /></div>
                  <div>
                    <h4 className="font-semibold">{offer.title}</h4>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">Claim</Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
        {/* NEW PRODUCTS */}
        <Card>
          <CardHeader>
            <CardTitle>New Products</CardTitle>
            <CardDescription>Check out the latest arrivals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {newProducts.map((product) => (
              <div key={product.name} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                <img src={product.image} alt={product.name} width={48} height={48} className="rounded-md" />
                <div>
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">View</Button>
              </div>
            ))}
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
            {upcomingAppointments.length > 0 ? (
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
