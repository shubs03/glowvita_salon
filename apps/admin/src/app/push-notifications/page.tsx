
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Eye, Trash2, Send, MessageSquare, Mail, Users, Search, X, Edit2 } from 'lucide-react';
import { Checkbox } from '@repo/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { Badge } from '@repo/ui/badge';
import { Skeleton } from '@repo/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@repo/store/hooks';
import { openNotificationModal, closeNotificationModal } from '@repo/store/slices/notificationSlice';
import { useGetNotificationsQuery, useCreateNotificationMutation, useUpdateNotificationMutation, useDeleteNotificationMutation, useGetUsersQuery, useGetVendorsQuery, useGetRegionsQuery } from '@repo/store/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';


interface Target {
  id: string;
  name: string;
}

interface Notification {
  _id: string;
  title: string;
  content: string;
  types: string[];
  targetType: string;
  specificIds?: string[];
  status: string;
  date: string;
}

export default function PushNotificationsPage() {
  const dispatch = useAppDispatch();
  const { isModalOpen, modalType, notificationData } = useAppSelector(state => state.notification);
  const { user } = useAppSelector((state: any) => state.adminAuth);
  const userRole = user?.roleName || user?.role;
  const userRegion = user?.assignedRegions?.[0];

  const { data: regions = [] } = useGetRegionsQuery(undefined);
  const [selectedRegion, setSelectedRegion] = useState<string>(userRole === 'SUPER_ADMIN' || userRole === 'superadmin' ? "" : userRegion || "");

  
  const { data: notifications = [], isLoading: isNotificationsLoading } = useGetNotificationsQuery(selectedRegion || undefined);
  const { data: users = [], isLoading: isUsersLoading } = useGetUsersQuery(selectedRegion ? { regionId: selectedRegion } : undefined);
  const { data: vendors = [], isLoading: isVendorsLoading } = useGetVendorsQuery(selectedRegion ? { regionId: selectedRegion } : undefined);
  const [createNotification] = useCreateNotificationMutation();
  const [updateNotification] = useUpdateNotificationMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [types, setTypes] = useState<string[]>([]);
  const [targetType, setTargetType] = useState<string>('all_users');
  const [selectedTargets, setSelectedTargets] = useState<Target[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isLoading = isNotificationsLoading || isUsersLoading || isVendorsLoading;

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = notifications.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const handleCloseModal = useCallback(() => {
    dispatch(closeNotificationModal());
  }, [dispatch]);

  useEffect(() => {
    if (isModalOpen) {
      const data = notificationData as Notification | null;
      // Only update state if modal is open and data has changed
      if (modalType === 'add' && data) {
        setTitle(data.title || '');
        setContent(data.content || '');
        setTypes(data.types || []);
        setTargetType(data.targetType || 'all_users');
        setSelectedTargets(getSelectedTargetsFromData(data));
      } else if (modalType === 'edit' || modalType === 'view') {
        setTitle(data?.title || '');
        setContent(data?.content || '');
        setTypes(data?.types || []);
        setTargetType(data?.targetType || 'all_users');
        setSelectedTargets(getSelectedTargetsFromData(data));
      } else {
        setTitle('');
        setContent('');
        setTypes([]);
        setTargetType('all_users');
        setSelectedTargets([]);
      }
      setSearchQuery('');
    }
  }, [isModalOpen, modalType, notificationData]); // Removed users, vendors from dependencies to prevent loop

  const getSelectedTargetsFromData = useCallback((data: Notification | null): Target[] => {
    if (data?.specificIds && (data.targetType === 'specific_users' || data.targetType === 'specific_vendors')) {
      const list = data.targetType === 'specific_users' ? users : vendors;
      return data.specificIds.map(id => {
        const found = list.find((item: Target) => item.id === id);
        return found ? { id, name: found.name } : null;
      }).filter((item): item is Target => item !== null);
    }
    return [];
  }, [users, vendors]);

  const getTargetData = useCallback((): Target[] => {
    if (targetType === 'specific_users') return users;
    if (targetType === 'specific_vendors') return vendors;
    return [];
  }, [targetType, users, vendors]);

  const filteredTargets = useMemo(() => getTargetData().filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTargets.some(st => st.id === t.id)
  ), [getTargetData, searchQuery, selectedTargets]);

  const handleSelectTarget = useCallback((target: Target) => {
    setSelectedTargets(prev => [...prev, target]);
    setSearchQuery('');
  }, []);

  const handleRemoveTarget = useCallback((targetId: string) => {
    setSelectedTargets(prev => prev.filter(t => t.id !== targetId));
  }, []);

  const handleTypeChange = useCallback((type: string, checked: boolean) => {
    setTypes(prev => checked ? [...prev, type] : prev.filter(t => t !== type));
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      content,
      types,
      targetType,
      specificIds: selectedTargets.map(t => t.id),
    };
    try {
      if (modalType === 'add') {
        await createNotification(formData).unwrap();
      } else if (modalType === 'edit' && notificationData) {
        await updateNotification({ ...formData, _id: (notificationData as Notification)._id }).unwrap();
      }
      handleCloseModal();
    } catch (error) {
      // Handle error (e.g., toast)
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification({ _id: id }).unwrap();
      } catch (error) {
        // Handle error
      }
    }
  }, [deleteNotification]);

  const handleOpenModal = useCallback((type: string, data?: Notification) => {
    dispatch(openNotificationModal({ modalType: type, data }));
  }, [dispatch]);

  const getDisplayTarget = useCallback((n: Notification): string => {
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    if (n.targetType.startsWith('all_')) {
      return `All ${cap(n.targetType.split('_')[1])}`;
    } else {
      const plural = n.targetType.split('_')[1];
      return `Specific ${cap(plural)} (${n.specificIds?.length || 0})`;
    }
  }, []);

  const { smsCount, emailCount, targetCounts, mostTargeted } = useMemo(() => {
    const smsCount = notifications.filter((n: Notification) => n.types.includes('SMS')).length;
    const emailCount = notifications.filter((n: Notification) => n.types.includes('Email')).length;

    const targetCounts = notifications.reduce((acc: Record<string, number>, n: Notification) => {
      const display = getDisplayTarget(n);
      acc[display] = (acc[display] || 0) + 1;
      return acc;
    }, {});

    const mostTargeted = Object.keys(targetCounts).reduce((a, b) => targetCounts[a] > targetCounts[b] ? a : b, '') || 'All Users';

    return { smsCount, emailCount, targetCounts, mostTargeted };
  }, [notifications, getDisplayTarget]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <Skeleton className="h-9 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto no-scrollbar rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(6)].map((_, i) => (
                      <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-headline">Push Notifications</h1>
        {(userRole === 'SUPER_ADMIN' || userRole === 'superadmin') && (
          <div className="flex items-center gap-2">
            <Label>Region:</Label>
            <Select value={selectedRegion || "all"} onValueChange={(val) => setSelectedRegion(val === "all" ? "" : val)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Global" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Global</SelectItem>
                {regions.map((region: any) => (
                  <SelectItem key={region._id} value={region._id}>{region.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">Across all channels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsCount}</div>
            <p className="text-xs text-muted-foreground">Total SMS notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailCount}</div>
            <p className="text-xs text-muted-foreground">Total email notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Targeted</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostTargeted}</div>
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
                {currentItems.map((notification: Notification) => (
                  <TableRow key={notification._id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>{notification.types.join(', ')}</TableCell>
                    <TableCell>{getDisplayTarget(notification)}</TableCell>
                    <TableCell>{new Date(notification.date).toLocaleDateString()}</TableCell>
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
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal('edit', notification)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal('add', notification)}>
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(notification._id)}>
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
            totalItems={notifications.length}
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
                {modalType === 'view' && notificationData
                  ? `Viewing notification: "${(notificationData as Notification).title}"`
                  : "Compose and send a new notification to your audience."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sms" checked={types.includes('SMS')} onCheckedChange={(checked: boolean) => handleTypeChange('SMS', checked)} disabled={modalType === 'view'} />
                    <Label htmlFor="sms">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email" checked={types.includes('Email')} onCheckedChange={(checked: boolean) => handleTypeChange('Email', checked)} disabled={modalType === 'view'} />
                    <Label htmlFor="email">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notification" checked={types.includes('Notification')} onCheckedChange={(checked: boolean) => handleTypeChange('Notification', checked)} disabled={modalType === 'view'} />
                    <Label htmlFor="notification">Notification</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="e.g., Special Weekend Offer" required disabled={modalType === 'view'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} placeholder="Enter notification content here..." required disabled={modalType === 'view'} />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <RadioGroup value={targetType} onValueChange={setTargetType} className="grid grid-cols-2 lg:grid-cols-3 gap-2" disabled={modalType === 'view'}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="all_users" id="all_users" /><Label htmlFor="all_users">All Users</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="all_vendors" id="all_vendors" /><Label htmlFor="all_vendors">All Vendors</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="all_staff" id="all_staff" /><Label htmlFor="all_staff">All Staff</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="all_admins" id="all_admins" /><Label htmlFor="all_admins">All Admins</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="specific_users" id="specific_users" /><Label htmlFor="specific_users">Specific Users</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="specific_vendors" id="specific_vendors" /><Label htmlFor="specific_vendors">Specific Vendors</Label></div>
                </RadioGroup>
              </div>

              {(targetType === 'specific_users' || targetType === 'specific_vendors') && (
                <div className="space-y-2">
                  <Label>Select {targetType === 'specific_users' ? 'Users' : 'Vendors'}</Label>
                  {modalType !== 'view' && (
                    <>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder={`Search for a ${targetType.split('_')[1].slice(0, -1)}...`} 
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      {searchQuery && (
                        <Card className="max-h-40 overflow-y-auto">
                          <CardContent className="p-2">
                            {filteredTargets.map((t: Target) => (
                              <div key={t.id} onClick={() => handleSelectTarget(t)} className="p-2 hover:bg-accent rounded-md cursor-pointer text-sm">
                                {t.name}
                              </div>
                            ))}
                            {filteredTargets.length === 0 && <p className="p-2 text-sm text-muted-foreground">No results found.</p>}
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTargets.map((t: Target) => (
                      <Badge key={t.id} variant="secondary">
                        {t.name}
                        {modalType !== 'view' && (
                          <button onClick={() => handleRemoveTarget(t.id)} className="ml-2 rounded-full hover:bg-muted-foreground/20">
                            <X className="h-3 w-3"/>
                          </button>
                        )}
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
