
"use client";

import { useState } from 'react';
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

const smsTemplatesData = [
  { id: 'TMP001', name: 'Welcome Offer', type: 'Promotional', price: 500, status: 'Active', content: 'Welcome to our salon! Enjoy 20% off on your first visit.' },
  { id: 'TMP002', name: 'Appointment Reminder', type: 'Transactional', price: 200, status: 'Active', content: 'Your appointment is tomorrow at 2 PM. See you soon!' },
  { id: 'TMP003', name: 'Festive Discount', type: 'Promotional', price: 750, status: 'Inactive', content: 'Celebrate Diwali with us! Get 25% off all services.' },
];

const smsPackagesData = [
  { id: 'PKG001', name: 'Starter Pack', smsCount: 1000, price: 100000, description: 'Ideal for new vendors.' },
  { id: 'PKG002', name: 'Growth Pack', smsCount: 5000, price: 450000, description: 'For growing businesses.' },
  { id: 'PKG003', name: 'Pro Pack', smsCount: 10000, price: 800000, description: 'For high-volume marketing.' },
];

const socialMediaPostsData = [
    { id: 'POST001', title: 'Summer Sale Announcement', platform: 'Instagram', price: 10000, description: 'A vibrant post announcing the summer sale.' },
    { id: 'POST002', title: 'New Service Launch', platform: 'Facebook', price: 12000, description: 'An engaging post to introduce a new service.' },
];

const marketingTicketsData = [
    { id: 'TKT001', vendorName: 'Glamour Salon', requestDate: '2024-08-10', service: 'Digital Marketing Campaign', status: 'Pending' },
    { id: 'TKT002', vendorName: 'Modern Cuts', requestDate: '2024-08-12', service: 'SEO Optimization', status: 'In Progress' },
    { id: 'TKT003', vendorName: 'Style Hub', requestDate: '2024-08-15', service: 'Social Media Management', status: 'Completed' },
];

const purchaseHistoryData = [
    { id: 'PUR001', vendorName: 'Beauty Bliss', item: 'Starter Pack (SMS)', date: '2024-08-01', amount: 100000 },
    { id: 'PUR002', vendorName: 'The Men\'s Room', item: 'Basic Social (Posts)', date: '2024-08-05', amount: 500000 },
];

const activeCampaignsData = [
    { id: 'CAMP001', vendorName: 'Glamour Salon', salonName: 'Glamour Salon', contact: '123-456-7890', email: 'glamour@example.com', activationDate: '2024-08-01', expirationDate: '2024-09-01', status: true },
    { id: 'CAMP002', vendorName: 'Modern Cuts', salonName: 'Modern Cuts', contact: '987-654-3210', email: 'modern@example.com', activationDate: '2024-08-15', expirationDate: '2024-08-25', status: true },
];

type ModalDataType = typeof smsTemplatesData[0] | typeof smsPackagesData[0] | typeof socialMediaPostsData[0] | typeof marketingTicketsData[0] | null;

