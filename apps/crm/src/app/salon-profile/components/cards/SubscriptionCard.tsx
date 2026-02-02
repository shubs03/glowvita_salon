import React from "react";
import { Card, CardContent } from "@repo/ui/card";

interface SubscriptionCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const SubscriptionCard = ({ title, value, description, icon, color }: SubscriptionCardProps) => {
  return (
    <Card className={`group relative overflow-hidden ${color} transition-all duration-300`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary mb-1">{title}</p>
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-xs text-primary/70 mt-1">{description}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full transition-colors">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};