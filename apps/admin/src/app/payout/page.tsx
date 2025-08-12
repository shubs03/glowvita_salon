
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

export default function PayoutPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Payout Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payout Transactions</CardTitle>
              <CardDescription>
                Details of all transactions for vendor payouts, taxes, and fees.
              </CardDescription>
            </div>
            <Button>Export Report</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Transaction ID</th>
                  <th className="p-2 text-left">Vendor</th>
                  <th className="p-2 text-left">Booking Amount</th>
                  <th className="p-2 text-left">Platform Fee</th>
                  <th className="p-2 text-left">Tax (GST)</th>
                  <th className="p-2 text-left">Net Payout</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">TXN7483982</td>
                  <td className="p-2">Glamour Salon</td>
                  <td className="p-2">$100.00</td>
                  <td className="p-2">$15.00</td>
                  <td className="p-2">$18.00</td>
                  <td className="p-2 font-bold">$67.00</td>
                  <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Paid</span></td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">TXN7483981</td>
                  <td className="p-2">Modern Cuts</td>
                  <td className="p-2">$50.00</td>
                  <td className="p-2">$7.50</td>
                  <td className="p-2">$9.00</td>
                  <td className="p-2 font-bold">$33.50</td>
                  <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Pending</span></td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button size="sm" className="ml-2">Mark as Paid</Button>
                  </td>
                </tr>
                 <tr className="border-b">
                  <td className="p-2 font-mono text-xs">TXN7483980</td>
                  <td className="p-2">Glamour Salon</td>
                  <td className="p-2">$250.00</td>
                  <td className="p-2">$37.50</td>
                  <td className="p-2">$45.00</td>
                  <td className="p-2 font-bold">$167.50</td>
                  <td className="p-2"><span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Failed</span></td>
                  <td className="p-2 text-right">
                     <Button variant="ghost" size="sm">View</Button>
                    <Button variant="outline" size="sm" className="ml-2">Retry</Button>
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
