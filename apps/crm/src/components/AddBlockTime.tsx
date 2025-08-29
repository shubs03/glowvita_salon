"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveBlockTime } from '@repo/store/slices/blockTimeSlice';
import { blockTimeActions } from '@repo/store/slices/blockTimeSlice';
import { RootState } from '@repo/store';
import { format } from 'date-fns';
import { Button } from '@repo/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { X, Clock, Calendar, User } from 'lucide-react';
import { Textarea } from '@repo/ui/textarea';

interface AddBlockTimeProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
}

const staffMembers = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Mike Johnson' },
];

const AddBlockTime: React.FC<AddBlockTimeProps> = ({ open, onClose, initialDate = '' }) => {
  const dispatch = useDispatch();
  const blockTimeState = useSelector((state: RootState) => state.blockTime);
  const { staffMember, startTime, endTime, description, date: blockTimeDate } = blockTimeState;
  const [date, setDate] = useState(initialDate);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Sync local date with Redux state when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
      // Use the action creator from blockTimeActions
      dispatch(blockTimeActions.setDate(initialDate));
    }
  }, [initialDate, dispatch]);
  
  // Update local state when Redux state changes
  useEffect(() => {
    if (blockTimeDate) {
      setDate(blockTimeDate);
    }
  }, [blockTimeDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = 'Date is required';
    if (!staffMember) newErrors.staffMember = 'Staff member is required';
    if (!startTime) newErrors.startTime = 'Start time is required';
    if (!endTime) newErrors.endTime = 'End time is required';
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const formIsValid = validateForm();
    if (!formIsValid) return;
    
    try {
      // Ensure dates are properly serialized
      const blockTimeData = {
        date: date, // The date is already in YYYY-MM-DD format from the date input
        staffMember,
        startTime,
        endTime,
        description,
      };
      
      // Dispatch the save action
      const result = await dispatch(saveBlockTime(blockTimeData)).unwrap();
      
      if (result && onClose) {
        // Show success message
        alert('Block time saved successfully!');
        // Reset the form state using the reset action
        dispatch(blockTimeActions.reset());
        // Close the modal
        onClose();
      }
    } catch (error) {
      console.error('Failed to save block time:', error);
      // Show error to user
      alert(error || 'Failed to save block time. Please try again.');
    }
  };

  const handleStaffMemberChange = (value: string) => {
    dispatch(blockTimeActions.setStaffMember(value));
    if (errors.staffMember) {
      setErrors(prev => ({ ...prev, staffMember: '' }));
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(blockTimeActions.setStartTime(e.target.value));
    if (errors.startTime) {
      setErrors(prev => ({ ...prev, startTime: '' }));
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(blockTimeActions.setEndTime(e.target.value));
    if (errors.endTime) {
      setErrors(prev => ({ ...prev, endTime: '' }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(blockTimeActions.setDescription(e.target.value));
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">Add Block Time</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Date <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                min={today}
                value={date || ''}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setDate(newDate);
                  dispatch(setDate(newDate));
                }}
                className={`pl-10 ${errors.date ? 'border-destructive' : ''}`}
                required
              />
            </div>
            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Staff Member <span className="text-destructive">*</span>
            </label>
            <Select 
              value={staffMember || ''} 
              onValueChange={handleStaffMemberChange}
            >
              <SelectTrigger className={errors.staffMember ? 'border-destructive' : ''}>
                <User className="h-4 w-4 text-muted-foreground mr-2" />
                <SelectValue placeholder="Select a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.staffMember && <p className="text-sm text-destructive">{errors.staffMember}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Start Time <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={startTime || ''}
                  onChange={handleStartTimeChange}
                  className={`pl-10 ${errors.startTime ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                End Time <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={endTime || ''}
                  onChange={handleEndTimeChange}
                  className={`pl-10 ${errors.endTime ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Description (Optional)
            </label>
            <Textarea
              value={description || ''}
              onChange={handleDescriptionChange}
              placeholder="Add any notes or details about this block time"
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Block Time
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockTime; 