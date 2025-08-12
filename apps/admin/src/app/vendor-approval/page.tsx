import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

export default function VendorApprovalPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Vendor Verification & Approval</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Vendors waiting for verification to join the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Vendor Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Date Submitted</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Placeholder Row */}
                <tr className="border-b">
                  <td className="p-2">New Beauty Haven</td>
                  <td className="p-2">contact@newbeauty.com</td>
                  <td className="p-2">2023-10-27</td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">View Details</Button>
                    <Button size="sm" className="ml-2">Approve</Button>
                    <Button variant="destructive" size="sm" className="ml-2">Reject</Button>
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
