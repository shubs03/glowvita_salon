 "use client";

import { Clock, User, MoreVertical, ArrowRight, CheckCircle2, Clock4, XCircle, Calendar, Phone, Mail } from 'lucide-react';
import { useState } from 'react';

type Appointment = {
  id: string;
  clientName: string;
  service: string;
  serviceName?: string;
  staffName: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  isBlocked?: boolean;
  description?: string;
  clientPhone?: string;
  clientEmail?: string;
  duration?: string;
  price?: string;
  mode?: 'online' | 'offline'; // Booking mode
};

interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
}

const getServiceGradient = (service: string | null | undefined) => {
  const serviceName = service?.toLowerCase() || 'default';
  
  if (serviceName.includes('hair')) {
    return {
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      border: 'border-l-purple-500',
      accent: 'text-purple-600 dark:text-purple-400'
    };
  } else if (serviceName.includes('facial') || serviceName.includes('skin')) {
    return {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      border: 'border-l-blue-500',
      accent: 'text-blue-600 dark:text-blue-400'
    };
  } else if (serviceName.includes('nail') || serviceName.includes('manicure') || serviceName.includes('pedicure')) {
    return {
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      border: 'border-l-pink-500',
      accent: 'text-pink-600 dark:text-pink-400'
    };
  } else if (serviceName.includes('massage') || serviceName.includes('spa')) {
    return {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      border: 'border-l-green-500',
      accent: 'text-green-600 dark:text-green-400'
    };
  } else {
    return {
      gradient: 'from-gray-500 to-slate-500',
      bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
      border: 'border-l-gray-500',
      accent: 'text-gray-600 dark:text-gray-400'
    };
  }
};

const getStatusConfig = (status: Appointment['status']) => {
  switch (status) {
    case 'confirmed': 
      return { 
        label: 'Confirmed',
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200',
        dotColor: 'bg-green-400'
      };
    case 'completed': 
      return { 
        label: 'Completed',
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-200',
        dotColor: 'bg-blue-400'
      };
    case 'pending': 
      return { 
        label: 'Pending',
        icon: <Clock4 className="w-4 h-4" />,
        color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-200',
        dotColor: 'bg-amber-400'
      };
    case 'cancelled': 
      return { 
        label: 'Cancelled',
        icon: <XCircle className="w-4 h-4" />,
        color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-200',
        dotColor: 'bg-red-400'
      };
    default: 
      return { 
        label: 'Unknown',
        icon: <span>?</span>,
        color: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-gray-200',
        dotColor: 'bg-gray-400'
      };
  }
};

// Enhanced Button Component
const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  onClick, 
  ...props 
}: {
  children: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any;
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105',
    outline: 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800',
  };
  
  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 py-1 px-3 text-xs',
    icon: 'h-9 w-9 p-0',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Enhanced Dropdown Components
const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

const DropdownMenuTrigger = ({ 
  children, 
  asChild = false 
}: { 
  children: React.ReactNode; 
  asChild?: boolean; 
}) => {
  return <>{children}</>;
};

