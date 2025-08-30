
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";

export default function DoctorStaffPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
          <CardDescription>
            Manage your assistant and other staff members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Staff management tools for doctors will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
