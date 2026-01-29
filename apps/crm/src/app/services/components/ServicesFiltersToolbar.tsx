import { Input } from '@repo/ui/input';
import { Search, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Button } from '@repo/ui/button';
import { ExportButtons } from '@/components/ExportButtons';
import { useDispatch } from 'react-redux';
import { setSearchTerm } from "@repo/store/slices/serviceSlice";

interface Column {
  header: string;
  key: string;
  transform?: (value: any, item: any) => string;
}

interface ServicesFiltersToolbarProps {
  searchTerm: string;
  statusFilter: string;
  onAddService: () => void;
  onStatusChange: (value: string) => void;
  exportData?: any[];
  exportColumns?: Column[];
  exportFilename?: string;
  exportTitle?: string;
}

const ServicesFiltersToolbar = ({
  searchTerm,
  statusFilter,
  onAddService,
  onStatusChange,
  exportData,
  exportColumns,
  exportFilename,
  exportTitle
}: ServicesFiltersToolbarProps) => {
  const dispatch = useDispatch();

  return (
    <div className=" rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services..."
            className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-lg border-border hover:border-primary">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border/40">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="disapproved">Disapproved</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {exportData && exportColumns && (
              <ExportButtons
                data={exportData}
                filename={exportFilename || "services_export"}
                title={exportTitle || "Services Report"}
                columns={exportColumns}
                className="h-12 px-4 rounded-lg"
              />
            )}
            <Button
              onClick={onAddService}
              className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesFiltersToolbar;