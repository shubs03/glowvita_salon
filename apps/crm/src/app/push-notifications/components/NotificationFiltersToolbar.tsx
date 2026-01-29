import { Input } from '@repo/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { ExportButtons } from '@/components/ExportButtons';
import { Notification } from '../types';

interface NotificationFiltersToolbarProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAddNotification: () => void;
  exportData?: Notification[];
}

const NotificationFiltersToolbar = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onAddNotification,
  exportData
}: NotificationFiltersToolbarProps) => {
  return (
    <div className=" rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or content..."
            className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-lg border-border hover:border-primary">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border/40">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          {exportData && (
            <ExportButtons
              data={exportData}
              filename="notifications_export"
              title="Notifications Report"
              columns={[
                { header: 'Title', key: 'title' },
                { header: 'Channels', key: 'channels' },
                { header: 'Target', key: 'targetType' },
                { header: 'Date', key: 'date' },
                { header: 'Status', key: 'status' }
              ]}
              className="h-12"
            />
          )}
          <Button 
            onClick={onAddNotification}
            className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationFiltersToolbar;