
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";

export default function DoctorReferralsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
          <CardDescription>
            Manage and track your referrals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Doctor-specific referral information will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
