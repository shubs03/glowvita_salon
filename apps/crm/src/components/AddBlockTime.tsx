"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { blockTimeActions } from '@repo/store/slices/blockTimeSlice';
import { RootState } from '@repo/store';
import { format } from 'date-fns';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { X, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { Textarea } from '@repo/ui/textarea';
import toast from 'react-hot-toast';

interface StaffMember {
  _id: string;
  fullName?: string;
  staffName?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  mobileNo?: string;
  emailAddress?: string;
  photo?: string;
  description?: string;
  salary?: number;
  startDate?: string;
  endDate?: string;
  yearOfExperience?: number;
  clientsServed?: number;
  commission?: boolean;
  bankDetails?: object;
  password?: string;
  role?: string;
  permissions?: string[];
  status?: string;
  lastLoginAt?: string;
  mondayAvailable?: boolean;
  mondaySlots?: any[];
  tuesdayAvailable?: boolean;
  tuesdaySlots?: any[];
  wednesdayAvailable?: boolean;
  wednesdaySlots?: any[];
  thursdayAvailable?: boolean;
  thursdaySlots?: any[];
  fridayAvailable?: boolean;
  fridaySlots?: any[];
  saturdayAvailable?: boolean;
  saturdaySlots?: any[];
  sundayAvailable?: boolean;
  sundaySlots?: any[];
  hasWeekdayAvailability?: boolean;
  hasWeekendAvailability?: boolean;
  totalWeeklyHours?: number;
  blockedTimes?: any[];
  timezone?: string;
  isCurrentlyAvailable?: boolean;
  avgResponseTime?: number;
  rating?: number;
  totalRatings?: number;
  tags?: any[];
  lastAvailabilityUpdate?: string;
  createdAt?: string;
  updatedAt?: string;
  searchText?: string;
  __v?: number;
  workingHours?: {
    start: string;
    end: string;
    days: number[];
  };
}

interface AddBlockTimeProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  staffMembers: StaffMember[];
  defaultStaffId?: string;
}

