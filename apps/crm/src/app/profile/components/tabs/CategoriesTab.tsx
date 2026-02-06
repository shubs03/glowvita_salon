import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/card";

export const CategoriesTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Service Categories</CardTitle>
      <CardDescription>
        Manage the categories for your services and products.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Category management UI would go here */}
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Category management functionality coming soon.</p>
      </div>
    </CardContent>
  </Card>
);