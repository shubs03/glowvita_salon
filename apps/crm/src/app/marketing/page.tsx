
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Eye, Edit, Trash2, Ticket, CheckCircle, XCircle, DollarSign, MessageSquare, Megaphone, AlertCircle, Send, Users, Calendar, Power } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Switch } from '@repo/ui/switch';

// Data types for the marketing module

type SmsTemplate = {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
  content: string;
};

type SmsPackage = {
  id: string;
  name: string;
  smsCount: number;
  price: number;
  description: string;
  validityDays: number;
  isPopular: boolean;
  features: string[];
};

type SocialMediaPost = {
  id: string;
  title: string;
  platform: string;
  price: number;
  description: string;
  image?: string;
  status: string;
  scheduledDate: string | null;
};

type MarketingTicket = {
  id: string;
  vendorName: string;
  requestDate: string;
  service: string;
  status: string;
  priority: string;
  assignedTo: string;
  lastUpdated: string;
  notes: string;
};

type PurchaseHistory = {
  id: string;
  vendorName: string;
  item: string;
  date: string;
  amount: number;
  status: string;
  paymentMethod: string;
  invoiceNumber: string;
};

type ActiveCampaign = {
  id: string;
  vendorName: string;
  salonName: string;
  contact: string;
  email: string;
  campaignType: string;
  startDate: string;
  endDate: string;
  status: string | boolean;
  budget: number;
  [key: string]: any; // For additional metrics
};

type ModalDataType = SmsTemplate | SmsPackage | SocialMediaPost | MarketingTicket | PurchaseHistory | ActiveCampaign | null;

const initialSmsTemplates = [
    { id: 'TMP001', name: 'Welcome Offer', type: 'Promotional', price: 500, status: 'Active', content: 'Welcome to our salon! Enjoy 20% off on your first visit.' },
    { id: 'TMP002', name: 'Appointment Reminder', type: 'Transactional', price: 200, status: 'Active', content: 'Your appointment is tomorrow at 2 PM. See you soon!' },
    { id: 'TMP003', name: 'Festive Discount', type: 'Promotional', price: 750, status: 'Inactive', content: 'Celebrate Diwali with us! Get 25% off all services.' }
];

const initialSmsPackages = [
  {
    id: 'PKG001',
    name: 'Starter Pack',
    smsCount: 1000,
    price: 100000,
    description: 'Ideal for new vendors.',
    validityDays: 30,
    isPopular: false,
    features: ['1000 SMS', '30 days validity', 'Basic support']
  },
  {
    id: 'PKG002',
    name: 'Growth Pack',
    smsCount: 5000,
    price: 450000,
    description: 'For growing businesses.',
    validityDays: 60,
    isPopular: true,
    features: ['5000 SMS', '60 days validity', 'Priority support', 'Analytics']
  },
  {
    id: 'PKG003',
    name: 'Pro Pack',
    smsCount: 10000,
    price: 800000,
    description: 'For high-volume marketing.',
    validityDays: 90,
    isPopular: false,
    features: ['10000 SMS', '90 days validity', '24/7 Priority support', 'Advanced Analytics', 'Dedicated Account Manager']
  }
];

