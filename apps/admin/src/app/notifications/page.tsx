"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Shield, Calendar, Info, CheckCircle2, AlertTriangle, Clock, Settings } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/cn";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: 'appointment' | 'order' | 'subscription' | 'system' | 'test' | 'offer' | 'referral_update' | 'welcome' | 're-engagement';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { admin } = useAuth();
  const apiEndpoint = '/api/admin/notifications';

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(apiEndpoint);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  useEffect(() => {
    if (admin) {
      fetchNotifications();
    }
  }, [fetchNotifications, admin]);

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
    
    // Admin routing
    if (notification.type === 'appointment') {
       router.push(`/appointments`);
    } else if (notification.type === 'order') {
       router.push(`/orders`);
    } else if (notification.type === 'subscription') {
       router.push(`/subscription-management`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-5 w-5 text-primary" />;
      case 'subscription': return <Shield className="h-5 w-5 text-indigo-500" />;
      case 'offer': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'referral_update': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-2xl shadow-inner">
                    <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin System Logs</h1>
                    <p className="text-slate-500 dark:text-slate-400">Critical system notifications and operational alerts.</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    onClick={() => markAsRead()}
                    disabled={notifications.every(n => n.isRead)}
                    className="h-11 px-6 font-semibold"
                >
                    Mark All as Seen
                </Button>
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl" title="Settings">
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
        </header>

        <section className="space-y-4">
            {loading ? (
                [...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse border-slate-100 dark:border-slate-800">
                        <CardContent className="h-24 bg-slate-50 dark:bg-slate-900/50" />
                    </Card>
                ))
            ) : notifications.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 py-20 bg-slate-50/50 dark:bg-slate-900/20">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="bg-slate-200 dark:bg-slate-800 p-6 rounded-full mb-6">
                            <Bell className="h-16 w-16 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">System Quiet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                            Excellent! There are no pending alerts in the system history.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                notifications.map((notification) => (
                    <Card 
                        key={notification._id} 
                        className={cn(
                            "group transition-all duration-300 border hover:shadow-xl hover:-translate-y-1",
                            !notification.isRead 
                                ? "bg-white dark:bg-slate-900 border-primary/20 shadow-primary/5 shadow-lg" 
                                : "bg-slate-50/50 dark:bg-slate-900/30 border-transparent opacity-90"
                        )}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-5">
                                <div className={cn(
                                    "p-4 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110",
                                    notification.type === 'appointment' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : 
                                    notification.type === 'subscription' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" : 
                                    notification.type === 'offer' ? "bg-green-100 text-green-600 dark:bg-green-900/30" :
                                    "bg-slate-200 text-slate-600 dark:bg-slate-800"
                                )}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className={cn(
                                                "font-bold text-lg",
                                                !notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                                            )}>
                                                {notification.title}
                                            </h3>
                                            {!notification.isRead && (
                                                <Badge className="bg-primary text-[10px] uppercase tracking-wider font-heavy">New</Badge>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                            <Clock className="h-3 w-3 mr-1.5" />
                                            {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                                        {notification.body}
                                    </p>
                                    <div className="mt-4 flex gap-3">
                                        <Button variant="secondary" size="sm" className="h-8 text-xs font-bold px-4" onClick={() => handleNotificationClick(notification)}>
                                            View Source
                                        </Button>
                                        {!notification.isRead && (
                                            <Button variant="ghost" size="sm" className="h-8 text-xs font-bold hover:bg-primary/5" onClick={() => markAsRead(notification._id)}>
                                                Dismiss
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </section>
    </div>
  );
}
