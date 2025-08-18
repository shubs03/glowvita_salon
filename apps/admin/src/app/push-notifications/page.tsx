
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
import { Plus, Eye, Trash2, Send, MessageSquare, Mail, Users, User, Search, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { Badge } from '@repo/ui/badge';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { openNotificationModal, closeNotificationModal } from '@repo/store/slices/notificationSlice';

const notificationsData = [
  { id: 'NOTIF-001', title: 'Summer Sale!', type: 'SMS, Email', target: 'All Vendors', date: '2024-08-15', status: 'Sent' },
  { id: 'NOTIF-002', title: 'New Feature Alert', type: 'Email', target: 'All Users', date: '2024-08-14', status: 'Sent' },
  { id: 'NOTIF-003', title: 'Maintenance Window', type: 'SMS', target: 'All Staff', date: '2024-08-13', status: 'Scheduled' },
  { id: 'NOTIF-004', title: 'Your exclusive offer', type: 'Email', target: 'Specific Users (5)', date: '2024-08-12', status: 'Sent' },
];

const mockUsers = [
    { id: 'user_1', name: 'Alice' },
    { id: 'user_2', name: 'Bob' },
    { id: 'user_3', name: 'Charlie' },
];

const mockVendors = [
    { id: 'vendor_1', name: 'Glamour Salon' },
    { id: 'vendor_2', name: 'Modern Cuts' },
    { id: 'vendor_3', name: 'Style Hub' },
];

export default function PushNotificationsPage() {
  const dispatch = useAppDispatch();
  const { isModalOpen, modalType, notificationData } = useAppSelector(state => state.notification);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [targetType, setTargetType] = useState('all_users');
  const [selectedTargets, setSelectedTargets] = useState<{id: string, name: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = notificationsData.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(notificationsData.length / itemsPerPage);

  const getTargetData = () => {
    if (targetType === 'specific_user') return mockUsers;
    if (targetType === 'specific_vendor') return mockVendors;
    return [];
  }

  const filteredTargets = getTargetData().filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTargets.some(st => st.id === t.id)
  );

  const handleSelectTarget = (target: {id: string, name: string}) => {
    setSelectedTargets([...selectedTargets, target]);
    setSearchQuery('');
  }

  const handleRemoveTarget = (targetId: string) => {
    setSelectedTargets(selectedTargets.filter(t => t.id !== targetId));
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic
    dispatch(closeNotificationModal());
  }
  
  const handleOpenModal = (type: 'add' | 'edit' | 'view', data?: any) => {
    dispatch(openNotificationModal({ modalType: type, data: data }));
  };
  
  const handleCloseModal = () => {
    dispatch(closeNotificationModal());
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Push Notifications</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationsData.length}</div>
            <p className="text-xs text-muted-foreground">Across all channels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationsData.filter(n => n.type.includes('SMS')).length}</div>
            <p className="text-xs text-muted-foreground">Total SMS notifications</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationsData.filter(n => n.type.includes('Email')).length}</div>
            <p className="text-xs text-muted-foreground">Total email notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Targeted</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">All Users</div>
            <p className="text-xs text-muted-foreground">Most common audience</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>A log of all sent and scheduled notifications.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal('add')}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Notification
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto no-scrollbar rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>{notification.type}</TableCell>
                    <TableCell>{notification.target}</TableCell>
                    <TableCell>{notification.date}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            notification.status === "Sent" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}>
                            {notification.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal('view', notification)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={notificationsData.length}
            />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {modalType === 'add' && 'Create New Notification'}
                {modalType === 'edit' && 'Edit Notification'}
                {modalType === 'view' && 'View Notification'}
              </DialogTitle>
              <DialogDescription>
                {modalType === 'view' 
                  ? `Viewing notification: "${(notificationData as any)?.title}"`
                  : "Compose and send a new notification to your audience."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label>Type</Label>
                    <RadioGroup defaultValue="both" className="flex gap-4" disabled={modalType === 'view'}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sms" id="sms" />
                            <Label htmlFor="sms">SMS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both">Both</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="e.g., Special Weekend Offer" required disabled={modalType === 'view'} defaultValue={(notificationData as any)?.title || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" name="content" placeholder="Enter notification content here..." required disabled={modalType === 'view'} defaultValue={""} />
                </div>
                <div className="space-y-2">
                    <Label>Target Audience</Label>
                     <RadioGroup value={targetType} onValueChange={setTargetType} className="grid grid-cols-2 gap-2" disabled={modalType === 'view'}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="all_users" id="all_users" /><Label htmlFor="all_users">All Users</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="all_vendors" id="all_vendors" /><Label htmlFor="all_vendors">All Vendors</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="all_staff" id="all_staff" /><Label htmlFor="all_staff">All Staff</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="specific_user" id="specific_user" /><Label htmlFor="specific_user">Specific User(s)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="specific_vendor" id="specific_vendor" /><Label htmlFor="specific_vendor">Specific Vendor(s)</Label></div>
                    </RadioGroup>
                </div>

                {(targetType === 'specific_user' || targetType === 'specific_vendor') && modalType !== 'view' && (
                    <div className="space-y-2">
                        <Label>Select {targetType === 'specific_user' ? 'Users' : 'Vendors'}</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder={`Search for a ${targetType.split('_')[1]}...`} 
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {searchQuery && (
                            <Card className="max-h-40 overflow-y-auto">
                                <CardContent className="p-2">
                                    {filteredTargets.map(t => (
                                        <div key={t.id} onClick={() => handleSelectTarget(t)} className="p-2 hover:bg-accent rounded-md cursor-pointer text-sm">
                                            {t.name}
                                        </div>
                                    ))}
                                     {filteredTargets.length === 0 && <p className="p-2 text-sm text-muted-foreground">No results found.</p>}
                                </CardContent>
                            </Card>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedTargets.map(t => (
                                <Badge key={t.id} variant="secondary">
                                    {t.name}
                                    <button onClick={() => handleRemoveTarget(t.id)} className="ml-2 rounded-full hover:bg-muted-foreground/20">
                                        <X className="h-3 w-3"/>
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                {modalType === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {modalType !== 'view' && <Button type="submit">Send Notification</Button>}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