const initialSocialPosts = [
    { id: 'POST001', title: 'Summer Special', platform: 'instagram', content: 'Get 20% off on all hair treatments this summer!', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', price: 1500, description: 'Promoting our summer special offer', status: 'scheduled', scheduledDate: new Date(Date.now() + 86400000).toISOString() },
    { id: 'POST002', title: 'New Services', platform: 'facebook', content: 'Check out our new spa treatments!', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', price: 2000, description: 'Announcing our new spa services', status: 'published', publishedAt: new Date().toISOString() }
];

const initialMarketingTickets = [
    { id: 'TKT001', vendorName: 'Glamour Salon', requestDate: '2024-08-10', service: 'Digital Marketing Campaign', status: 'Pending', priority: 'High', assignedTo: 'Marketing Team', lastUpdated: '2024-08-10T10:30:00Z', notes: 'Need to create a social media campaign for the upcoming festival season.' },
    { id: 'TKT002', vendorName: 'Modern Cuts', requestDate: '2024-08-12', service: 'SEO Optimization', status: 'In Progress', priority: 'Medium', assignedTo: 'SEO Team', lastUpdated: '2024-08-12T14:15:00Z', notes: 'Improve search rankings for local keywords.' },
    { id: 'TKT003', vendorName: 'Style Hub', requestDate: '2024-08-15', service: 'Social Media Management', status: 'Completed', priority: 'Low', assignedTo: 'Social Media Team', lastUpdated: '2024-08-18T16:45:00Z', notes: 'Monthly content calendar created and scheduled.' }
];

const initialPurchaseHistory = [
    { id: 'PUR001', vendorName: 'Beauty Bliss', item: 'Starter Pack (SMS)', date: '2024-08-01', amount: 100000, status: 'Completed', paymentMethod: 'Credit Card', invoiceNumber: 'INV-2024-001' },
    { id: 'PUR002', vendorName: 'The Men\'s Room', item: 'Basic Social (Posts)', date: '2024-08-05', amount: 500000, status: 'Completed', paymentMethod: 'Bank Transfer', invoiceNumber: 'INV-2024-002' }
];

const initialActiveCampaigns = [
    { id: 'CAMP001', vendorName: 'Glamour Salon', salonName: 'Glamour Salon', contact: '123-456-7890', email: 'glamour@example.com', campaignType: 'Social Media', startDate: '2024-08-01', endDate: '2024-09-01', status: 'Active', budget: 50000, impressions: 12500, clicks: 1250, ctr: 10.0 },
    { id: 'CAMP002', vendorName: 'Modern Cuts', salonName: 'Modern Cuts', contact: '987-654-3210', email: 'modern@example.com', campaignType: 'SMS Marketing', startDate: '2024-08-15', endDate: '2024-08-25', status: 'Active', budget: 25000, messagesSent: 1500, deliveryRate: 98.5, openRate: 65.2 }
];

export default function PlatformMarketingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'confirm'>('add');
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<ModalDataType>(null);
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [formData, setFormData] = useState<any>({});


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Platform Marketing</h1>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Marketing Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹6,000</div>
                    <p className="text-xs text-muted-foreground">From all package sales</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,250</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{initialActiveCampaigns?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all marketing types</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{initialMarketingTickets?.filter(t => t.status === 'Pending').length || 0}</div>
                    <p className="text-xs text-muted-foreground">Awaiting resolution</p>
                </CardContent>
            </Card>
        </div>


       <Tabs defaultValue="sms_templates">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="sms_templates">SMS Templates</TabsTrigger>
            <TabsTrigger value="sms_packages">SMS Packages</TabsTrigger>
            <TabsTrigger value="social_media">Social Posts</TabsTrigger>
            <TabsTrigger value="marketing_tickets">Marketing Tickets</TabsTrigger>
            <TabsTrigger value="purchase_history">Purchase History</TabsTrigger>
            <TabsTrigger value="active_campaigns">Active Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="sms_templates" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>SMS Templates</CardTitle>
                            <CardDescription>Manage predefined SMS templates for vendors.</CardDescription>
                        </div>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Template
                            </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Template ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialSmsTemplates?.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>{t.name}</TableCell>
                                        <TableCell>{t.type}</TableCell>
                                        <TableCell>₹{(t.price / 100).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                t.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive/80"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="sms_packages" className="mt-4">
            <Card>
                <CardHeader>
                     <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>SMS Packages</CardTitle>
                            <CardDescription>Create and manage bulk SMS packages for vendors.</CardDescription>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Package
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Package ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>SMS Count</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialSmsPackages?.map(pkg => (
                                    <TableRow key={pkg.id}>
                                        <TableCell>{pkg.id}</TableCell>
                                        <TableCell className="font-medium">
                                            {pkg.name}
                                            {pkg.isPopular && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{pkg.smsCount.toLocaleString()}</TableCell>
                                        <TableCell>₹{(pkg.price / 100).toFixed(2)}</TableCell>
                                        <TableCell>{pkg.validityDays} days</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="social_media" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Social Media Posts</CardTitle>
                            <CardDescription>Manage your social media marketing content.</CardDescription>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Post
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Platform</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Scheduled Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialSocialPosts?.map((post: SocialMediaPost) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-2">
                                                {post.image && (
                                                    <div className="h-10 w-10 rounded-md overflow-hidden">
                                                        <img 
                                                            src={post.image} 
                                                            alt={post.title} 
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <span>{post.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{post.platform}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                post.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                                post.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {post.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>₹{(post.price / 100).toFixed(2)}</TableCell>
                                        <TableCell>
                                            {post.scheduledDate ? 
                                                new Date(post.scheduledDate).toLocaleDateString() : 
                                                'Not scheduled'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="marketing_tickets" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Marketing Tickets</CardTitle>
                            <CardDescription>View and manage marketing support tickets.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket ID</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialMarketingTickets?.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>{ticket.id}</TableCell>
                                        <TableCell>{ticket.vendorName}</TableCell>
                                        <TableCell>{ticket.service}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                ticket.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                ticket.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                                ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {ticket.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell>{ticket.assignedTo}</TableCell>
                                        <TableCell>{new Date(ticket.lastUpdated).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="purchase_history" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Purchase History</CardTitle>
                            <CardDescription>View history of all marketing-related purchases.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialPurchaseHistory?.map((purchase) => (
                                    <TableRow key={purchase.id}>
                                        <TableCell>{purchase.invoiceNumber}</TableCell>
                                        <TableCell>{purchase.vendorName}</TableCell>
                                        <TableCell>{purchase.item}</TableCell>
                                        <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                        <TableCell>₹{(purchase.amount / 100).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                purchase.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {purchase.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{purchase.paymentMethod}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="active_campaigns" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Active Campaigns</CardTitle>
                            <CardDescription>View and manage all active marketing campaigns.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign ID</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Budget</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Performance</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialActiveCampaigns?.map((campaign) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell>{campaign.id}</TableCell>
                                        <TableCell>{campaign.vendorName}</TableCell>
                                        <TableCell>{campaign.campaignType}</TableCell>
                                        <TableCell>
                                            {new Date(campaign.startDate).toLocaleDateString()} - 
                                            {new Date(campaign.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>₹{(campaign.budget / 100).toFixed(2)}</TableCell>
                                        <td>
                                            <div className="flex items-center">
                                                <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                                    campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                                                }`}></span>
                                                {campaign.status}
                                            </div>
                                        </td>
                                        <td>
                                            {campaign.campaignType === 'Social Media' ? (
                                                <div className="text-sm">
                                                    <div>Impressions: {campaign.impressions?.toLocaleString() || 'N/A'}</div>
                                                    <div>CTR: {campaign.ctr || '0'}%</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <div>Sent: {campaign.messagesSent?.toLocaleString() || '0'}</div>
                                                    <div>Open Rate: {campaign.openRate || '0'}%</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
