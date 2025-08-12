import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

export default function CustomerManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Customer Management</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Summary</CardTitle>
            <CardDescription>Overview of all customers.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for summary cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-bold">Total Customers</h3>
                <p className="text-2xl">1,250</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-bold">Online Payouts</h3>
                <p className="text-2xl">800</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-bold">Vendor Customers</h3>
                <p className="text-2xl">450</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Customers</CardTitle>
                <CardDescription>A list of all customers vendor-wise.</CardDescription>
              </div>
              <Button>Export List</Button>
            </div>
          </CardHeader>
          <CardContent>
            <p>Customer list table will be displayed here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salon List</CardTitle>
            <CardDescription>List of all affiliated salons.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Salon list table will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
