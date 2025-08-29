import { useMemo } from 'react';
import { cn } from '@repo/ui/cn';
import { useSelector } from 'react-redux';
import { selectBlockedTimes } from '@repo/store/slices/blockTimeSlice';

interface TimeSlotViewProps {
  date: Date;
  staffName: string;
  onTimeSlotClick?: (time: string) => void;
}

export function TimeSlotView({ date, staffName, onTimeSlotClick }: TimeSlotViewProps) {
  // Generate time slots from 9 AM to 6 PM
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }, []);

  // Get blocked times for the selected staff and date
  const blockedTimes = useSelector((state) => 
    selectBlockedTimes(state, { 
      staffName,
      date: date.toISOString().split('T')[0]
    })
  );

  // Check if a time slot is blocked
  const isTimeBlocked = (time: string) => {
    return blockedTimes.some(block => {
      const blockStart = block.startTime;
      const blockEnd = block.endTime;
      return time >= blockStart && time < blockEnd;
    });
  };

  return (
    <div className="space-y-2 p-4">
      <h3 className="text-lg font-medium mb-4">
        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </h3>
      <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
        {timeSlots.map((time) => {
          const blocked = isTimeBlocked(time);
          return (
            <div 
              key={time}
              onClick={() => onTimeSlotClick?.(time)}
              className={cn(
                'p-2 rounded border text-center cursor-pointer transition-colors',
                blocked 
                  ? 'bg-amber-50 border-amber-200 text-amber-600' 
                  : 'hover:bg-gray-50 border-gray-200',
                {
                  'opacity-50 cursor-not-allowed': blocked,
                  'cursor-pointer': !blocked
                }
              )}
            >
              <div className="font-medium">{time}</div>
              {blocked && (
                <div className="text-xs mt-1 text-amber-600">Blocked</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
