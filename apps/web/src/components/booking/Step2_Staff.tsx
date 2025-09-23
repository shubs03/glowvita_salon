
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@repo/ui/card';

const staffMembers = [
    { id: '1', name: 'Jessica Miller', role: 'Lead Stylist', image: 'https://picsum.photos/seed/staff1/200/200', hint: 'female stylist portrait' },
    { id: '2', name: 'Michael Chen', role: 'Massage Therapist', image: 'https://picsum.photos/seed/staff2/200/200', hint: 'male therapist portrait' },
    { id: '3', name: 'Emily White', role: 'Esthetician', image: 'https://picsum.photos/seed/staff3/200/200', hint: 'female esthetician portrait' },
];

export function Step2_Staff() {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  return (
    <div className="w-full">
        <h2 className="text-2xl font-bold mb-6">Select a Professional</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {staffMembers.map(staff => (
                <Card 
                    key={staff.id}
                    className={`p-4 text-center cursor-pointer transition-all ${selectedStaff === staff.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                    onClick={() => setSelectedStaff(staff.id)}
                >
                    <Image 
                        src={staff.image} 
                        alt={staff.name} 
                        width={100} 
                        height={100} 
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                        data-ai-hint={staff.hint}
                    />
                    <h3 className="font-semibold">{staff.name}</h3>
                    <p className="text-sm text-muted-foreground">{staff.role}</p>
                </Card>
            ))}
        </div>
    </div>
  );
}
