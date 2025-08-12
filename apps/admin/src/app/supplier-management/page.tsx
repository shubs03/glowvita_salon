
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

export default function SupplierManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Supplier Management</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Suppliers</CardTitle>
                <CardDescription>Manage suppliers and their product listings.</CardDescription>
              </div>
              <Button>Add New Supplier</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Supplier Name</th>
                    <th className="p-2 text-left">Products</th>
                    <th className="p-2 text-left">Total Sales</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Global Beauty Supplies</td>
                    <td className="p-2">125</td>
                    <td className="p-2">$25,430</td>
                    <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Approved</span></td>
                    <td className="p-2 text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </td>
                  </tr>
                   <tr className="border-b">
                    <td className="p-2">Organic Skincare Inc.</td>
                    <td className="p-2">45</td>
                    <td className="p-2">$12,810</td>
                    <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Pending</span></td>
                    <td className="p-2 text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
