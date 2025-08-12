'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

export default function CrmPage() {
  const router = useRouter();
  const handleLogout = async () => {
    // This assumes the API endpoint is available on this domain
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold font-headline">Vendor CRM</h1>
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Vendor!</CardTitle>
            <CardDescription>Manage your products and orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main dashboard for vendors. More features coming soon!</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
