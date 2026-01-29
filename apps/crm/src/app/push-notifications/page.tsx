"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Skeleton } from "@repo/ui/skeleton";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { Checkbox } from "@repo/ui/checkbox";
import { Badge } from "@repo/ui/badge";
import { toast } from "sonner";
import {
  useGetVendorNotificationsQuery,
  useCreateVendorNotificationMutation,
  useDeleteVendorNotificationMutation,
} from "@repo/store/api";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { Notification, Client } from './types';

// Import new components
import NotificationStatsCards from './components/NotificationStatsCards';
import NotificationFiltersToolbar from './components/NotificationFiltersToolbar';
import NotificationTable from './components/NotificationTable';
import NotificationPaginationControls from './components/NotificationPaginationControls';

const mockClients: Client[] = [
  { id: "user_1", name: "Alice" },
  { id: "user_2", name: "Bob" },
  { id: "user_3", name: "Charlie" },
  { id: "user_4", name: "David" },
  { id: "user_5", name: "Eve" },
];

export default function PushNotificationsPage() {
  const { user } = useCrmAuth();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"add" | "view">("add");
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [channels, setChannels] = useState<string[]>(["Push"]);
  const [targetType, setTargetType] = useState<
    | "all_online_clients"
    | "all_offline_clients"
    | "all_staffs"
    | "specific_clients"
  >("all_online_clients");
  const [selectedTargets, setSelectedTargets] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading, error, refetch } = useGetVendorNotificationsQuery({
    vendorId: user?._id,
    page: currentPage,
    limit: itemsPerPage,
  }, { skip: !user?._id });

  const [createNotification, { isLoading: isCreating }] =
    useCreateVendorNotificationMutation();
  const [deleteNotification] = useDeleteVendorNotificationMutation();

  const notifications = data?.notifications || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const stats = data?.stats || {
    total: 0,
    pushSent: 0,
    smsSent: 0,
    mostTargeted: "All Online Clients",
  };

  // Filter notifications based on search term and status
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    return notifications.filter((notification: Notification) => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [notifications, searchTerm, statusFilter]);

  // Pagination logic
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredNotifications.slice(firstItemIndex, lastItemIndex);
  const totalFilteredItems = filteredNotifications.length;
  const totalFilteredPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const filteredTargets = useMemo(
    () =>
      mockClients.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedTargets.some((st) => st.id === t.id)
      ),
    [searchQuery, selectedTargets]
  );

  const handleSelectTarget = (target: Client) => {
    setSelectedTargets([...selectedTargets, target]);
    setSearchQuery("");
  };

  const handleRemoveTarget = (targetId: string) => {
    setSelectedTargets(selectedTargets.filter((t) => t.id !== targetId));
  };

  const handleOpenModal = (
    type: "add" | "view",
    notification: Notification | null = null
  ) => {
    setModalType(type);
    setSelectedNotification(notification);
    if (type === "add") {
      setTitle("");
      setContent("");
      setChannels(["Push"]);
      setTargetType("all_online_clients");
      setSelectedTargets([]);
      setSearchQuery("");
    } else if (type === "view" && notification) {
      setTitle(notification.title);
      setContent(notification.content);
      setChannels(notification.channels);
      setTargetType(notification.targetType);
      setSelectedTargets(notification.targets || []);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    if (checked) {
      setChannels([...channels, channel]);
    } else {
      setChannels(channels.filter((c) => c !== channel));
    }
  };

  const handleSubmit = async () => {
    if (modalType !== "add") return;
    if (!title || !content || channels.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    const notificationData = {
      title,
      content,
      channels,
      targetType,
      targets: targetType === "specific_clients" ? selectedTargets.map(t => ({ id: t.id, name: t.name })) : [],
    };
    try {
      await createNotification(notificationData).unwrap();
      toast.success("Notification sent successfully");
      handleCloseModal();
      refetch();
    } catch (err) {
      toast.error("Failed to send notification");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification({ notificationId }).unwrap();
      toast.success("Notification deleted successfully");
      setIsDeleteModalOpen(false);
      refetch();
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Skeleton className="h-10 w-80" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar rounded-md border">
                <div className="h-96 flex items-center justify-center">
                  <Skeleton className="h-10 w-64" />
                </div>
              </div>
              <div className="mt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4">Error loading notifications.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section matching marketplace design */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Push Notifications
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                View, create, and manage your push notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Notification Stats Cards */}
        <NotificationStatsCards stats={stats} />

        {/* Filters Toolbar */}
        <NotificationFiltersToolbar
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onAddNotification={() => handleOpenModal("add")}
          exportData={filteredNotifications}
        />

        {/* Notification Table */}
        <div className="flex-1 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              <NotificationTable
                currentItems={currentItems}
                searchTerm={searchTerm}
                onViewNotification={(notification) => handleOpenModal("view", notification)}
                onDeleteClick={(notification) => {
                  setSelectedNotification(notification);
                  setIsDeleteModalOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Pagination Controls */}
        <NotificationPaginationControls
          currentPage={currentPage}
          totalPages={totalFilteredPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalFilteredItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* ADD / VIEW MODAL */}
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {modalType === "add" ? "Create New Notification" : "View Notification"}
              </DialogTitle>
              <DialogDescription>
                {modalType === "view"
                  ? `Viewing notification: "${selectedNotification?.title}"`
                  : "Compose and send a new notification to your audience."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="push"
                      checked={channels.includes("Push")}
                      onCheckedChange={(checked: boolean) => handleChannelChange("Push", checked)}
                      disabled={modalType === "view"}
                    />
                    <Label htmlFor="push">Push Notification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={channels.includes("SMS")}
                      onCheckedChange={(checked: boolean) => handleChannelChange("SMS", checked)}
                      disabled={modalType === "view"}
                    />
                    <Label htmlFor="sms">SMS</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Special Weekend Offer"
                  required
                  disabled={modalType === "view"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter notification content here..."
                  required
                  disabled={modalType === "view"}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <RadioGroup
                  value={targetType}
                  onValueChange={(value) => setTargetType(value as any)}
                  className="grid grid-cols-2 md:grid-cols-4 gap-2"
                  disabled={modalType === "view"}
                >
                  <div className="flex items-center space-x-2"><RadioGroupItem value="all_online_clients" id="all_online_clients" /><Label htmlFor="all_online_clients">All Online</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="all_offline_clients" id="all_offline_clients" /><Label htmlFor="all_offline_clients">All Offline</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="specific_clients" id="specific_clients" /><Label htmlFor="specific_clients">Specific Clients</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="all_staffs" id="all_staffs" /><Label htmlFor="all_staffs">All Staffs</Label></div>
                </RadioGroup>
              </div>
              {targetType === "specific_clients" && (
                <div className="space-y-2">
                  <Label>Select Clients</Label>
                  {modalType === 'add' &&
                    <>
                      <div className="relative">
                        <Input
                          placeholder="Search clients..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                      {searchQuery && (
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                          {filteredTargets.map((target) => (
                            <div key={target.id} className="flex items-center justify-between py-1 hover:bg-muted p-1 rounded-sm cursor-pointer" onClick={() => handleSelectTarget(target)}>
                              <span>{target.name}</span>
                              <Plus className="h-4 w-4" />
                            </div>
                          ))}
                          {filteredTargets.length === 0 && <p className="text-center text-muted-foreground text-sm py-2">No results found.</p>}
                        </div>
                      )}
                    </>
                  }
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTargets.map((target) => (
                      <Badge
                        key={target.id}
                        variant="secondary"
                        className="flex items-center"
                      >
                        {target.name}
                        {modalType === 'add' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1 h-4 w-4"
                            onClick={() => handleRemoveTarget(target.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
              >
                {modalType === "view" ? "Close" : "Cancel"}
              </Button>
              {modalType === "add" && (
                <Button onClick={handleSubmit} disabled={isCreating}>
                  {isCreating ? "Sending..." : "Send Notification"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* DELETE MODAL */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Notification?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this notification? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedNotification) {
                    handleDelete(selectedNotification._id);
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}