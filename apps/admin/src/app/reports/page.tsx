import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Reports</h1>
      <p className="text-muted-foreground mb-8">
        Generate and download detailed reports for various components of the platform.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Report</CardTitle>
            <CardDescription>Detailed report of all sales, bookings, and transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Includes profit, loss, and settlement data.</p>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity Report</CardTitle>
            <CardDescription>Report on user registrations, logins, and activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Track user engagement and growth.</p>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Performance Report</CardTitle>
            <CardDescription>Analytics on vendor bookings, ratings, and payouts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Evaluate and manage vendor performance.</p>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Demographics Report</CardTitle>
            <CardDescription>Insights into your customer base.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Understand your audience better.</p>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
