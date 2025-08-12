
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

export default function OffersCouponsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Offers & Coupons Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Active Coupons</CardTitle>
              <CardDescription>Manage and create new promotional coupons.</CardDescription>
            </div>
            <Button>Create New Coupon</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Coupon Code</th>
                  <th className="p-2 text-left">Discount</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Expires On</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">SUMMER24</td>
                  <td className="p-2">20% Off</td>
                  <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Active</span></td>
                  <td className="p-2">2024-08-31</td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Deactivate</Button>
                  </td>
                </tr>
                 <tr className="border-b">
                  <td className="p-2">NEWUSER10</td>
                  <td className="p-2">$10 Off</td>
                  <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Active</span></td>
                  <td className="p-2">N/A</td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Deactivate</Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">EXPIRED01</td>
                  <td className="p-2">15% Off</td>
                  <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Expired</span></td>
                  <td className="p-2">2023-12-31</td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
