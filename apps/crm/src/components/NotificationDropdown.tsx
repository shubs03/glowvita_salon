"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, ShoppingBag, Calendar, Info, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { cn } from "@repo/ui/cn";
import { useRouter } from "next/navigation";

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: 'appointment' | 'order' | 'subscription' | 'system' | 'test';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationDropdownProps {
  apiEndpoint: string;
}

export function NotificationDropdown({ apiEndpoint }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(apiEndpoint);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [apiEndpoint]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id);
    
    // Simple routing logic based on notification data
    if (notification.type === 'appointment' && notification.data?.appointmentId) {
       router.push(apiEndpoint.includes('api/admin') ? `/admin/appointments` : `/appointments`);
    } else if (notification.type === 'order' && notification.data?.orderId) {
       router.push(apiEndpoint.includes('api/admin') ? `/admin/orders` : `/orders`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-4 w-4 text-primary" />;
      case 'order': return <ShoppingBag className="h-4 w-4 text-secondary" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 rounded-lg relative hover:bg-primary/10 transition-all duration-300"
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 bg-destructive rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </span>
            )}
          </div>
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 bg-background/95 backdrop-blur-xl border border-border/30 shadow-2xl rounded-xl p-0 overflow-hidden">
        <DropdownMenuLabel className="p-4 border-b border-border/20">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Notifications</span>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/5 font-semibold"
                onClick={() => markAsRead()}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        
        <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/20 mb-3">
                <Bell className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs opacity-60">We'll alert you when something happens</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification._id} 
                className={cn(
                  "p-4 border-b border-border/10 cursor-pointer flex flex-col items-start gap-1 transition-all duration-200 outline-none",
                  !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={cn(
                    "p-2 rounded-lg mt-0.5",
                    notification.type === 'appointment' ? "bg-primary/10" : 
                    notification.type === 'order' ? "bg-secondary/10" : "bg-muted/30"
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                       <p className={cn("text-sm font-bold truncate", !notification.isRead ? "text-foreground" : "text-muted-foreground")}>
                        {notification.title}
                      </p>
                      {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium pt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-3 bg-muted/20 border-t border-border/10">
            <Button 
                variant="ghost" 
                className="w-full h-9 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 group"
                onClick={() => router.push(apiEndpoint.includes('api/admin') ? `/admin/notifications` : `/notifications`)}
            >
              <span>View History</span>
              <Bell className="ml-2 h-3 w-3 transition-transform group-hover:scale-110" />
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
