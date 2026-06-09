import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { toast } from 'sonner';
import { Switch } from "@repo/ui/switch";
import { Label } from "@repo/ui/label";
import { Separator } from "@repo/ui/separator";

interface NotificationsTabProps {
  profile: any;
  setProfile: any;
  updateMutation: any;
}

export const NotificationsTab = ({ profile, setProfile, updateMutation }: NotificationsTabProps) => {
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Default structure if missing
  const preferences = profile.notificationPreferences || {
    pushEnabled: true,
    smsEnabled: true,
    appointments: true,
    promotional: true,
  };

  const handleToggle = (key: string) => {
    setProfile({
      ...profile,
      notificationPreferences: {
        ...preferences,
        [key]: !preferences[key]
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result: any = await updateMutation({
        _id: profile._id,
        notificationPreferences: profile.notificationPreferences
      }).unwrap();

      if (result.success || result._id) {
        toast.success("Notification preferences updated!");
      } else {
        toast.error("Failed to update preferences.");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTestLoading(true);
    try {
      const response = await fetch('/api/crm/notifications/test', { method: 'POST' });
      if (response.ok) {
        toast.success("Test alert dispatched! Check your notifications.");
      } else {
        toast.error("Dispatcher failed. Is FCM service alive?");
      }
    } catch (error) {
      toast.error("Internal dispatcher error.");
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl font-headline">Notification Settings</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Configure how and when you receive alerts for your salon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm sm:text-base font-semibold">Push Notifications</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Receive instant alerts in your browser/app.</p>
            </div>
            <Switch 
              checked={preferences.pushEnabled} 
              onCheckedChange={() => handleToggle('pushEnabled')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm sm:text-base font-semibold">SMS Alerts</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Transactional SMS for critical appointments.</p>
            </div>
            <Switch 
              checked={preferences.smsEnabled} 
              onCheckedChange={() => handleToggle('smsEnabled')} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm sm:text-base font-semibold">Appointments</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Alerts for new, modified, or cancelled bookings.</p>
            </div>
            <Switch 
              checked={preferences.appointments} 
              onCheckedChange={() => handleToggle('appointments')} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm sm:text-base font-semibold">Marketing & Promo</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Stay updated with new features and offers.</p>
            </div>
            <Switch 
              checked={preferences.promotional} 
              onCheckedChange={() => handleToggle('promotional')} 
            />
          </div>
        </div>

        <Separator />

        <div className="rounded-lg bg-muted/30 p-4 space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Connection Check</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Verify that your device is correctly registered with GlowVita's cloud messaging stream. 
            Ensure your browser permissions for notifications are set to "Allow".
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestNotification} 
            disabled={isTestLoading}
            className="w-full sm:w-auto text-primary border-primary/20 hover:bg-primary/5"
          >
            {isTestLoading ? "Firing..." : "🚀 Fire Test Notification"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 border-t border-border/50 bg-muted/10">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-white font-bold h-10 sm:h-12 w-full sm:w-auto px-8"
        >
          {isSaving ? "Syncing..." : "Sync Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
};
