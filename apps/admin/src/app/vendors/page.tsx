import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

export default function VendorManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Vendor Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vendor List</CardTitle>
              <CardDescription>Details about all registered vendors.</CardDescription>
            </div>
            <Button>Add New Vendor</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Vendor Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Placeholder Row 1 */}
                <tr className="border-b">
                  <td className="p-2">Glamour Salon</td>
                  <td className="p-2">contact@glamoursalon.com</td>
                  <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Active</span></td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Disable</Button>
                  </td>
                </tr>
                {/* Placeholder Row 2 */}
                <tr className="border-b">
                  <td className="p-2">Modern Cuts</td>
                  <td className="p-2">info@moderncuts.com</td>
                  <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Active</span></td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Disable</Button>
                  </td>
                </tr>
                 {/* Placeholder Row 3 */}
                 <tr className="border-b">
                  <td className="p-2">Style Hub</td>
                  <td className="p-2">support@stylehub.com</td>
                  <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Disabled</span></td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Enable</Button>
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
