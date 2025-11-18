'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import { Input } from "@repo/ui/input";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  MapPin, 
  Phone, 
  Mail,
  DollarSign,
  BarChart3,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useGetClientsQuery, useGetAppointmentsQuery } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';

// Types
interface Client {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  birthdayDate?: string;
  lastVisit: string;
  totalBookings?: number;
  totalSpent?: number;
  status: 'Active' | 'Inactive' | 'New';
  source: 'offline' | 'online';
  address?: string;
  gender?: string;
  country?: string;
  occupation?: string;
}

interface Appointment {
  _id: string;
  client: {
    _id: string;
    name: string;
  };
  vendor: {
    _id: string;
    businessName: string;
  };
  service: {
    name: string;
    price: number;
  };
  date: string;
  startTime: string;
  status: string;
  totalAmount: number;
}

interface VendorSummary {
  _id: string;
  businessName: string;
  totalAppointments: number;
  totalRevenue: number;
}

export default function CustomerSummaryPage() {
  const { user } = useCrmAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Fetch offline clients
  const { data: offlineClients = [], isLoading: isOfflineLoading } = useGetClientsQuery({
    search: '',
    status: '',
    page: 1,
    limit: 1000,
    source: 'offline'
  }, {
    skip: !user?._id,
  });
  
  // Fetch online clients
  const { data: onlineClients = [], isLoading: isOnlineLoading } = useGetClientsQuery({
    search: '',
    status: '',
    page: 1,
    limit: 1000,
    source: 'online'
  }, {
    skip: !user?._id,
  });
  
  // State for table pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client; direction: 'asc' | 'desc' } | null>(null);
  
  // Fetch appointments
  const vendorId = user?.vendorId || user?._id;
  const { data: appointmentsResponse, isLoading: isLoadingAppointments } = useGetAppointmentsQuery({ vendorId });
  
  // Combine all clients
  const allClients = useMemo(() => {
    return [...offlineClients, ...onlineClients];
  }, [offlineClients, onlineClients]);
  
  // Normalize appointments
  const appointments: Appointment[] = useMemo(() => {
    if (!appointmentsResponse) return [];
    
    // Handle different response formats
    if (Array.isArray(appointmentsResponse)) {
      return appointmentsResponse;
    }
    
    if (appointmentsResponse.data && Array.isArray(appointmentsResponse.data)) {
      return appointmentsResponse.data;
    }
    
    if (appointmentsResponse.appointments && Array.isArray(appointmentsResponse.appointments)) {
      return appointmentsResponse.appointments;
    }
    
    return [];
  }, [appointmentsResponse]);
  
  // Process client stats
  const clientStatsData = useMemo(() => {
    const clientStatsMap = new Map<string, { bookings: number; revenue: number; vendors: Set<string> }>();
    
    // Process appointments to build client stats
    appointments.forEach((appt: Appointment) => {
      const clientId = appt.client?._id || '';
      const vendorId = appt.vendor?._id || '';
      const amount = appt.totalAmount || 0;
      
      // Update client stats
      if (clientId) {
        const stats = clientStatsMap.get(clientId) || { bookings: 0, revenue: 0, vendors: new Set() };
        stats.bookings += 1;
        stats.revenue += amount;
        if (vendorId) {
          stats.vendors.add(vendorId);
        }
        clientStatsMap.set(clientId, stats);
      }
    });
    
    return clientStatsMap;
  }, [appointments]);
  
  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm) return allClients;
    
    return allClients.filter((client: Client) => 
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  }, [allClients, searchTerm]);
  
  // Sort clients
  const sortedClients = useMemo(() => {
    if (!sortConfig) return filteredClients;
    
    return [...filteredClients].sort((a, b) => {
      // Handle sorting for computed properties
      if (sortConfig.key === 'totalBookings' || sortConfig.key === 'totalSpent') {
        const statsA = clientStatsData.get(a._id) || { bookings: 0, revenue: 0 };
        const statsB = clientStatsData.get(b._id) || { bookings: 0, revenue: 0 };
        
        const valueA = sortConfig.key === 'totalBookings' ? statsA.bookings : statsA.revenue;
        const valueB = sortConfig.key === 'totalBookings' ? statsB.bookings : statsB.revenue;
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      } else {
        // Handle sorting for direct properties
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
  }, [filteredClients, sortConfig, clientStatsData]);
  
  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = sortedClients.slice(startIndex, startIndex + itemsPerPage);
  
  // Process data for charts and summaries
  const { 
    totalClients, 
    newClients, 
    totalRevenue, 
    totalAppointments,
    vendorStats,
    revenueData,
    appointmentData
  } = useMemo(() => {
    // Client statistics
    const totalClients = allClients.length;
    const newClients = allClients.filter((c: Client) => c.status === 'New').length;
    
    // Appointment and revenue statistics
    let totalRevenue = 0;
    let totalAppointments = appointments.length;
    
    // Vendor stats
    const vendorStatsMap = new Map<string, { businessName: string; appointments: number; revenue: number }>();
    
    // Process appointments
    appointments.forEach((appt: Appointment) => {
      const vendorId = appt.vendor?._id || '';
      const vendorName = appt.vendor?.businessName || 'Unknown Vendor';
      const amount = appt.totalAmount || 0;
      
      totalRevenue += amount;
      
      // Update vendor stats
      if (vendorId) {
        const vendorStats = vendorStatsMap.get(vendorId) || { businessName: vendorName, appointments: 0, revenue: 0 };
        vendorStats.appointments += 1;
        vendorStats.revenue += amount;
        vendorStatsMap.set(vendorId, vendorStats);
      }
    });
    
    // Convert vendor stats to array
    const vendorStats: VendorSummary[] = Array.from(vendorStatsMap.entries()).map(([id, stats]) => ({
      _id: id,
      businessName: stats.businessName,
      totalAppointments: stats.appointments,
      totalRevenue: stats.revenue
    }));
    
    // Revenue data for chart (last 6 months)
    const revenueData = [];
    const appointmentData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      // Filter appointments for this month
      const monthAppointments = appointments.filter((appt: Appointment) => {
        const apptDate = new Date(appt.date);
        return apptDate.getMonth() === date.getMonth() && apptDate.getFullYear() === year;
      });
      
      const monthRevenue = monthAppointments.reduce((sum: number, appt: Appointment) => sum + (appt.totalAmount || 0), 0);
      
      revenueData.push({
        name: `${month} ${year}`,
        revenue: monthRevenue
      });
      
      appointmentData.push({
        name: `${month} ${year}`,
        appointments: monthAppointments.length
      });
    }
    
    return {
      totalClients,
      newClients,
      totalRevenue,
      totalAppointments,
      vendorStats,
      revenueData,
      appointmentData
    };
  }, [allClients, appointments]);
  
  // Client stats (derived from clientStatsMap)
  // const clientStats = clientStatsData;
  
  // Top vendors by revenue
  const topVendors = useMemo(() => {
    return [...vendorStats]
      .sort((a: VendorSummary, b: VendorSummary) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [vendorStats]);
  
  // Top clients by spending
  const topClients = useMemo(() => {
    return allClients
      .map((client: Client) => {
        const stats = clientStatsData.get(client._id) || { bookings: 0, revenue: 0, vendors: new Set() };
        return {
          ...client,
          totalBookings: stats.bookings,
          totalSpent: stats.revenue,
          vendorsCount: stats.vendors.size
        };
      })
      .sort((a: Client & { totalBookings: number; totalSpent: number; vendorsCount: number }, b: Client & { totalBookings: number; totalSpent: number; vendorsCount: number }) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }, [allClients, clientStatsData]);
  
  // Handle sorting
  const requestSort = (key: keyof Client) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Loading state
  if (isOfflineLoading || isOnlineLoading || isLoadingAppointments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading customer summary...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Summary</h1>
          <p className="text-muted-foreground">Detailed overview of your customers, appointments, and revenue</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button 
            variant={timeRange === 'quarter' ? 'default' : 'outline'} 
            onClick={() => setTimeRange('quarter')}
          >
            Quarter
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">+{newClients} new this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorStats.length}</div>
            <p className="text-xs text-muted-foreground">Active partnerships</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Appointments Trend</CardTitle>
            <CardDescription>Monthly appointments over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="appointments" 
                  fill="hsl(var(--primary))" 
                  name="Appointments"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Vendors by Revenue</CardTitle>
            <CardDescription>Vendors with the highest appointment revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Appointments</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topVendors.map((vendor) => (
                  <TableRow key={vendor._id}>
                    <TableCell className="font-medium">{vendor.businessName}</TableCell>
                    <TableCell className="text-right">{vendor.totalAppointments}</TableCell>
                    <TableCell className="text-right">₹{vendor.totalRevenue.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
                {topVendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No vendor data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Spending</CardTitle>
            <CardDescription>Your most valuable customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Vendors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>
                      <div className="font-medium">{client.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : 'Never'}
                      </div>
                    </TableCell>
                    <TableCell>{client.totalBookings}</TableCell>
                    <TableCell className="text-right">₹{client.totalSpent.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right">{client.vendorsCount}</TableCell>
                  </TableRow>
                ))}
                {topClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No client data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* All Clients */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>Complete list of your clients with booking details</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedClients.length)} of {sortedClients.length} clients
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('fullName')}>
                    <div className="flex items-center gap-1">
                      Client
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('totalBookings')}>
                    <div className="flex items-center gap-1">
                      Bookings
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => requestSort('totalSpent')}>
                    <div className="flex items-center justify-end gap-1">
                      Total Spent
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Vendors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client: Client) => {
                  const stats = clientStatsData.get(client._id) || { bookings: 0, revenue: 0, vendors: new Set() };
                  return (
                    <TableRow key={client._id}>
                      <TableCell>
                        <div className="font-medium">{client.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : 'Never'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="text-sm">{client.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{client.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={client.status === 'Active' ? 'default' : client.status === 'New' ? 'secondary' : 'outline'}
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{stats.bookings}</TableCell>
                      <TableCell className="text-right">₹{stats.revenue.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">{stats.vendors.size}</TableCell>
                    </TableRow>
                  );
                })}
                {paginatedClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {searchTerm ? 'No clients found matching your search' : 'No clients found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}