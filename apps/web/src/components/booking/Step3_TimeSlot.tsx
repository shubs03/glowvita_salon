
"use client";

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { ChevronLeft, ChevronRight, Sun, Moon, Zap } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, isToday, isSameDay, startOfMonth } from 'date-fns';
import { cn } from '@repo/ui/cn';

const timeSlots = {
    morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
    afternoon: ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"],
    evening: ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"]
};

export function Step3_TimeSlot() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
  
  const daysInView = Array.from({ length: 35 }).map((_, i) => addDays(startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }), i));

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(subDays(currentMonth, 30));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 30));
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline mb-2">Select a Date & Time</h2>
        <p className="text-muted-foreground">Choose an available slot that works for you.</p>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="font-semibold text-center text-lg">
            {format(currentMonth, 'MMMM yyyy')}
        </div>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative mb-8">
        <div className="no-scrollbar flex space-x-2 overflow-x-auto pb-4 -mx-4 px-4">
            {daysInView.map(day => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isDisabled = day < new Date() && !isToday(day);

                return (
                    <Button
                        key={day.toString()}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => !isDisabled && handleDateChange(day)}
                        disabled={isDisabled}
                        className={cn(
                          "flex flex-col h-24 w-20 flex-shrink-0 rounded-xl transition-all duration-200 shadow-sm", 
                          isSelected && 'shadow-lg shadow-primary/20',
                          isCurrentMonth ? 'opacity-100' : 'opacity-40',
                          isDisabled ? 'cursor-not-allowed bg-secondary/50' : 'hover:-translate-y-1'
                        )}
                    >
                        <span className="text-xs">{format(day, 'E')}</span>
                        <span className="text-3xl font-bold">{format(day, 'd')}</span>
                    </Button>
                )
            })}
        </div>
        <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
        <div className="absolute left-0 top-0 bottom-2 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
      </div>
      
      <div className="max-h-[40vh] overflow-y-auto no-scrollbar pr-2 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center"><Sun className="mr-2 h-5 w-5 text-yellow-500"/>Morning</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {timeSlots.morning.map(time => {
              const isSelected = selectedTime === time;
              return (
                <Button
                  key={time}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className="h-12 text-base rounded-lg transition-all duration-200 hover:scale-105"
                >
                  {time}
                </Button>
              )
            })}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center"><Zap className="mr-2 h-5 w-5 text-blue-500"/>Afternoon</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {timeSlots.afternoon.map(time => {
              const isSelected = selectedTime === time;
              return (
                <Button
                  key={time}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className="h-12 text-base rounded-lg transition-all duration-200 hover:scale-105"
                >
                  {time}
                </Button>
              )
            })}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center"><Moon className="mr-2 h-5 w-5 text-indigo-500"/>Evening</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {timeSlots.evening.map(time => {
              const isSelected = selectedTime === time;
              return (
                <Button
                  key={time}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className="h-12 text-base rounded-lg transition-all duration-200 hover:scale-105"
                >
                  {time}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
