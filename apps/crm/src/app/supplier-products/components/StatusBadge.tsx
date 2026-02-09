import { Badge } from '@repo/ui/badge';

type ProductStatus = 'pending' | 'approved' | 'disapproved';

interface StatusBadgeProps {
  status: ProductStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig: Record<ProductStatus, { variant: any; dotColor: string }> = {
    pending: { 
      variant: 'secondary', 
      dotColor: 'bg-yellow-500' 
    },
    approved: { 
      variant: 'default', 
      dotColor: 'bg-green-500' 
    },
    disapproved: { 
      variant: 'destructive', 
      dotColor: 'bg-red-500' 
    }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge 
      variant={config.variant}
      className="rounded-full text-xs"
    >
      <div className={`w-1.5 h-1.5 rounded-full mr-1 ${config.dotColor}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default StatusBadge;
