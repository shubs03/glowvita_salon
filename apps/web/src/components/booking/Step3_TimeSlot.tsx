
"use client";

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Label } from '@repo/ui/label';
import { addDays, format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Users, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { cn } from '@repo/ui/cn';

const staffMembers = [
    { id: '1', name: 'Any Professional' },
    { id: '2', name: 'Jessica Miller' },
    { id: '3', name: 'Michael Chen' },
    { id: '4', name: 'Emily White' },
];

export function Step3_TimeSlot() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('1');

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "16:00", "16:30", "17:00"];

  const handleDateScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('date-scroller');
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Calendar className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold font-headline">Select a Date & Time</h2>
            </div>
            <p className="text-muted-foreground">Choose a date and time slot that works for you.</p>
        </div>

        {/* Staff Selector */}
        <div className="mb-6 max-w-sm">
            <Label htmlFor="staff-select" className="text-sm font-medium">Professional</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger id="staff-select" className="mt-1">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {staffMembers.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
        {/* Date Scroller with Navigation */}
        <div className="flex items-center gap-2 mb-6">
            <div id="date-scroller" className="flex-1 flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                {dates.map(date => (
                    <Button
                        key={date.toISOString()}
                        variant={isSameDay(date, selectedDate) ? 'default' : 'outline'}
                        className="flex flex-col h-auto px-4 py-3 flex-shrink-0 rounded-xl shadow-sm"
                        onClick={() => setSelectedDate(date)}
                    >
                        <span className="font-semibold">{format(date, 'EEE')}</span>
                        <span className="text-2xl font-bold my-1">{format(date, 'd')}</span>
                        <span className="text-xs">{format(date, 'MMM')}</span>
                    </Button>
                ))}
            </div>
            <div className="flex flex-col gap-1">
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDateScroll('left')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDateScroll('right')}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>

        {/* Time Slots */}
        <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">Available Slots for {format(selectedDate, 'MMMM d')}</h3>
            </div>
            <div className="max-h-64 overflow-y-auto pr-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {timeSlots.map(time => (
                        <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            className="h-12 text-base font-semibold rounded-lg shadow-sm"
                            onClick={() => setSelectedTime(time)}
                        >
                            {time}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
