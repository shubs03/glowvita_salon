
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";

export default function ReferralManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Referral Management</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Customer to Customer (C2C)</CardTitle>
            <CardDescription>Referrals between customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-muted-foreground">Total C2C Referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer to Vendor (C2V)</CardTitle>
            <CardDescription>Customers referring new vendors.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">56</p>
            <p className="text-sm text-muted-foreground">Total C2V Referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor to Vendor (V2V)</CardTitle>
            <CardDescription>Vendors referring other vendors.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">89</p>
            <p className="text-sm text-muted-foreground">Total V2V Referrals</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Referral Activity</CardTitle>
            <CardDescription>A log of the latest referral activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>A detailed table of referral data will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
