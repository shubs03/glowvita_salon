
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@repo/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Check, User } from 'lucide-react';
import { cn } from '@repo/ui/cn';

const staffMembers = [
  { name: "Any Professional", image: "" },
  { name: "Kamil", image: "https://picsum.photos/seed/kamil/80/80", hint: "male portrait" },
  { name: "Zul", image: "https://picsum.photos/seed/zul/80/80", hint: "male professional" },
  { name: "John", image: "https://picsum.photos/seed/john/80/80", hint: "smiling man" },
];

export function Step2_Staff() {
  const [selectedStaff, setSelectedStaff] = useState<string | null>("Any Professional");

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline mb-2">Select a Professional</h2>
        <p className="text-muted-foreground">Choose your preferred stylist or select any professional for the next available slot.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {staffMembers.map((staff) => {
            const isSelected = selectedStaff === staff.name;
            return (
                <Card 
                    key={staff.name} 
                    className={cn(
                      "cursor-pointer transition-all duration-300 text-center relative overflow-hidden group transform hover:-translate-y-1",
                      isSelected ? 'border-primary ring-2 ring-primary/20 shadow-xl bg-primary/5' : 'bg-background hover:border-primary/50 hover:shadow-lg'
                    )}
                    onClick={() => setSelectedStaff(staff.name)}
                >
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <Avatar className={cn(
                          "w-28 h-28 mb-4 border-4 transition-colors group-hover:border-primary/20",
                          isSelected ? 'border-primary' : 'border-border/20'
                        )}>
                            <AvatarImage src={staff.image} data-ai-hint={staff.hint} />
                            <AvatarFallback className="text-3xl bg-secondary">
                              {staff.name === "Any Professional" ? <User className="w-10 h-10"/> : staff.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg">{staff.name}</h3>
                        {isSelected && (
                            <div className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-primary rounded-full text-primary-foreground shadow-lg">
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
