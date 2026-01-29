import { Input } from '@repo/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Button } from '@repo/ui/button';
import { ExportButtons } from '@/components/ExportButtons';

interface Column {
  header: string;
  key: string;
  transform?: (value: any, item: any) => string;
}

interface SettlementsFiltersToolbarProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  exportData?: any[];
  exportColumns?: Column[];
  exportFilename?: string;
  exportTitle?: string;
}

const SettlementsFiltersToolbar = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  exportData,
  exportColumns,
  exportFilename,
  exportTitle
}: SettlementsFiltersToolbarProps) => {
  return (
    <div className=" rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search settlements..."
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-3 w-full sm:w-auto">
            {exportData && exportColumns && exportFilename && exportTitle && (
              <ExportButtons
                data={exportData}
                filename={exportFilename}
                title={exportTitle}
                columns={exportColumns}
                className="w-full md:w-auto h-12"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementsFiltersToolbar;