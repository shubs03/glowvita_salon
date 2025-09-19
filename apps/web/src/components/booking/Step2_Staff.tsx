
"use client";

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Check } from 'lucide-react';

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
      <h2 className="text-xl font-semibold mb-6">Select a Professional</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {staffMembers.map((staff) => {
            const isSelected = selectedStaff === staff.name;
            return (
                <Card 
                    key={staff.name} 
                    className={`cursor-pointer transition-all text-center ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-gray-300'}`}
                    onClick={() => setSelectedStaff(staff.name)}
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Avatar className="w-20 h-20 mb-3 border-2 border-transparent group-hover:border-primary transition-colors">
                            <AvatarImage src={staff.image} />
                            <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium">{staff.name}</h3>
                        {isSelected && <Check className="h-5 w-5 text-primary mt-2" />}
                    </CardContent>
                </Card>
            );
        })}
      </div>
    </div>
  );
}
