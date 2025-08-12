import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";

export default function TaxAndFeesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Tax and Platform Fees Management</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Structure</CardTitle>
            <CardDescription>Current platform fees and tax rates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-bold">Platform Fee</h3>
                <p className="text-2xl">15%</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-bold">GST</h3>
                <p className="text-2xl">18%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction-wise Details</CardTitle>
            <CardDescription>Detailed breakdown of taxes and fees for each transaction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>A detailed table of transactions with tax and fee information will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
