import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/card";

interface ProfileCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const ProfileCard = ({ title, description, children }: ProfileCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};