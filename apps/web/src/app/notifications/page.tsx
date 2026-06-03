"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, ShoppingBag, Calendar, Info, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/cn";
import { useRouter } from "next/navigation";
import MarketingHeader from "../../components/MarketingHeader";

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
    fetchNotifications();
  }, [fetchNotifications]);

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

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Custom routing based on notification type
    if (notification.type === 'appointment' && notification.data?.appointmentId) {
       router.push(`/profile/appointments`);
    } else if (notification.type === 'order' && notification.data?.orderId) {
       router.push(`/profile/orders`);
    } else if (notification.data?.offerId) {
        router.push(`/offers`); // Assuming this exists
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
    <div className="min-h-screen bg-slate-50/50">
      <MarketingHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 font-headline">Notification History</h1>
                <p className="text-slate-500">Stay updated with your latest alerts and activities.</p>
            </div>
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => markAsRead()}
                    disabled={notifications.every(n => n.isRead)}
                >
                    Mark all as read
                </Button>
            </div>
        </header>

        <section className="space-y-4">
            {loading ? (
                [...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="h-24 bg-slate-100" />
                    </Card>
                ))
            ) : notifications.length === 0 ? (
                <Card className="border-dashed py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <Bell className="h-12 w-12 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No Notifications</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">
                            When you have activity on your account, you'll see it here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                notifications.map((notification) => (
                    <Card 
                        key={notification._id} 
                        className={cn(
                            "group cursor-pointer transition-all duration-300 border-l-4",
                            !notification.isRead ? "border-l-primary bg-primary/5 shadow-sm" : "border-l-transparent hover:border-l-slate-200"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                    >
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-3 rounded-xl",
                                    notification.type === 'appointment' ? "bg-primary/10 text-primary" : 
                                    notification.type === 'order' ? "bg-secondary/10 text-secondary" : 
                                    notification.type === 'offer' ? "bg-green-100 text-green-600" :
                                    "bg-slate-100 text-slate-600"
                                )}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className={cn(
                                            "font-bold truncate",
                                            !notification.isRead ? "text-slate-900" : "text-slate-600"
                                        )}>
                                            {notification.title}
                                        </h3>
                                        <Badge variant="ghost" className="text-[10px] whitespace-nowrap bg-slate-100 text-slate-500">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatFullDate(notification.createdAt)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {notification.body}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="h-2 w-2 bg-primary rounded-full mt-2 shrink-0 shadow-glow shadow-primary/50" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </section>
      </main>
    </div>
  );
}
