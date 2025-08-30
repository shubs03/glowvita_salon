
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";

export default function DoctorReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Reports</CardTitle>
          <CardDescription>
            View and generate reports related to your activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Reporting features for doctors will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
