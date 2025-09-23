
"use client";

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { addDays, format, isSameDay } from 'date-fns';

export function Step3_TimeSlot() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <div className="w-full">
        <h2 className="text-2xl font-bold mb-6">Select a Date & Time</h2>
        
        {/* Date Scroller */}
        <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {dates.map(date => (
                <Button
                    key={date.toISOString()}
                    variant={isSameDay(date, selectedDate) ? 'default' : 'outline'}
                    className="flex flex-col h-auto px-4 py-2 flex-shrink-0"
                    onClick={() => setSelectedDate(date)}
                >
                    <span className="font-semibold">{format(date, 'EEE')}</span>
                    <span className="text-2xl font-bold">{format(date, 'd')}</span>
                    <span className="text-xs">{format(date, 'MMM')}</span>
                </Button>
            ))}
        </div>

        {/* Time Slots */}
        <div className="mt-6">
            <h3 className="font-semibold mb-4">Available Slots for {format(selectedDate, 'MMMM d')}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {timeSlots.map(time => (
                    <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        onClick={() => setSelectedTime(time)}
                    >
                        {time}
                    </Button>
                ))}
            </div>
        </div>
    </div>
  );
}
