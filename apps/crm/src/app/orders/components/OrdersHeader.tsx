import React from 'react';

interface OrdersHeaderProps {
  title?: string;
  description?: string;
}

export function OrdersHeader({ 
  title = "Orders Management",
  description = "Track and manage all your orders in one place"
}: OrdersHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold font-headline mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-muted-foreground text-lg">
        {description}
      </p>
    </div>
  );
}

export default OrdersHeader;