export default function PlatformMarketingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'confirm'>('add');
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<ModalDataType>(null);
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);

  const openModal = (title: string, type: 'add' | 'edit' | 'view' | 'confirm', content: React.ReactNode, data: ModalDataType = null, onConfirm?: () => void) => {
    setModalTitle(title);
    setModalType(type);
    setModalContent(content);
    setModalData(data);
    if(onConfirm) setModalAction(() => onConfirm);
    setIsModalOpen(true);
  };

  const createTemplateForm = (data?: any) => (
    <div className="grid gap-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input id="template-name" defaultValue={data?.name} placeholder="e.g., Welcome Offer" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="template-type">Template Type</Label>
            <Select defaultValue={data?.type}>
                <SelectTrigger id="template-type"><SelectValue placeholder="Select a type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Promotional">Promotional</SelectItem>
                    <SelectItem value="Transactional">Transactional</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="template-price">Price (in paise)</Label>
            <Input id="template-price" type="number" defaultValue={data?.price} placeholder="e.g., 50000" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="template-content">Content</Label>
            <Textarea id="template-content" defaultValue={data?.content} placeholder="Enter SMS content here..." />
        </div>
    </div>
  );

  const createSmsPackageForm = (data?: any) => (
     <div className="grid gap-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="pkg-name">Package Name</Label>
            <Input id="pkg-name" defaultValue={data?.name} placeholder="e.g., Starter Pack" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pkg-count">SMS Count</Label>
            <Input id="pkg-count" type="number" defaultValue={data?.smsCount} placeholder="e.g., 1000" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pkg-price">Price (in paise)</Label>
            <Input id="pkg-price" type="number" defaultValue={data?.price} placeholder="e.g., 100000" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pkg-desc">Description</Label>
            <Textarea id="pkg-desc" defaultValue={data?.description} placeholder="A brief description of the package." />
        </div>
    </div>
  );
  
  const createSocialPostForm = (data?: any) => (
     <div className="grid gap-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="post-title">Post Title</Label>
            <Input id="post-title" defaultValue={data?.title} placeholder="e.g., Summer Sale" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="post-platform">Platform</Label>
            <Select defaultValue={data?.platform}>
                <SelectTrigger id="post-platform"><SelectValue placeholder="Select social media platform" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="post-price">Price (in paise)</Label>
            <Input id="post-price" type="number" defaultValue={data?.price} placeholder="e.g., 10000" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="post-desc">Description</Label>
            <Textarea id="post-desc" defaultValue={data?.description} placeholder="Briefly describe the social media post." />
        </div>
    </div>
  );

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
                    <div className="text-2xl font-bold">{activeCampaignsData.length}</div>
                    <p className="text-xs text-muted-foreground">Across all marketing types</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{marketingTicketsData.filter(t => t.status === 'Pending').length}</div>
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
                        <Button onClick={() => openModal('Create New SMS Template', 'add', createTemplateForm())}>
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
                                {smsTemplatesData.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>{t.name}</TableCell>
                                        <TableCell>{t.type}</TableCell>
                                        <TableCell>₹{t.price / 100}</TableCell>
                                        <TableCell>{t.status}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openModal('View Template', 'view', viewDetails(t), t)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => openModal('Edit Template', 'edit', createTemplateForm(t), t)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
                        <Button onClick={() => openModal('Create New SMS Package', 'add', createSmsPackageForm())}>
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
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {smsPackagesData.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.id}</TableCell>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>{p.smsCount.toLocaleString()}</TableCell>
                                        <TableCell>₹{(p.price / 100).toLocaleString()}</TableCell>
                                        <TableCell className="max-w-xs truncate">{p.description}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openModal('View Package', 'view', viewDetails(p), p)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => openModal('Edit Package', 'edit', createSmsPackageForm(p), p)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
                            <CardDescription>Manage individual social media posts available for purchase.</CardDescription>
                        </div>
                        <Button onClick={() => openModal('Create New Social Post', 'add', createSocialPostForm())}>
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
                                    <TableHead>Post ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Platform</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {socialMediaPostsData.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.id}</TableCell>
                                        <TableCell>{p.title}</TableCell>
                                        <TableCell>{p.platform}</TableCell>
                                        <TableCell>₹{(p.price / 100).toLocaleString()}</TableCell>
                                        <TableCell className="max-w-xs truncate">{p.description}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openModal('View Post', 'view', viewDetails(p), p)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => openModal('Edit Post', 'edit', createSocialPostForm(p), p)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
                    <CardTitle>Active Marketing Campaigns</CardTitle>
                    <CardDescription>Monitor and manage all ongoing vendor campaigns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Activation</TableHead>
                                    <TableHead>Expiration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeCampaignsData.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <div className="font-medium">{c.vendorName}</div>
                                            <div className="text-sm text-muted-foreground">{c.salonName}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div>{c.contact}</div>
                                            <div className="text-sm text-muted-foreground">{c.email}</div>
                                        </TableCell>
                                        <TableCell>{c.activationDate}</TableCell>
                                        <TableCell>{c.expirationDate}</TableCell>
                                        <TableCell>{c.status ? 'Active' : 'Expired'}</TableCell>
                                        <TableCell className="text-right">
                                            <Switch checked={c.status} onCheckedChange={() => {}} aria-label="Toggle campaign status" />
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
                    <CardTitle>Digital Marketing Tickets</CardTitle>
                    <CardDescription>Manage digital marketing requests from vendors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket ID</TableHead>
                                    <TableHead>Vendor Name</TableHead>
                                    <TableHead>Request Date</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {marketingTicketsData.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>{t.vendorName}</TableCell>
                                        <TableCell>{t.requestDate}</TableCell>
                                        <TableCell>{t.service}</TableCell>
                                        <TableCell>{t.status}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-green-600"><CheckCircle className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive"><XCircle className="h-4 w-4" /></Button>
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
                    <CardTitle>Purchase History</CardTitle>
                    <CardDescription>History of all marketing-related purchases by vendors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Purchase ID</TableHead>
                                    <TableHead>Vendor Name</TableHead>
                                    <TableHead>Item Purchased</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseHistoryData.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.id}</TableCell>
                                        <TableCell>{p.vendorName}</TableCell>
                                        <TableCell>{p.item}</TableCell>
                                        <TableCell>{p.date}</TableCell>
                                        <TableCell>₹{(p.amount / 100).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{modalTitle}</DialogTitle>
            </DialogHeader>
            {modalContent}
            <DialogFooter>
                {modalType === 'view' ? (
                     <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
                ) : modalType === 'confirm' ? (
                     <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => { if(modalAction) modalAction(); setIsModalOpen(false); }}>Confirm</Button>
                     </>
                ) : (
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button>Save</Button>
                    </>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
