
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";

export default function EarningsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
          <CardDescription>
            A detailed record of all your earnings and payouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Earnings details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
