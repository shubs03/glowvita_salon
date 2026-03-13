"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Separator } from '@repo/ui/separator';
import { Eye, EyeOff, Camera, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@repo/ui/avatar';
import { toast } from 'sonner';
import { Switch } from '@repo/ui/switch';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        state: '',
        city: '',
        pincode: '',
        notificationPreferences: {
            pushEnabled: true,
            smsEnabled: true,
            appointments: true,
            promotional: true,
        }
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.emailAddress || '',
                phone: user.mobileNo || '',
                state: user.state || '',
                city: user.city || '',
                pincode: user.pincode || '',
                notificationPreferences: user.notificationPreferences || {
                    pushEnabled: true,
                    smsEnabled: true,
                    appointments: true,
                    promotional: true,
                }
            });
        }
    }, [user]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handlePreferenceToggle = (key: string) => {
        setFormData(prev => ({
            ...prev,
            notificationPreferences: {
                ...prev.notificationPreferences,
                [key]: !prev.notificationPreferences[key as keyof typeof prev.notificationPreferences]
            }
        }));
    };
    
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    mobileNo: formData.phone,
                    state: formData.state,
                    city: formData.city,
                    pincode: formData.pincode,
                    notificationPreferences: formData.notificationPreferences,
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Update the user in context with the full user data from the response
                if (data.user) {
                    updateUser(data.user);
                }
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("An error occurred while updating profile");
        } finally {
            setIsProfileLoading(false);
        }
    };
    
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }
        
        setIsPasswordLoading(true);
        
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                    confirmPassword: passwords.confirmPassword,
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                toast.success("Password updated successfully!");
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.message || "Failed to update password");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error("An error occurred while updating password");
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const [isTestLoading, setIsTestLoading] = useState(false);
    const handleTestNotification = async () => {
        setIsTestLoading(true);
        try {
            const response = await fetch('/api/client/notifications/test', { method: 'POST' });
            if (response.ok) {
                toast.success("Test notification sent! Check your device.");
            } else {
                toast.error("Failed to send test notification. Check console.");
            }
        } catch (error) {
            toast.error("Error sending test notification.");
        } finally {
            setIsTestLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your personal information and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input 
                                id="firstName" 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input 
                                id="lastName" 
                                name="lastName" 
                                value={formData.lastName} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            disabled 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                            id="phone" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input 
                                id="state" 
                                name="state" 
                                value={formData.state} 
                                onChange={handleInputChange} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input 
                                id="city" 
                                name="city" 
                                value={formData.city} 
                                onChange={handleInputChange} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input 
                                id="pincode" 
                                name="pincode" 
                                value={formData.pincode} 
                                onChange={handleInputChange} 
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={isProfileLoading}>
                        {isProfileLoading ? "Saving..." : "Save Profile Changes"}
                    </Button>
                </form>
                <Separator />
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <h3 className="font-semibold">Change Password</h3>
                    <div className="space-y-2 relative">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                            id="currentPassword"
                            name="currentPassword" 
                            type={showCurrentPassword ? "text" : "password"} 
                            value={passwords.currentPassword} 
                            onChange={handlePasswordChange} 
                            required 
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-7 h-7 w-7"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 relative">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input 
                                id="newPassword"
                                name="newPassword" 
                                type={showNewPassword ? "text" : "password"} 
                                value={passwords.newPassword} 
                                onChange={handlePasswordChange} 
                                required 
                            />
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-7 h-7 w-7"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="space-y-2 relative">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input 
                                id="confirmPassword"
                                name="confirmPassword" 
                                type={showConfirmPassword ? "text" : "password"} 
                                value={passwords.confirmPassword} 
                                onChange={handlePasswordChange} 
                                required 
                            />
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-7 h-7 w-7"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <Button type="submit" disabled={isPasswordLoading}>
                        {isPasswordLoading ? "Updating..." : "Update Password"}
                    </Button>
                </form>
                <Separator />
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Notification Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure how you receive updates and reminders.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Push Notifications</Label>
                                <p className="text-xs text-muted-foreground">Receive alerts in your browser.</p>
                            </div>
                            <Switch 
                                checked={formData.notificationPreferences.pushEnabled} 
                                onCheckedChange={() => handlePreferenceToggle('pushEnabled')} 
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">SMS Alerts</Label>
                                <p className="text-xs text-muted-foreground">Critical updates via SMS.</p>
                            </div>
                            <Switch 
                                checked={formData.notificationPreferences.smsEnabled} 
                                onCheckedChange={() => handlePreferenceToggle('smsEnabled')} 
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Appointments</Label>
                                <p className="text-xs text-muted-foreground">Reminders and status changes.</p>
                            </div>
                            <Switch 
                                checked={formData.notificationPreferences.appointments} 
                                onCheckedChange={() => handlePreferenceToggle('appointments')} 
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Promotional</Label>
                                <p className="text-xs text-muted-foreground">Offers and new features.</p>
                            </div>
                            <Switch 
                                checked={formData.notificationPreferences.promotional} 
                                onCheckedChange={() => handlePreferenceToggle('promotional')} 
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleTestNotification} 
                            disabled={isTestLoading}
                        >
                            {isTestLoading ? "Firing..." : "🚀 Fire Test Notification"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}