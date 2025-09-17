"use client";

import { Check, Package, Send, Truck, Home } from 'lucide-react';
import { cn } from '@repo/ui/cn';
import React from 'react';

const statuses = ['Processing', 'Packed', 'Shipped', 'Delivered'];

interface OrderStatusTimelineProps {
  currentStatus: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const currentStatusIndex = statuses.indexOf(currentStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Package className="h-5 w-5" />;
      case 'Packed':
        return <Package className="h-5 w-5" />;
      case 'Shipped':
        return <Truck className="h-5 w-5" />;
      case 'Delivered':
        return <Home className="h-5 w-5" />;
      default:
        return <Check className="h-5 w-5" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center">
        {statuses.map((status, index) => (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center relative">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  index <= currentStatusIndex
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                )}
              >
                {getStatusIcon(status)}
              </div>
              <p
                className={cn(
                  'text-xs mt-2 text-center',
                  index <= currentStatusIndex ? 'font-semibold text-blue-600' : 'text-muted-foreground'
                )}
              >
                {status}
              </p>
            </div>
            {index < statuses.length - 1 && (
              <div className="flex-1 h-1 rounded-full mx-2 transition-all duration-300 bg-gray-200">
                <div
                  className={cn(
                    'h-full rounded-full bg-blue-600 transition-all duration-500',
                    index < currentStatusIndex ? 'w-full' : 'w-0'
                  )}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
