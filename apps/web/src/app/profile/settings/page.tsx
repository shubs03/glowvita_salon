
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Separator } from '@repo/ui/separator';

const userProfile = {
  name: "Sophia Davis",
  email: "sophia.davis@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Beauty Lane, Glamour City, 54321",
};

export default function SettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your personal information and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input defaultValue={userProfile.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input defaultValue={userProfile.email} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input defaultValue={userProfile.phone} />
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input defaultValue={userProfile.address} />
                    </div>
                    <Button>Save Changes</Button>
                </form>
                <Separator />
                <form className="space-y-4">
                    <h3 className="font-semibold">Change Password</h3>
                    <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input type="password" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input type="password" />
                        </div>
                    </div>
                    <Button>Update Password</Button>
                </form>
            </CardContent>
        </Card>
    );
}
