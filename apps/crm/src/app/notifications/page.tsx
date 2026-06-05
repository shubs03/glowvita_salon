"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, ShoppingBag, Calendar, Info, CheckCircle2, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/cn";
import { useRouter } from "next/navigation";
import { useCrmAuth } from "@/hooks/useCrmAuth";

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: 'appointment' | 'order' | 'subscription' | 'system' | 'test' | 'offer' | 'referral_update' | 'welcome' | 're-engagement';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isCrmAuthenticated } = useCrmAuth();
  const apiEndpoint = '/api/notifications';

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(apiEndpoint);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  useEffect(() => {
    if (isCrmAuthenticated) {
      fetchNotifications();
    }
  }, [fetchNotifications, isCrmAuthenticated]);

  const markAsRead = async (id?: string) => {
    try {
      const res = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: id,
          markAll: !id
        })
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Custom routing based on notification type and CRM context
    if (notification.type === 'appointment' && notification.data?.appointmentId) {
       router.push(`/appointments`);
    } else if (notification.type === 'order' && notification.data?.orderId) {
       router.push(`/orders`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-5 w-5 text-primary" />;
      case 'order': return <ShoppingBag className="h-5 w-5 text-secondary" />;
      case 'offer':
      case 'offer_reminder': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'referral_update': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Bell className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
                    <p className="text-muted-foreground">Manage your alerts and staying updated with business activities.</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    onClick={() => markAsRead()}
                    disabled={notifications.every(n => n.isRead)}
                    className="hover:bg-primary/5 border-primary/20"
                >
                    Mark all as read
                </Button>
            </div>
        </header>

        <section className="space-y-4">
            {loading ? (
                [...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse border-border/50">
                        <CardContent className="h-20 bg-muted/30" />
                    </Card>
                ))
            ) : notifications.length === 0 ? (
                <Card className="border-dashed py-16 bg-muted/5">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="bg-muted p-6 rounded-full mb-4">
                            <Bell className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl font-bold">Inbox zero! 🎉</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                            You're all caught up. No new notifications at the moment.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                notifications.map((notification) => (
                    <Card 
                        key={notification._id} 
                        className={cn(
                            "group cursor-pointer transition-all duration-300 border border-border/50 hover:border-primary/30 hover:shadow-md",
                            !notification.isRead ? "bg-primary/5 border-l-4 border-l-primary" : "opacity-80"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-3 rounded-xl transition-colors",
                                    notification.type === 'appointment' ? "bg-primary/10 text-primary" : 
                                    notification.type === 'order' ? "bg-secondary/20 text-secondary" : 
                                    notification.type === 'offer' ? "bg-green-100 text-green-600" :
                                    "bg-muted text-muted-foreground"
                                )}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className={cn(
                                            "font-bold truncate text-base",
                                            !notification.isRead ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {notification.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-medium text-muted-foreground/70 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatFullDate(notification.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                                        {notification.body}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="relative flex h-3 w-3 mt-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </section>
    </div>
  );
}
