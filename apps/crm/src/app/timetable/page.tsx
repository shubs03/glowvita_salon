
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Switch } from "@repo/ui/switch";
import { Clock, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetCrmDoctorWorkingHoursQuery, useUpdateCrmDoctorWorkingHoursMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';

type TimeSlot = {
  start: string;
  end: string;
};

type DaySchedule = {
  day: string;
  isOpen: boolean;
  slots: TimeSlot[];
};

const initialSchedule: DaySchedule[] = [
  { day: 'Monday', isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Tuesday', isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Wednesday', isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Thursday', isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Friday', isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Saturday', isOpen: false, slots: [] },
  { day: 'Sunday', isOpen: false, slots: [] },
];

export default function TimetablePage() {
  const { user, role } = useCrmAuth();
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  
  // Fetch working hours
  const { data: workingHoursData, isLoading, error, refetch } = useGetCrmDoctorWorkingHoursQuery(undefined, {
    skip: role !== 'doctor'
  });
  
  // Update working hours mutation
  const [updateWorkingHours, { isLoading: isSaving }] = useUpdateCrmDoctorWorkingHoursMutation();

  // Transform API data to schedule format
  useEffect(() => {
    if (workingHoursData?.workingHoursArray) {
      const transformedSchedule: DaySchedule[] = workingHoursData.workingHoursArray.map((dayData: any) => ({
        day: dayData.day,
        isOpen: dayData.isOpen,
        slots: dayData.isOpen && dayData.open && dayData.close 
          ? [{ start: dayData.open, end: dayData.close }] 
          : []
      }));
      setSchedule(transformedSchedule);
    }
  }, [workingHoursData]);

  const handleToggleDay = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].isOpen = !newSchedule[dayIndex].isOpen;
    if (!newSchedule[dayIndex].isOpen) {
      newSchedule[dayIndex].slots = [];
    } else if (newSchedule[dayIndex].slots.length === 0) {
      newSchedule[dayIndex].slots = [{ start: '09:00', end: '17:00' }];
    }
    setSchedule(newSchedule);
  };

  const handleSlotChange = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots[slotIndex][field] = value;
    setSchedule(newSchedule);
  };
  
  const addSlot = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.push({ start: '09:00', end: '17:00' });
    setSchedule(newSchedule);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.splice(slotIndex, 1);
    setSchedule(newSchedule);
  };

  const handleSaveChanges = async () => {
    try {
      // Transform schedule to API format
      const workingHours: Record<string, any> = {};
      const dayMapping: Record<string, string> = {
        'Monday': 'monday',
        'Tuesday': 'tuesday',
        'Wednesday': 'wednesday',
        'Thursday': 'thursday',
        'Friday': 'friday',
        'Saturday': 'saturday',
        'Sunday': 'sunday'
      };

      schedule.forEach(daySchedule => {
        const dayKey = dayMapping[daySchedule.day];
        workingHours[dayKey] = {
          isOpen: daySchedule.isOpen,
          hours: daySchedule.isOpen && daySchedule.slots.length > 0
            ? daySchedule.slots.map(slot => ({
                openTime: slot.start,
                closeTime: slot.end
              }))
            : []
        };
      });

      await updateWorkingHours({ workingHours }).unwrap();
      toast.success("Working hours saved successfully!");
      refetch();
    } catch (error: any) {
      console.error("Error saving working hours:", error);
      toast.error(error?.data?.message || "Failed to save working hours");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>
              Set your weekly availability. This will affect when patients can book consultations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>
              Set your weekly availability. This will affect when patients can book consultations.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-12">
            <p className="text-center text-destructive">Failed to load working hours. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>
            Set your weekly availability. This will affect when patients can book consultations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {schedule.map((daySchedule, dayIndex) => (
                <div key={daySchedule.day} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Switch 
                                id={`switch-${daySchedule.day}`} 
                                checked={daySchedule.isOpen}
                                onCheckedChange={() => handleToggleDay(dayIndex)}
                            />
                            <Label htmlFor={`switch-${daySchedule.day}`} className="text-lg font-medium">
                                {daySchedule.day}
                            </Label>
                        </div>
                        <span className={`text-sm font-semibold ${daySchedule.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {daySchedule.isOpen ? 'Open' : 'Closed'}
                        </span>
                    </div>

                    {daySchedule.isOpen && (
                        <div className="mt-4 pl-8 space-y-4">
                            {daySchedule.slots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="flex items-center gap-4">
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="time" value={slot.start} onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'start', e.target.value)} className="pl-10" />
                                        </div>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="time" value={slot.end} onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'end', e.target.value)} className="pl-10" />
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeSlot(dayIndex, slotIndex)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addSlot(dayIndex)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Time Slot
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
