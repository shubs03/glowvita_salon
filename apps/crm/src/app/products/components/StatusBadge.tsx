import { Badge } from '@repo/ui/badge';

interface StatusBadgeProps {
  status: string;
  rejectionReason?: string;
}

const StatusBadge = ({ status, rejectionReason }: StatusBadgeProps) => {
  const statusConfig: Record<string, { variant: "secondary" | "outline" | "destructive"; dotColor: string }> = {
    pending: {
      variant: 'outline',
      dotColor: 'bg-yellow-500'
    },
    approved: {
      variant: 'secondary',
      dotColor: 'bg-green-500'
    },
    disapproved: {
      variant: 'destructive',
      dotColor: 'bg-red-500'
    },
    rejected: {
      variant: 'destructive',
      dotColor: 'bg-red-500'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="flex flex-col gap-1 items-start">
      <Badge
        variant={config.variant}
        className="rounded-full text-xs"
      >
        <div className={`w-1.5 h-1.5 rounded-full mr-1 ${config.dotColor}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
      {(status === 'disapproved' || status === 'rejected') && rejectionReason && (
        <span className="text-[10px] text-red-500 font-medium leading-tight max-w-[120px]" title={rejectionReason}>
          Reason: {rejectionReason}
        </span>
      )}
    </div>
  );
};

export default StatusBadge;