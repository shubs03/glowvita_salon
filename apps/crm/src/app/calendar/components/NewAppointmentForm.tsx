"use client";

import { useState, useEffect } from 'react';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';
import { Button } from '@repo/ui/button';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';

type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientName: string;
  service: string;
  staffName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: AppointmentStatus;
}

export type AppointmentFormData = Omit<Appointment, 'id' | 'status' | 'date'> & {
  date?: Date;
};

const staffMembers = ['Jane Doe', 'John Smith', 'Emily White'];
const services = [
  'Deluxe Haircut',
  'Manicure',
  'Pedicure',
  'Facial',
  'Hair Color',
  'Hair Treatment',
  'Beard Trim',
  'Makeup'
];

interface NewAppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => void;
  onDelete?: () => void;
  defaultDate?: Date;
  defaultValues?: Partial<Appointment>;
}

export default function NewAppointmentForm({ 
  onSubmit, 
  onDelete,
  defaultDate, 
  defaultValues 
}: NewAppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    date: (defaultValues?.date as Date) || defaultDate || new Date(),
    clientName: defaultValues?.clientName || '',
    service: defaultValues?.service || services[0],
    staffName: defaultValues?.staffName || staffMembers[0],
    startTime: defaultValues?.startTime || '10:00',
    endTime: defaultValues?.endTime || '11:00',
    notes: defaultValues?.notes || ''
  });

  useEffect(() => {
    if (defaultDate) {
      // Set default time to next available hour
      const now = new Date();
      const nextHour = now.getHours() + 1;
      const timeString = `${nextHour.toString().padStart(2, '0')}:00`;
      
      setFormData(prev => ({
        ...prev,
        startTime: timeString,
        endTime: `${(nextHour + 1).toString().padStart(2, '0')}:00`
      }));
    }
  }, [defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create a new object with all form data including the date
    const submitData: AppointmentFormData = {
      ...formData,
      date: formData.date // This will be included in the submission
    };
    onSubmit(submitData);
  };

  const handleChange = (field: keyof Omit<Appointment, 'id'>, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return (
    <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {defaultValues?.id ? 'Edit Appointment' : 'New Appointment'}
        </h3>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-50"
            onClick={(e) => {
              e.preventDefault();
              if (confirm('Are you sure you want to delete this appointment?')) {
                onDelete();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <Label htmlFor="newClientName" className="text-xs font-medium text-gray-700">Client Name *</Label>
          <Input 
            id="newClientName" 
            placeholder="Client name" 
            value={formData.clientName}
            onChange={(e) => handleChange('clientName' as const, e.target.value)}
            className="h-8 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-700">Date *</Label>
            <div className="relative">
              <Input 
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : new Date();
                  handleChange('date' as const, newDate);
                }}
                className="h-8 text-sm pl-2"
                required
              />
              <CalendarIcon className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="service" className="text-xs font-medium text-gray-700">Service *</Label>
            <Select 
              value={formData.service}
              onValueChange={(value) => handleChange('service', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="startTime" className="text-xs font-medium text-gray-700">Start *</Label>
            <Input 
              type="time"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime' as const, e.target.value)}
              className="h-8 text-sm"
              required
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="endTime" className="text-xs font-medium text-gray-700">End *</Label>
            <Input 
              type="time"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => handleChange('endTime' as const, e.target.value)}
              className="h-8 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="staff" className="text-xs font-medium text-gray-700">Staff *</Label>
          <Select 
            value={formData.staffName}
            onValueChange={(value) => handleChange('staffName', value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select staff" />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map(staff => (
                <SelectItem key={staff} value={staff}>
                  {staff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="newNotes" className="text-xs font-medium text-gray-700">Notes</Label>
          <Textarea 
            id="newNotes" 
            placeholder="Special requests or notes..." 
            value={formData.notes}
            onChange={(e) => handleChange('notes' as const, e.target.value)}
            className="text-sm min-h-[60px] text-sm"
          />
        </div>
      </div>
    </form>
  );
}
