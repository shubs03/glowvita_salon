
"use client";

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';

const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export function Step3_TimeSlot() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handlePrevWeek = () => {
    setSelectedDate(subDays(selectedDate, 7));
  };
  
  const handleNextWeek = () => {
    setSelectedDate(addDays(selectedDate, 7));
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-6">Select a Time</h2>
      
      {/* Week Navigator */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="font-medium text-center">
            {format(weekStart, 'MMM d')} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
        </div>
        <Button variant="ghost" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day Selector */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map(day => (
          <Button
            key={day.toString()}
            variant={format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? 'default' : 'outline'}
            onClick={() => handleDateChange(day)}
            className="flex flex-col h-auto p-2"
          >
            <span className="text-xs">{format(day, 'E')}</span>
            <span className="text-lg font-bold">{format(day, 'd')}</span>
          </Button>
        ))}
      </div>

      {/* Time Slots */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {timeSlots.map(time => {
          const isSelected = selectedTime === time;
          return (
            <Button
              key={time}
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </Button>
          )
        })}
      </div>
    </div>
  );
}
