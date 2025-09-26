
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

export default function SettingsPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.emailAddress || '',
                phone: user.mobileNo || '',
                address: user.address || '',
            });
            setImagePreview(user.profilePicture || null);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would dispatch an action to update the user profile
        // including converting the imageFile to base64 or uploading it
        console.log("Updating profile with:", { ...formData, imageFile });
        toast.success("Profile updated successfully!");
    };
    
    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }
        console.log("Updating password...");
        toast.success("Password updated successfully!");
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your personal information and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Avatar className="w-24 h-24 text-4xl">
                                <AvatarImage src={imagePreview || undefined} alt={formData.name} />
                                <AvatarFallback>
                                    {formData.name.split(' ').map(n => n[0]).join('') || <User />}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                type="button"
                                size="icon"
                                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-primary text-primary-foreground group-hover:bg-primary/90"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-semibold">{formData.name}</h3>
                            <p className="text-muted-foreground">{formData.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                    </div>
                    <Button type="submit">Save Profile Changes</Button>
                </form>
                <Separator />
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <h3 className="font-semibold">Change Password</h3>
                    <div className="space-y-2 relative">
                        <Label>Current Password</Label>
                        <Input name="currentPassword" type={showCurrentPassword ? "text" : "password"} value={passwords.currentPassword} onChange={handlePasswordChange} />
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
                            <Label>New Password</Label>
                            <Input name="newPassword" type={showNewPassword ? "text" : "password"} value={passwords.newPassword} onChange={handlePasswordChange} />
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
                            <Label>Confirm New Password</Label>
                            <Input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={passwords.confirmPassword} onChange={handlePasswordChange} />
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
                    <Button type="submit">Update Password</Button>
                </form>
            </CardContent>
        </Card>
    );
}
