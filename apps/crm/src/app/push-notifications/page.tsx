
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Plus, Eye, Trash2, Send, MessageSquare, Users, User, Search, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { Checkbox } from '@repo/ui/checkbox';
import { Badge } from '@repo/ui/badge';

const notificationsData = [
  { id: 'NOTIF-001', title: 'Summer Sale!', type: 'SMS, Push', target: 'All Clients', date: '2024-08-15', status: 'Sent' },
  { id: 'NOTIF-002', title: 'New Service Alert', type: 'Push', target: 'Specific Clients (15)', date: '2024-08-14', status: 'Sent' },
  { id: 'NOTIF-003', title: 'Holiday Hours', type: 'SMS', target: 'All Clients', date: '2024-08-13', status: 'Scheduled' },
];

const mockClients = [
    { id: 'user_1', name: 'Alice' },
    { id: 'user_2', name: 'Bob' },
    { id: 'user_3', name: 'Charlie' },
    { id: 'user_4', name: 'David' },
    { id: 'user_5', name: 'Eve' },
];

export default function PushNotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'view'>('add');
  const [selectedNotification, setSelectedNotification] = useState<typeof notificationsData[0] | null>(null);

  // Form states
  const [targetType, setTargetType] = useState('all_clients');
  const [selectedTargets, setSelectedTargets] = useState<{id: string, name: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = notificationsData.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(notificationsData.length / itemsPerPage);

  const filteredTargets = mockClients.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTargets.some(st => st.id === t.id)
  );

  const handleSelectTarget = (target: {id: string, name: string}) => {
    setSelectedTargets([...selectedTargets, target]);
    setSearchQuery('');
  };

  const handleRemoveTarget = (targetId: string) => {
    setSelectedTargets(selectedTargets.filter(t => t.id !== targetId));
  };
  
  const handleOpenModal = (type: 'add' | 'view', data?: typeof notificationsData[0]) => {
    setModalType(type);
    setSelectedNotification(data || null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
    setTargetType('all_clients');
    setSelectedTargets([]);
    setSearchQuery('');
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
            <CardTitle className="text-sm font-medium">Push Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationsData.filter(n => n.type.includes('Push')).length}</div>
            <p className="text-xs text-muted-foreground">Total push notifications</p>
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
            <CardTitle className="text-sm font-medium">Most Targeted</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">All Clients</div>
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
          <form onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }}>
            <DialogHeader>
              <DialogTitle>
                {modalType === 'add' && 'Create New Notification'}
                {modalType === 'view' && 'View Notification'}
              </DialogTitle>
              <DialogDescription>
                {modalType === 'view' 
                  ? `Viewing notification: "${selectedNotification?.title}"`
                  : "Compose and send a new notification to your audience."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label>Channels</Label>
                    <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="push" defaultChecked={modalType === 'view' ? selectedNotification?.type.includes('Push') : true} disabled={modalType === 'view'}/>
                            <Label htmlFor="push">Push Notification</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="sms" defaultChecked={modalType === 'view' && selectedNotification?.type.includes('SMS')} disabled={modalType === 'view'}/>
                            <Label htmlFor="sms">SMS</Label>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="e.g., Special Weekend Offer" required disabled={modalType === 'view'} defaultValue={selectedNotification?.title || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" name="content" placeholder="Enter notification content here..." required disabled={modalType === 'view'} defaultValue={"A premium haircut experience with wash, cut, and style."} />
                </div>
                <div className="space-y-2">
                    <Label>Target Audience</Label>
                     <RadioGroup value={targetType} onValueChange={setTargetType} className="flex gap-4" disabled={modalType === 'view'}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="all_clients" id="all_clients" /><Label htmlFor="all_clients">All Clients</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="all_staffs" id="all_staffs" /><Label htmlFor="all_staffs">All Staffs</Label></div>
                    </RadioGroup>
                </div>
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
