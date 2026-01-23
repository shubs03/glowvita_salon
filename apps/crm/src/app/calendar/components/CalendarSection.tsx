"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import { isSameDay } from 'date-fns';

interface CalendarSectionProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  appointments: any[];
  selectedStaff: string;
  isLoadingAppointments: boolean;
  handleDayClick: (day: number) => void;
  today: Date;
  selectedDate: Date;
}

export default function CalendarSection({
  currentDate,
  setCurrentDate,
  appointments,
  selectedStaff,
  isLoadingAppointments,
  handleDayClick,
  today,
  selectedDate
}: CalendarSectionProps) {
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay();
  }, [currentDate]);

  const renderCalendar = () => {
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={`day-${index}`} className="text-center font-medium p-2 bg-muted text-xs h-20 flex items-center justify-center">
            {day}
          </div>
        ))}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-20 border-r border-b bg-muted/30"></div>
        ))}
        {days.map((day) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = isSameDay(today, date);
          const isSelected = isSameDay(selectedDate, date);
          const appointmentsForDay = appointments.filter(
            (a) =>
              isSameDay(a.date, date) &&
              (selectedStaff === 'All Staff' || a.staffName === selectedStaff)
          );

          return (
            <div
              key={day}
              className={cn(
                "h-24 border-r border-b border-gray-200 p-2 flex flex-col items-center cursor-pointer transition-colors",
                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
              )}
              onClick={() => handleDayClick(day)}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full",
                  isToday
                    ? 'bg-blue-600 text-white'
                    : isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700'
                )}
              >
                {day}
              </div>
              {/* Removed appointment dots - keeping only the date number */}
            </div>
          );
        })}
      </div>
    );
  };

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrev}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[180px] text-center">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNext}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setCurrentDate(new Date())}
              className="h-8 px-3 text-sm"
            >
              Today
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingAppointments ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        ) : (
          renderCalendar()
        )}
      </CardContent>
    </Card>
  );
}