const DropdownMenuContent = ({ 
  children, 
  align = 'center', 
  className = '' 
}: { 
  children: React.ReactNode; 
  align?: 'start' | 'center' | 'end'; 
  className?: string; 
}) => {
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div className={`absolute top-full mt-2 ${alignmentClasses[align]} z-50 min-w-48 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm py-2 shadow-2xl ring-1 ring-black/5 focus:outline-none dark:border-gray-700 dark:bg-gray-800/95 animate-in slide-in-from-top-1 ${className}`}>
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ 
  children, 
  className = '', 
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: (e: React.MouseEvent) => void; 
}) => {
  return (
    <button
      className={`block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 focus:bg-gradient-to-r focus:from-gray-50 focus:to-gray-100 focus:outline-none transition-all duration-150 first:rounded-t-lg last:rounded-b-lg dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 dark:focus:from-gray-700 dark:focus:to-gray-600 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default function AppointmentCard({ 
  appointment, 
  onViewDetails, 
  onEdit, 
  onCancel, 
  onComplete 
}: AppointmentCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const statusConfig = getStatusConfig(appointment.status);
  const serviceTheme = getServiceGradient(appointment.service);
  
  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    action?.();
  };

  return (
    <div 
      className={`relative group p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${serviceTheme.border} ${serviceTheme.bg} border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/90 backdrop-blur-sm cursor-pointer transform hover:-translate-y-1.5 hover:scale-[1.02]`}
      onClick={onViewDetails}
    >
      {/* Top Bar - Status and Time */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${statusConfig.dotColor} shadow-sm`}></div>
          <span className={`text-sm font-extrabold ${statusConfig.color} px-4 py-2 rounded-full shadow-md`}>
            {statusConfig.label}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-bold bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <Clock className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          <span className="tracking-wide">{appointment.startTime} - {appointment.endTime}</span>
        </div>
      </div>

      {/* Client and Service Info */}
      <div className="mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3 truncate">
          {appointment.clientName}
        </h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className={`text-base font-extrabold px-4 py-2 rounded-full ${serviceTheme.accent} bg-opacity-20 shadow-md`}>
            {appointment.serviceName || appointment.service}
          </div>
          {appointment.duration && (
            <span className="text-base text-gray-700 dark:text-gray-300 font-bold flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
              <Clock className="w-5 h-5 mr-2" />
              {appointment.duration}
            </span>
          )}
          {appointment.price && (
            <span className="text-lg font-extrabold text-gray-900 dark:text-white bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-lg shadow-md">
              {appointment.price}
            </span>
          )}
        </div>
        {(appointment.clientPhone || appointment.clientEmail) && (
          <div className="flex gap-3 mt-4">
            {appointment.clientPhone && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 w-10 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-gray-300 dark:border-gray-600 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${appointment.clientPhone}`;
                }}
              >
                <Phone className="w-5 h-5" />
              </Button>
            )}
            {appointment.clientEmail && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 w-10 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-gray-300 dark:border-gray-600 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${appointment.clientEmail}`;
                }}
              >
                <Mail className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
        {/* Booking Mode Badge - Only show if mode field exists */}
        {appointment.mode && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
              appointment.mode === 'online'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}>
              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                {appointment.mode === 'online' ? (
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                ) : (
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                )}
              </svg>
              {appointment.mode === 'online' ? 'Web Booking' : 'Offline Booking'}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm font-extrabold rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm px-4 py-2"
            onClick={(e) => handleAction(e, onViewDetails)}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            View Details
          </Button>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 w-10 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          
          {isDropdownOpen && (
            <DropdownMenuContent align="end" className="w-52 rounded-xl border-gray-200 dark:border-gray-700 shadow-xl">
              <DropdownMenuItem 
                onClick={(e) => handleAction(e, onViewDetails)}
                className="py-3 font-bold text-base"
              >
                <ArrowRight className="w-5 h-5 mr-3" />
                View Details
              </DropdownMenuItem>
              
              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <>
                  <DropdownMenuItem 
                    onClick={(e) => handleAction(e, onEdit)}
                    className="py-3 font-bold text-base"
                  >
                    <Clock className="w-5 h-5 mr-3" />
                    Edit
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 font-bold text-base"
                    onClick={(e) => handleAction(e, onCancel)}
                  >
                    <XCircle className="w-5 h-5 mr-3" />
                    Cancel
                  </DropdownMenuItem>
                  
                  {appointment.status === 'confirmed' && (
                    <DropdownMenuItem 
                      className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 py-3 font-bold text-base"
                      onClick={(e) => handleAction(e, onComplete)}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-3" />
                      Complete
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
      
      {/* Notes Indicator */}
      {appointment.notes && (
        <div className="absolute -top-2.5 -right-2.5">
          <div className="relative group/note">
            <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse shadow-lg"></div>
            <div className="absolute right-0 bottom-full mb-3 w-72 p-4 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover/note:opacity-100 group-hover/note:visible transition-all duration-300 z-50 border border-gray-200 dark:border-gray-700">
              <p className="font-extrabold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                Notes:
              </p>
              <p className="whitespace-pre-line leading-relaxed">{appointment.notes}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Dropdown backdrop */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
