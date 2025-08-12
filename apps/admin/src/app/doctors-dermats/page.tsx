import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

export default function DoctorsDermatsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Doctors & Dermatologists</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Doctor Registrations</CardTitle>
                <CardDescription>Verify and approve new doctors.</CardDescription>
              </div>
              <Button>Register New Doctor</Button>
            </div>
          </CardHeader>
          <CardContent>
            <p>Table with new doctor registrations, affiliated vendors, and approval status will be here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrations via Agent</CardTitle>
            <CardDescription>Doctors registered by agents.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>List of doctors registered through agents will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