const AddBlockTime: React.FC<AddBlockTimeProps> = ({ 
  open, 
  onClose, 
  initialDate = '', 
  staffMembers = [],
  defaultStaffId = ''
}) => {
  const dispatch = useDispatch();
  const blockTimeState = useSelector((state: RootState) => state.blockTime);
  const { startTime, endTime, description } = blockTimeState;
  
  const [selectedStaff, setSelectedStaff] = useState(defaultStaffId);
  const [date, setDate] = useState(initialDate);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate available time slots when staff or date changes
  useEffect(() => {
    const generateAvailableSlots = () => {
      if (!selectedStaff || !date) {
        setAvailableSlots([]);
        return;
      }
      
      const staff = staffMembers.find(s => s._id === selectedStaff);
      
      if (!staff) {
        setAvailableSlots([]);
        return;
      }
      
      if (!staff.workingHours) {
        // Generate default slots if no working hours
        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeSlot);
          }
        }
        setAvailableSlots(slots);
        return;
      }
      
      setIsLoadingSlots(true);
      try {
        const slots = [];
        
        // Handle different time formats
        let startTime = staff.workingHours.start;
        let endTime = staff.workingHours.end;
        
        // If time is in format like "09:00" or "9:00", ensure proper format
        if (typeof startTime === 'string') {
          const startParts = startTime.split(':');
          if (startParts.length === 2) {
            startTime = `${startParts[0].padStart(2, '0')}:${startParts[1].padStart(2, '0')}`;
          }
        }
        
        if (typeof endTime === 'string') {
          const endParts = endTime.split(':');
          if (endParts.length === 2) {
            endTime = `${endParts[0].padStart(2, '0')}:${endParts[1].padStart(2, '0')}`;
          }
        }
        
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          // Fallback to manual parsing
          const startHour = parseInt(staff.workingHours.start.split(':')[0]);
          const startMinute = parseInt(staff.workingHours.start.split(':')[1] || '0');
          const endHour = parseInt(staff.workingHours.end.split(':')[0]);
          const endMinute = parseInt(staff.workingHours.end.split(':')[1] || '0');
          
          let currentHour = startHour;
          let currentMinute = startMinute;
          
          while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
            const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            slots.push(timeSlot);
            
            currentMinute += 30;
            if (currentMinute >= 60) {
              currentMinute = 0;
              currentHour += 1;
            }
          }
        } else {
          // Generate 30-minute slots using Date objects
          let current = new Date(start);
          while (current < end) {
            slots.push(format(current, 'HH:mm'));
            current = new Date(current.getTime() + 30 * 60000);
          }
        }
        
        setAvailableSlots(slots);
        
      } catch (error) {
        // Fallback: generate basic time slots
        const fallbackSlots = [];
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            fallbackSlots.push(timeSlot);
          }
        }
        setAvailableSlots(fallbackSlots);
        
        toast.error('Using default time slots due to error');
      } finally {
        setIsLoadingSlots(false);
      }
    };
    
    generateAvailableSlots();
  }, [selectedStaff, date, staffMembers]);
  
  // Sync date with Redux
  useEffect(() => {
    if (date) {
      dispatch(blockTimeActions.setDate(date));
    }
  }, [date, dispatch]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedStaff) {
      newErrors.staff = 'Please select a staff member';
    }
    if (!date) {
      newErrors.date = 'Please select a date';
    }
    if (!startTime) {
      newErrors.startTime = 'Please select start time';
    }
    if (!endTime) {
      newErrors.endTime = 'Please select end time';
    } else if (startTime && endTime <= startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    const staff = staffMembers.find(s => s._id === selectedStaff);
    
    if (!staff) {
      return;
    }
    
    const staffName = staff.fullName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim();
    
    const blockTimeData = {
      staffId: selectedStaff,
      staffName: staffName,
      date,
      startTime,
      endTime,
      description: description || 'Blocked time'
    };
    
    dispatch(blockTimeActions.addBlockedTime(blockTimeData));

    onClose();
    toast.success('Time blocked successfully');
  };

  const handleClose = () => {
    setSelectedStaff(defaultStaffId);
    setDate(initialDate);
    setAvailableSlots([]);
    setErrors({});
    dispatch(blockTimeActions.resetBlockTime());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Block Staff Time
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Select a staff member and time slot to block their availability
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Staff Selection */}
          <div className="space-y-2">
            <label htmlFor="staff" className="text-sm font-medium text-gray-700">
              Staff Member *
            </label>
            <Select 
              value={selectedStaff} 
              onValueChange={(value) => {
                setSelectedStaff(value);
                dispatch(blockTimeActions.setStaffMember(value));
              }}
              disabled={isLoadingSlots}
            >
              <SelectTrigger className="h-12">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Choose a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No staff members available
                  </div>
                ) : (
                  staffMembers.map((staff) => (
                    <SelectItem key={staff._id} value={staff._id} className="cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {staff.staffName || staff.fullName}
                        </span>
                        {staff.position && (
                          <span className="text-xs text-gray-500">
                            {staff.position}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.staff && (
              <p className="text-sm text-red-600">{errors.staff}</p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date *
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="h-12 pl-10"
              />
            </div>
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                Start Time *
              </label>
              <Select
                value={startTime}
                onValueChange={(value) => {
                  dispatch(blockTimeActions.setStartTime(value));
                  if (endTime && value >= endTime) {
                    dispatch(blockTimeActions.setEndTime(''));
                  }
                }}
                disabled={!selectedStaff || isLoadingSlots || availableSlots.length === 0}
              >
                <SelectTrigger className="h-12">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue 
                    placeholder={
                      !selectedStaff ? "Select staff first" : 
                      isLoadingSlots ? "Loading..." : 
                      availableSlots.length === 0 ? "No slots available" : 
                      "Start time"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.length === 0 ? (
                    <SelectItem value="no-slots" disabled>
                      {isLoadingSlots ? 'Loading time slots...' : 'No time slots available'}
                    </SelectItem>
                  ) : (
                    availableSlots.map((slot) => (
                      <SelectItem key={`start-${slot}`} value={slot}>
                        {slot}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.startTime && (
                <p className="text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                End Time *
              </label>
              <Select
                value={endTime}
                onValueChange={(value) => dispatch(blockTimeActions.setEndTime(value))}
                disabled={!startTime || isLoadingSlots}
              >
                <SelectTrigger className="h-12">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue 
                    placeholder={
                      !startTime ? "Select start time first" : 
                      "End time"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.length === 0 ? (
                    <SelectItem value="no-slots" disabled>
                      No time slots available
                    </SelectItem>
                  ) : !startTime ? (
                    <SelectItem value="no-start" disabled>
                      Select start time first
                    </SelectItem>
                  ) : (
                    availableSlots
                      .filter(slot => slot > startTime)
                      .map((slot) => (
                        <SelectItem key={`end-${slot}`} value={slot}>
                          {slot}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {errors.endTime && (
                <p className="text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => dispatch(blockTimeActions.setDescription(e.target.value))}
              placeholder="Optional: Add a reason for blocking this time..."
              className="min-h-[100px] resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoadingSlots}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isLoadingSlots ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Blocking...
                </div>
              ) : (
                'Block Time'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockTime;