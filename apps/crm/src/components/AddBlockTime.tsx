"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { blockTimeActions, addBlockTime, STATUS } from '@repo/store/slices/blockTimeSlice';
import { RootState } from '@repo/store';
import { format, parseISO } from 'date-fns';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { X, Clock, Calendar as CalendarIcon, User, Loader2 } from 'lucide-react';
import { Textarea } from '@repo/ui/textarea';
import { cn } from '@repo/ui/cn';
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
  status?: 'active' | 'inactive';
  workingHours?: {
    start: string;
    end: string;
    days: number[];
  };
  [key: string]: any; // For any additional properties
}

interface AddBlockTimeProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: string | Date;
  staffMembers: StaffMember[];
  defaultStaffId?: string;
  selectedStaffId?: string;
  onStaffChange?: (staffId: string) => void;
}

const AddBlockTime: React.FC<AddBlockTimeProps> = ({ 
  open, 
  onClose, 
  onSuccess,
  initialDate = new Date(),
  staffMembers = [],
  defaultStaffId = '',
  selectedStaffId: propSelectedStaffId,
  onStaffChange
}) => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state: RootState) => state.blockTime);
  
  const [selectedStaffId, setSelectedStaffId] = useState(propSelectedStaffId || defaultStaffId);
  const [date, setDate] = useState<string>(() => {
    if (!initialDate) return '';
    try {
      const d = initialDate instanceof Date ? initialDate : parseISO(initialDate);
      return format(d, 'yyyy-MM-dd');
    } catch (e) {
      return format(new Date(), 'yyyy-MM-dd');
    }
  });
  
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Check if status is 'loading' (string) or 1 (LOADING enum value)
  const isLoading = status === 'loading' || status === 1;

  // Update selected staff when prop changes
  useEffect(() => {
    if (propSelectedStaffId) {
      setSelectedStaffId(propSelectedStaffId);
    }
  }, [propSelectedStaffId]);

  // Generate available time slots when staff or date changes
  useEffect(() => {
    const generateAvailableSlots = () => {
      if (!selectedStaffId || !date) {
        setAvailableSlots([]);
        return;
      }
      
      const staff = staffMembers.find(s => s._id === selectedStaffId);
      
      if (!staff) {
        setAvailableSlots([]);
        return;
      }
      
      // Default working hours (9 AM to 5 PM)
      const defaultStartHour = 9;
      const defaultEndHour = 17;
      
      setIsLoadingSlots(true);
      
      try {
        let startHour = defaultStartHour;
        let endHour = defaultEndHour;
        
        // Use staff's working hours if available
        if (staff.workingHours?.start && staff.workingHours?.end) {
          try {
            const [startH, startM] = staff.workingHours.start.split(':').map(Number);
            const [endH, endM] = staff.workingHours.end.split(':').map(Number);
            
            if (!isNaN(startH) && !isNaN(endH)) {
              startHour = startH;
              // If there are minutes, add 1 to the end hour to include the full hour
              endHour = endH + (endM > 0 ? 1 : 0);
              
              // Ensure end hour is after start hour
              if (endHour <= startHour) {
                endHour = startHour + 8; // Default to 8-hour shift if invalid range
              }
            }
          } catch (e) {
            console.error('Error parsing working hours:', e);
          }
        }
        
        // Generate 30-minute slots between start and end time
        const slots: string[] = [];
        for (let hour = startHour; hour <= endHour; hour++) {
          // Only add :00 and :30 minutes for each hour
          if (hour < endHour) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
          }
          if (hour < endHour) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
          }
        }
        
        console.log('Generated time slots:', slots);
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error generating time slots:', error);
        setAvailableSlots([]);
        toast.error('Failed to generate available time slots');
      } finally {
        setIsLoadingSlots(false);
      }
    };
    
    // Only generate slots if the dialog is open
    if (open) {
      generateAvailableSlots();
    }
  }, [selectedStaffId, date, staffMembers, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedStaffId) {
      newErrors.staff = 'Please select a staff member';
    }
    if (!date) {
      newErrors.date = 'Please select a date';
    }
    if (!startTime) {
      newErrors.startTime = 'Please select a start time';
    }
    if (!endTime) {
      newErrors.endTime = 'Please select an end time';
    } else if (startTime && endTime <= startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStaffChange = (value: string) => {
    setSelectedStaffId(value);
    if (onStaffChange) {
      onStaffChange(value);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    const staff = staffMembers.find(s => s._id === selectedStaffId);
    const staffName = staff ? 
      (staff.fullName || staff.staffName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim()) : 
      'All Staff';
    
    try {
      const result = await dispatch(
        addBlockTime({
          date,
          startTime,
          endTime,
          staffId: selectedStaffId,
          staffName,
          reason: reason || 'Blocked time',
        })
      ).unwrap();
      
      toast.success('Time blocked successfully');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error blocking time:', error);
      toast.error(error.message || 'Failed to block time');
    }
  };
  
  const handleClose = () => {
    // Reset form state
    setStartTime('');
    setEndTime('');
    setReason('');
    setErrors({});
    
    // Reset the form in Redux
    dispatch(blockTimeActions.resetBlockTime());
    
    // Close the dialog
    onClose();
  };

  const getStaffName = (staff: StaffMember) => {
    if (!staff) return 'Unknown Staff';
    return staff.fullName || staff.staffName || 
           `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 
           `Staff ${staff._id}`;
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
              value={selectedStaffId}
              onValueChange={handleStaffChange}
              disabled={isLoading || isLoadingSlots}
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
                      <div className="flex items-center">
                        {staff.photo ? (
                          <img 
                            src={staff.photo} 
                            alt={getStaffName(staff)}
                            className="h-6 w-6 rounded-full mr-2 object-cover"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <User className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {getStaffName(staff)}
                          </span>
                          {staff.position && (
                            <span className="text-xs text-gray-500">
                              {staff.position}
                            </span>
                          )}
                        </div>
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
                disabled={isLoading || isLoadingSlots}
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
                onValueChange={setStartTime}
                disabled={!selectedStaffId || isLoading || isLoadingSlots || availableSlots.length === 0}
              >
                <SelectTrigger className="h-12">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue 
                    placeholder={
                      !selectedStaffId ? "Select staff first" : 
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
                onValueChange={setEndTime}
                disabled={!startTime || isLoading || isLoadingSlots}
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

          {/* Reason */}
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Reason (Optional)
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for blocking this time..."
              className="min-h-[100px]"
              disabled={isLoading || isLoadingSlots}
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              className="px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSave} 
              disabled={isLoading || isLoadingSlots}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Blocking...
                </>
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