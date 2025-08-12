
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

export default function FaqManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">FAQ Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Create, edit, and manage FAQs for the platform.</CardDescription>
            </div>
            <Button>Add New FAQ</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder FAQ Item */}
            <div className="border p-4 rounded-lg">
              <h3 className="font-bold">What is Monorepo Maestro?</h3>
              <p className="text-muted-foreground">Monorepo Maestro is a powerful, scalable, and unified structure for your Next.js projects.</p>
              <div className="mt-2 space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </div>
             {/* Placeholder FAQ Item 2 */}
             <div className="border p-4 rounded-lg">
              <h3 className="font-bold">How do I get started?</h3>
              <p className="text-muted-foreground">Just click the "Get Started" button on the homepage to begin your journey!</p>
              <div className="mt-2 space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
