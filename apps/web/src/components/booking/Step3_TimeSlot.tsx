
"use client";

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { cn } from '@repo/ui/cn';

const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM",
];

export function Step3_TimeSlot() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedTime(null);
  };
  
  const handlePrevWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };
  
  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-2">Select a Date & Time</h2>
      <p className="text-muted-foreground mb-6">Choose an available slot that works for you.</p>
      
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="font-semibold text-center text-lg">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </div>
        <Button variant="ghost" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative no-scrollbar overflow-x-auto pb-4 mb-6">
        <div className="flex space-x-2">
            {weekDays.map(day => {
                const isSelected = isSameDay(day, currentDate);
                const isTodayDate = isToday(day);
                return (
                    <Button
                        key={day.toString()}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => handleDateChange(day)}
                        className={cn(
                          "flex flex-col h-20 w-20 flex-shrink-0 rounded-lg transition-all duration-200", 
                          isTodayDate && !isSelected ? 'border-primary' : ''
                        )}
                    >
                        <span className="text-xs">{format(day, 'E')}</span>
                        <span className="text-2xl font-bold">{format(day, 'd')}</span>
                    </Button>
                )
            })}
        </div>
        <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
        <div className="absolute left-0 top-0 bottom-2 w-10 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
      </div>
      
      <div className="max-h-80 overflow-y-auto no-scrollbar pr-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {timeSlots.map(time => {
            const isSelected = selectedTime === time;
            return (
              <Button
                key={time}
                variant={isSelected ? "default" : "outline"}
                onClick={() => setSelectedTime(time)}
                className="h-12 text-base"
              >
                {time}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  );
}
