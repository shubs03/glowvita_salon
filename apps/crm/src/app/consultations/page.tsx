
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";

export default function ConsultationsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Consultations</CardTitle>
          <CardDescription>
            View and manage your upcoming and past consultations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Consultation management features will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
