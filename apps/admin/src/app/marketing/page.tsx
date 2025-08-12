import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

export default function PlatformMarketingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Platform Marketing</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SMS Marketing</CardTitle>
            <CardDescription>Manage SMS packages and templates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">Manage SMS Templates</Button>
            <Button variant="outline" className="w-full">View SMS Packages</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Create and manage social media posts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Create New Post</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Digital Marketing Campaigns</CardTitle>
            <CardDescription>Overview of ongoing digital marketing efforts.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>A dashboard for digital marketing analytics will be here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
