"use client";

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { MarketingForm } from './components/marketing/MarketingForm';
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
};

type ModalDataType = SmsTemplate | SmsPackage | SocialMediaPost | MarketingTicket | PurchaseHistory | ActiveCampaign | null;

export default function PlatformMarketingPage() {
  const dispatch = useAppDispatch();
  
  // Select data from Redux store
  const { 
    smsTemplates,
    smsPackages,
    socialPosts,
    marketingTickets,
    purchaseHistory,
    activeCampaigns,
    loading,
    error
  } = useAppSelector((state) => ({
    smsTemplates: state.marketing.smsTemplates,
    smsPackages: state.marketing.smsPackages,
    socialPosts: state.marketing.socialPosts,
    marketingTickets: state.marketing.marketingTickets,
    purchaseHistory: state.marketing.purchaseHistory,
    activeCampaigns: state.marketing.activeCampaigns,
    loading: state.marketing.loading,
    error: state.marketing.error
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'confirm'>('add');
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<ModalDataType>(null);
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);

  // Initialize data on component mount
  useEffect(() => {
    // The initial social media posts are already defined in the Redux slice
    // and will be automatically loaded when the store initializes
  }, [dispatch]);

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    // You might want to add a toast notification here
    // toast.success('Operation completed successfully!');
  };

  const openModal = (title: string, type: 'add' | 'edit' | 'view' | 'confirm', formType?: 'sms_template' | 'sms_package' | 'social_post', data: ModalDataType = null, onConfirm?: () => void) => {
    setModalTitle(title);
    setModalType(type);
    
    if (formType) {
      setFormData(data || {});
      setModalContent(
        <MarketingForm 
          type={formType} 
          data={data || {}} 
          onSuccess={handleFormSuccess}
          mode={type === 'view' ? 'view' : type === 'edit' ? 'edit' : 'add'}
        />
      );
    } else if (data) {
      setModalContent(viewDetails(data));
    }
    
    setModalData(data);
    if (onConfirm) setModalAction(() => onConfirm);
    setIsModalOpen(true);
  };

  const [formData, setFormData] = useState<any>({});
  
  const handleDelete = (type: string, id: string) => {
    const confirmDelete = () => {
      if (type === 'sms_template') {
        dispatch({ type: 'marketing/deleteSmsTemplate', payload: id });
      } else if (type === 'sms_package') {
        dispatch({ type: 'marketing/deleteSmsPackage', payload: id });
      } else if (type === 'social_post') {
        dispatch({ type: 'marketing/deleteSocialPost', payload: id });
      }
      setIsModalOpen(false);
    };

    openModal(
      'Confirm Delete',
      'confirm',
      undefined,
      { id, type },
      confirmDelete
    );
  };
  
  // This function is no longer needed as the form handles its own state
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const viewDetails = (data: any) => (
    <div className="space-y-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between border-b pb-1">
          <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
          <span>{String(value)}</span>
        </div>
      ))}
    </div>
  );

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
                    <div className="text-2xl font-bold">{activeCampaigns?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all marketing types</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{marketingTickets?.filter(t => t.status === 'Pending').length || 0}</div>
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
                            <Button onClick={() => openModal('Create New SMS Template', 'add', 'sms_template')}>
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
                                {smsTemplates?.map(t => (
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
                                                    onClick={() => openModal('View Template', 'view', 'sms_template', t)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => openModal('Edit Template', 'edit', 'sms_template', t)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive/80"
                                                    onClick={() => handleDelete('sms_template', t.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!smsTemplates || smsTemplates.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                            No SMS templates found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
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
                        <Button onClick={() => openModal('Create New SMS Package', 'add', 'sms_package')}>
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
                                {smsPackages?.map(pkg => (
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
                                                <Button variant="ghost" size="icon" onClick={() => openModal('View Package', 'view', 'sms_package', pkg)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openModal('Edit Package', 'edit', 'sms_package', pkg)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete('sms_package', pkg.id)}>
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
                        <Button onClick={() => openModal('Create New Social Post', 'add', 'social_post')}>
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
                                {socialPosts?.map((post: SocialMediaPost) => (
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
                                                    onClick={() => openModal('View Post', 'view', 'social_post', post)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => openModal('Edit Post', 'edit', 'social_post', post)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive"
                                                    onClick={() => handleDelete('social_post', post.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!socialPosts || socialPosts.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                            No social media posts found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
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
                                {marketingTickets?.map((ticket) => (
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
                                                    onClick={() => openModal('View Ticket', 'view', undefined, ticket)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!marketingTickets || marketingTickets.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                                            No marketing tickets found.
                                        </TableCell>
                                    </TableRow>
                                )}
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
                                {purchaseHistory?.map((purchase) => (
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
                                                    onClick={() => openModal('Purchase Details', 'view', undefined, purchase)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!purchaseHistory || purchaseHistory.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                                            No purchase history found.
                                        </TableCell>
                                    </TableRow>
                                )}
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
                                {activeCampaigns?.map((campaign) => (
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
                                                    onClick={() => openModal('Campaign Details', 'view', undefined, campaign)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </TableRow>
                                ))}
                                {(!activeCampaigns || activeCampaigns.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                                            No active campaigns found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              {modalType === 'confirm' 
                ? 'Are you sure you want to perform this action? This cannot be undone.'
                : modalType === 'view' 
                  ? 'Viewing details of the selected item.'
                  : `Fill in the form to ${modalType === 'add' ? 'add a new' : 'update the'} item.`}
            </DialogDescription>
          </DialogHeader>
          {modalContent}
          {modalType === 'confirm' && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={modalAction}>
                Confirm
              </Button>
            </DialogFooter>
          )}
          {modalType === 'view' && (
            <DialogFooter>
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}