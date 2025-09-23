
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Badge } from '@repo/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { 
  User, 
  Settings, 
  Wallet, 
  ShoppingCart, 
  Calendar, 
  LogOut, 
  LayoutDashboard, 
  Star,
  Gift,
  MapPin,
  Heart,
  MessageSquare
} from 'lucide-react';
import { PageContainer } from '@repo/ui/page-container';
import Link from 'next/link';

// Mock Data
const userProfile = {
  name: 'Sophia Davis',
  email: 'sophia.davis@example.com',
  avatarUrl: 'https://picsum.photos/seed/user_avatar/200/200',
  memberSince: '2022-03-15',
  phone: '+1 (555) 123-4567',
  address: '123 Beauty Lane, Glamour City, 54321',
};

const stats = {
  totalAppointments: 24,
  totalSpent: 4580,
  loyaltyPoints: 1250,
};

const upcomingAppointments = [
  { id: 'APP-025', service: 'Deep Tissue Massage', date: '2024-09-10T14:00:00Z', staff: 'Michael Chen', status: 'Confirmed' },
  { id: 'APP-026', service: 'Deluxe Manicure', date: '2024-09-18T11:30:00Z', staff: 'Jessica Miller', status: 'Confirmed' },
];

const pastAppointments = [
  { id: 'APP-024', service: 'Signature Facial', date: '2024-08-15T16:00:00Z', staff: 'Emily White', status: 'Completed' },
  { id: 'APP-023', service: 'Haircut & Style', date: '2024-07-20T10:00:00Z', staff: 'Jessica Miller', status: 'Completed' },
];

const orderHistory = [
  { id: 'ORD-001', date: '2024-08-01T10:00:00Z', total: 120, items: 3, status: 'Delivered' },
  { id: 'ORD-002', date: '2024-07-15T15:30:00Z', total: 75, items: 2, status: 'Delivered' },
];

const wallet = {
  balance: 250,
  transactions: [
    { id: 'W-001', date: '2024-08-01T10:00:00Z', description: 'Refund for cancelled booking', amount: 50 },
    { id: 'W-002', date: '2024-07-01T11:00:00Z', description: 'Promotional credit added', amount: 200 },
  ],
};

const reviews = [
  { id: 'REV-001', service: 'Signature Facial', rating: 5, review: 'Absolutely amazing experience. My skin has never felt better!' },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'orders', label: 'My Orders', icon: ShoppingCart },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <PageContainer>
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 xl:col-span-2 mb-8 lg:mb-0">
          <Card>
            <CardHeader className="text-center p-4">
              <Avatar className="w-24 h-24 mx-auto mb-3 border-4 border-primary/20">
                <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} data-ai-hint="woman portrait smiling" />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{userProfile.name}</CardTitle>
              <CardDescription>{userProfile.email}</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="flex flex-col space-y-1">
                {navItems.map(item => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'secondary' : 'ghost'}
                    className="justify-start gap-3"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
                <div className="pt-2">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
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
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
                      <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.loyaltyPoints}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingAppointments.map(appt => (
                        <div key={appt.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-secondary rounded-md">
                          <div>
                            <p className="font-semibold">{appt.service}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appt.date).toLocaleDateString()} with {appt.staff}
                            </p>
                          </div>
                          <Badge className="mt-2 sm:mt-0">{appt.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>My Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...upcomingAppointments, ...pastAppointments].map(appt => (
                        <TableRow key={appt.id}>
                          <TableCell>{appt.service}</TableCell>
                          <TableCell>{new Date(appt.date).toLocaleDateString()}</TableCell>
                          <TableCell>{appt.staff}</TableCell>
                          <TableCell><Badge variant={appt.status === 'Completed' ? 'default' : 'secondary'}>{appt.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderHistory.map(order => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>₹{order.total.toFixed(2)}</TableCell>
                          <TableCell><Badge>{order.status}</Badge></TableCell>
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
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b pb-4">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold">{review.service}</p>
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
                              {[...Array(5 - review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-gray-300" />)}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.review}</p>
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
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-primary text-primary-foreground rounded-lg mb-6">
                    <p className="text-sm">Current Balance</p>
                    <p className="text-4xl font-bold">₹{wallet.balance.toFixed(2)}</p>
                  </div>
                  <h4 className="font-semibold mb-4">Transaction History</h4>
                  <div className="space-y-2">
                    {wallet.transactions.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center p-3 bg-secondary rounded-md">
                        <div>
                          <p>{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                        </div>
                        <p className="font-semibold text-green-600">+₹{tx.amount.toFixed(2)}</p>
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
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
                <CardFooter>
                    <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageContainer>
  );
}
