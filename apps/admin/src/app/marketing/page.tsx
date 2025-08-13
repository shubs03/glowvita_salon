
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
import { Plus, Eye, Edit, Trash2, Ticket, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';

const smsTemplatesData = [
  { id: 'TMP001', name: 'Welcome Offer', type: 'Promotional', price: 500, status: 'Active' },
  { id: 'TMP002', name: 'Appointment Reminder', type: 'Transactional', price: 200, status: 'Active' },
  { id: 'TMP003', name: 'Festive Discount', type: 'Promotional', price: 750, status: 'Inactive' },
];

const smsPackagesData = [
  { id: 'PKG001', name: 'Starter Pack', smsCount: 1000, price: 100000, description: 'Ideal for new vendors.' },
  { id: 'PKG002', name: 'Growth Pack', smsCount: 5000, price: 450000, description: 'For growing businesses.' },
  { id: 'PKG003', name: 'Pro Pack', smsCount: 10000, price: 800000, description: 'For high-volume marketing.' },
];

const socialMediaData = [
    { id: 'SOC001', name: 'Basic Social', postCount: 10, price: 500000, description: '5 Facebook, 5 Instagram posts.' },
    { id: 'SOC002', name: 'Advanced Social', postCount: 25, price: 1200000, description: 'Full social media handling.' },
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

export default function PlatformMarketingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const openModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const createTemplateModal = (
    <div className="grid gap-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input id="template-name" placeholder="e.g., Welcome Offer" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="template-type">Template Type</Label>
            <Select>
                <SelectTrigger id="template-type">
                    <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="template-price">Price (in paise)</Label>
            <Input id="template-price" type="number" placeholder="e.g., 50000" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="template-file">Upload File</Label>
            <Input id="template-file" type="file" />
        </div>
    </div>
  );

  const createSmsPackageModal = (
     <div className="grid gap-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="pkg-name">Package Name</Label>
            <Input id="pkg-name" placeholder="e.g., Starter Pack" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pkg-count">SMS Count</Label>
            <Input id="pkg-count" type="number" placeholder="e.g., 1000" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pkg-price">Price (in paise)</Label>
            <Input id="pkg-price" type="number" placeholder="e.g., 100000" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pkg-desc">Description</Label>
            <Textarea id="pkg-desc" placeholder="A brief description of the package." />
        </div>
    </div>
  );
  
    const createSocialPackageModal = (
     <div className="grid gap-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="soc-name">Package Name</Label>
            <Input id="soc-name" placeholder="e.g., Basic Social" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="soc-count">Post Count</Label>
            <Input id="soc-count" type="number" placeholder="e.g., 10" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="soc-price">Price (in paise)</Label>
            <Input id="soc-price" type="number" placeholder="e.g., 500000" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="soc-desc">Description</Label>
            <Textarea id="soc-desc" placeholder="e.g., 5 Facebook, 5 Instagram posts." />
        </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Platform Marketing</h1>

       <Tabs defaultValue="sms_templates">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 max-w-4xl">
            <TabsTrigger value="sms_templates">SMS Templates</TabsTrigger>
            <TabsTrigger value="sms_packages">SMS Packages</TabsTrigger>
            <TabsTrigger value="social_media">Social Media</TabsTrigger>
            <TabsTrigger value="marketing_tickets">Marketing Tickets</TabsTrigger>
            <TabsTrigger value="purchase_history">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="sms_templates">
            <Card className="mt-4">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>SMS Templates</CardTitle>
                            <CardDescription>Manage predefined SMS templates for vendors.</CardDescription>
                        </div>
                        <Button onClick={() => openModal('Create New SMS Template', createTemplateModal)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
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
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="sms_packages">
            <Card className="mt-4">
                <CardHeader>
                     <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>SMS Packages</CardTitle>
                            <CardDescription>Create and manage bulk SMS packages for vendors.</CardDescription>
                        </div>
                        <Button onClick={() => openModal('Create New SMS Package', createSmsPackageModal)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Package
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
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
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="social_media">
            <Card className="mt-4">
                <CardHeader>
                     <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Social Media Packages</CardTitle>
                            <CardDescription>Manage packages for social media posts and campaigns.</CardDescription>
                        </div>
                        <Button onClick={() => openModal('Create New Social Media Package', createSocialPackageModal)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Package
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Package ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Post Count</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {socialMediaData.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.id}</TableCell>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.postCount}</TableCell>
                                    <TableCell>₹{(p.price / 100).toLocaleString()}</TableCell>
                                    <TableCell className="max-w-xs truncate">{p.description}</TableCell>
                                     <TableCell className="text-right">
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="marketing_tickets">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Digital Marketing Tickets</CardTitle>
                    <CardDescription>Manage digital marketing requests from vendors.</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="purchase_history">
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Purchase History</CardTitle>
                    <CardDescription>History of all marketing-related purchases by vendors.</CardDescription>
                </CardHeader>
                <CardContent>
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
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
