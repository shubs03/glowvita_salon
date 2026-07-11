
"use client";

import { Card, CardContent } from '@repo/ui/card';

interface StatCardProps {
  icon?: React.ElementType;
  imageSrc?: string;
  title: string;
  value: string | number;
  change: string;
}

export const StatCard = ({ icon: Icon, imageSrc, title, value, change }: StatCardProps) => (
  <Card className="hover:shadow-lg transition-shadow duration-300 bg-white/50 backdrop-blur-md border rounded-xl overflow-hidden group">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-full transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: '#EBF3FD' }}>
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt={title} className="h-6 w-6 object-contain" />
          ) : Icon ? (
            <Icon className="h-5 w-5" />
          ) : null}
        </div>
        <p className="text-sm font-semibold text-blue-600">{change}</p>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </CardContent>
  </Card>
);
