import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useUpdateWorkingHoursMutation, useGetWorkingHoursQuery } from '@repo/store/api';
import { toast } from 'sonner';
import { Clock } from "lucide-react";

interface OpeningHour {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

interface OpeningHoursTabProps {
  hours: OpeningHour[];
  setHours: any;
  setVendor: any;
  refetchWorkingHours: () => void;
}

export const OpeningHoursTab = ({
  hours,
  setHours,
  setVendor,
  refetchWorkingHours,
}: OpeningHoursTabProps) => {
  const [updateWorkingHours, { isLoading: isSaving }] = useUpdateWorkingHoursMutation();

  const handleSave = async () => {
    try {
      // Transform hours array to the expected object format
      const workingHoursObject: Record<string, any> = {};
      const dayMapping: Record<string, string> = {
        'Monday': 'monday',
        'Tuesday': 'tuesday',
        'Wednesday': 'wednesday',
        'Thursday': 'thursday',
        'Friday': 'friday',
        'Saturday': 'saturday',
        'Sunday': 'sunday'
      };

      hours.forEach(hour => {
        const dayKey = dayMapping[hour.day];
        if (dayKey) {
          workingHoursObject[dayKey] = {
            isOpen: hour.isOpen,
            hours: hour.isOpen && hour.open && hour.close ? [
              {
                openTime: hour.open,
                closeTime: hour.close
              }
            ] : []
          };
        }
      });

      const result = await updateWorkingHours({
        workingHours: workingHoursObject,
        timezone: 'Asia/Kolkata',
      }).unwrap();

      // Refetch working hours data to get the updated values
      refetchWorkingHours();

      // Update the vendor profile with the new opening hours
      setVendor((prev: any) => ({
        ...prev,
        openingHours: hours
      }));

      // Show success message
      toast.success('Working hours saved successfully!');
    } catch (error: any) {
      console.error('Error saving working hours:', error);
      toast.error(error?.data?.message || 'Failed to save working hours. Please try again.');
    }
  };

  const updateHours = (index: number, updates: Partial<OpeningHour>) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], ...updates };
    setHours(newHours);
  };

  // Function to apply the first open day's hours to all other open days
  const applyTimeForAll = async () => {
    // Find the first open day
    const firstOpenDay = hours.find(hour => hour.isOpen);

    // If no day is open, show a message and return
    if (!firstOpenDay) {
      toast.info('No open days found. Please open at least one day.');
      return;
    }

    // Apply the hours from the first open day to all other open days
    const newHours = hours.map(hour => {
      // Only update days that are open
      if (hour.isOpen) {
        return {
          ...hour,
          open: firstOpenDay.open,
          close: firstOpenDay.close
        };
      }
      // Return closed days unchanged
      return hour;
    });

    setHours(newHours);
    toast.success(`Applied ${firstOpenDay.open} to ${firstOpenDay.close} to all open days`);

    // Automatically save the changes
    try {
      // Transform hours array to the expected object format
      const workingHoursObject: Record<string, any> = {};
      const dayMapping: Record<string, string> = {
        'Monday': 'monday',
        'Tuesday': 'tuesday',
        'Wednesday': 'wednesday',
        'Thursday': 'thursday',
        'Friday': 'friday',
        'Saturday': 'saturday',
        'Sunday': 'sunday'
      };

      newHours.forEach(hour => {
        const dayKey = dayMapping[hour.day];
        if (dayKey) {
          workingHoursObject[dayKey] = {
            isOpen: hour.isOpen,
            hours: hour.isOpen && hour.open && hour.close ? [
              {
                openTime: hour.open,
                closeTime: hour.close
              }
            ] : []
          };
        }
      });

      const result = await updateWorkingHours({
        workingHours: workingHoursObject,
        timezone: 'Asia/Kolkata',
      }).unwrap();

      // Refetch working hours data to get the updated values
      refetchWorkingHours();

      // Update the vendor profile with the new opening hours
      setVendor((prev: any) => ({
        ...prev,
        openingHours: newHours
      }));

      // Show success message
      toast.success('Working hours applied and saved successfully!');
    } catch (error: any) {
      console.error('Error saving working hours:', error);
      toast.error(error?.data?.message || 'Failed to save working hours. Please try again.');
    }
  };

  const { data: workingHoursData } = useGetWorkingHoursQuery(undefined);
  console.log("workingHoursData", workingHoursData);

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl font-semibold">Opening Hours</CardTitle>
        <CardDescription className="text-sm sm:text-base">Set your weekly business hours</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 gap-2 lg:gap-4 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground border-b bg-muted/50">
            <div className="col-span-3">Day</div>
            <div className="col-span-3">Open Time</div>
            <div className="col-span-3">Close Time</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-center">Open</div>
          </div>

          {hours &&
            hours.map((hour, index) => (
              <div key={hour.day}>
                {/* Mobile Layout - Stacked */}
                <div className="md:hidden px-3 py-3 space-y-3 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{hour.day}</span>
                      {hour.isOpen ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          <div className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          <div className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
                          Closed
                        </span>
                      )}
                    </div>
                    <div
                      onClick={() => updateHours(index, { isOpen: !hour.isOpen })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                        hour.isOpen ? 'bg-blue-400' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          hour.isOpen ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>
                  {hour.isOpen && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Open</label>
                        <Input
                          type="time"
                          value={hour.open}
                          disabled={!hour.isOpen}
                          onChange={(e) => updateHours(index, { open: e.target.value })}
                          className="h-10 rounded-lg border border-border focus:border-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Close</label>
                        <Input
                          type="time"
                          value={hour.close}
                          disabled={!hour.isOpen}
                          onChange={(e) => updateHours(index, { close: e.target.value })}
                          className="h-10 rounded-lg border border-border focus:border-primary text-sm"
                        />
                      </div>
                    </div>
                  )}
                  {index === 0 && (
                    <Button
                      onClick={applyTimeForAll}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs rounded-lg w-full"
                      disabled={isSaving}
                    >
                      <Clock className="mr-1.5 h-3 w-3" />
                      Apply to All Days
                    </Button>
                  )}
                </div>

                {/* Desktop/Tablet Layout - Grid */}
                <div
                  className={`hidden md:grid grid-cols-12 gap-2 lg:gap-4 px-3 sm:px-4 py-2 sm:py-3 items-center transition-colors hover:bg-muted/30 ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  <div className="col-span-3 font-medium flex items-center gap-2 text-sm">
                    {hour.day}
                    {index === 0 && (
                      <Button
                        onClick={applyTimeForAll}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs rounded-full hover:scale-105 transition-transform"
                        disabled={isSaving}
                      >
                        Apply to All
                      </Button>
                    )}
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={hour.open}
                      disabled={!hour.isOpen}
                      onChange={(e) => updateHours(index, { open: e.target.value })}
                      className="h-10 sm:h-12 rounded-lg border border-border focus:border-primary text-sm sm:text-base"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={hour.close}
                      disabled={!hour.isOpen}
                      onChange={(e) => updateHours(index, { close: e.target.value })}
                      className="h-10 sm:h-12 rounded-lg border border-border focus:border-primary text-sm sm:text-base"
                    />
                  </div>
                  <div className="col-span-2">
                    {hour.isOpen ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 sm:px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <div className="mr-1 sm:mr-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
                        Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 sm:px-2.5 py-0.5 text-xs font-medium text-red-800">
                        <div className="mr-1 sm:mr-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500"></div>
                        Closed
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <div
                      onClick={() => updateHours(index, { isOpen: !hour.isOpen })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                        hour.isOpen ? 'bg-blue-400' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          hour.isOpen ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="flex justify-end pt-3 sm:pt-4">
          <Button
            onClick={handleSave}
            className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base rounded-lg bg-primary hover:bg-primary/90 w-full sm:w-auto"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving Changes
              </>
            ) : (
              "Save Hours"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};