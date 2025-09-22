
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@repo/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Check, User } from 'lucide-react';
import { cn } from '@repo/ui/cn';

const staffMembers = [
  { name: "Any Professional", image: "" },
  { name: "Kamil", image: "https://picsum.photos/seed/kamil/80/80" },
  { name: "Zul", image: "https://picsum.photos/seed/zul/80/80" },
  { name: "John", image: "https://picsum.photos/seed/john/80/80" },
];

export function Step2_Staff() {
  const [selectedStaff, setSelectedStaff] = useState<string | null>("Any Professional");

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-2">Select a Professional</h2>
      <p className="text-muted-foreground mb-6">Choose your preferred stylist or select any professional.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {staffMembers.map((staff) => {
            const isSelected = selectedStaff === staff.name;
            return (
                <Card 
                    key={staff.name} 
                    className={cn(
                      "cursor-pointer transition-all duration-300 text-center relative overflow-hidden group",
                      isSelected ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'hover:border-primary/50 hover:shadow-md'
                    )}
                    onClick={() => setSelectedStaff(staff.name)}
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Avatar className="w-24 h-24 mb-3 border-4 transition-colors group-hover:border-primary/20",
                          cn(isSelected ? 'border-primary' : 'border-transparent')
                        >
                            <AvatarImage src={staff.image} />
                            <AvatarFallback className="text-3xl bg-secondary">
                              {staff.name === "Any Professional" ? <User /> : staff.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">{staff.name}</h3>
                        {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-primary rounded-full text-primary-foreground">
                                <Check className="h-4 w-4" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            );
        })}
      </div>
    </div>
  );
}
