
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";

export default function TimetablePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Timetable / Working Hours</CardTitle>
          <CardDescription>
            Set and manage your availability and working hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your weekly timetable and scheduling tools will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
