'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Badge } from '@repo/ui/badge';
import { MessageSquare, Calendar, Users, DollarSign, BarChart2, FileText, Clock } from 'lucide-react';

type Campaign = {
  _id: string;
  name: string;
  type: string[];
  templateId?: string;
  content: string;
  status: string;
  vendorId: string;
  createdBy: string;
  targetAudience: string;
  scheduledDate: string;
  budget: number;
  metrics: {
    messagesSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
  createdAt: string;
  updatedAt: string;
};

interface CampaignDetailsModalProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200';
    case 'Draft':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200';
    case 'Completed':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
    default:
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200';
  }
};

export function CampaignDetailsModal({ campaign, open, onOpenChange }: CampaignDetailsModalProps) {
  if (!campaign) return null;

  const hasSentMessages = campaign.metrics?.messagesSent > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{campaign.name}</DialogTitle>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {campaign.type.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
              >
                {t}
              </span>
            ))}
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${statusColor(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Message / Content */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Message
            </p>
            <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap border">
              {campaign.content}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow
              icon={<Users className="h-4 w-4 text-primary" />}
              label="Target Audience"
              value={campaign.targetAudience || '—'}
            />
            {campaign.budget > 0 && (
              <InfoRow
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                label="Budget"
                value={`₹${campaign.budget.toLocaleString()}`}
              />
            )}
            {campaign.scheduledDate && (
              <InfoRow
                icon={<Clock className="h-4 w-4 text-primary" />}
                label="Scheduled Date"
                value={new Date(campaign.scheduledDate).toLocaleString()}
              />
            )}
            <InfoRow
              icon={<Calendar className="h-4 w-4 text-primary" />}
              label="Created"
              value={new Date(campaign.createdAt).toLocaleDateString()}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              label="Last Updated"
              value={new Date(campaign.updatedAt).toLocaleDateString()}
            />
          </div>

          {/* Metrics */}
          {hasSentMessages ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <BarChart2 className="h-3.5 w-3.5" /> Performance Metrics
              </p>
              <div className="grid grid-cols-3 gap-3">
                <MetricCard label="Sent" value={campaign.metrics.messagesSent} />
                <MetricCard label="Delivered" value={campaign.metrics.delivered} />
                <MetricCard label="Opened" value={campaign.metrics.opened} />
                <MetricCard label="Clicked" value={campaign.metrics.clicked} />
                <MetricCard label="Delivery Rate" value={`${campaign.metrics.deliveryRate.toFixed(1)}%`} />
                <MetricCard label="Open Rate" value={`${campaign.metrics.openRate.toFixed(1)}%`} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span>No messages sent yet. Launch this campaign to start tracking metrics.</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
