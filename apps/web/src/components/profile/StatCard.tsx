
"use client";

import Image from "next/image";
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
        <div className="p-2 rounded-full transition-all duration-300 group-hover:scale-110 flex items-center justify-center border border-[#c8dff7]" style={{ backgroundColor: '#EBF3FD' }}>
          {imageSrc ? (
            <Image src={imageSrc} alt={title} width={32} height={32} className="object-contain" />
          ) : Icon ? (
            <Icon className="h-5 w-5 text-primary" />
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
