
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  change: string;
}

export const StatCard = ({ icon: Icon, title, value, change }: StatCardProps) => (
  <Card className="hover:shadow-lg transition-shadow duration-300 bg-white/50 backdrop-blur-md border rounded-xl overflow-hidden group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-green-600">{change}</p>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </CardContent>
  </Card>
);
