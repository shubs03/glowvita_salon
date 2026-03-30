import { Input } from '@repo/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { ExportButtons } from '@/components/ExportButtons';
import { Staff } from '../page';

interface StaffFiltersToolbarProps {
  searchTerm: string;
  positionFilter: string;
  onSearchChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  commissionStatus: string;
  onCommissionStatusChange: (value: string) => void;
  onAddStaff: () => void;
  exportData?: Staff[];
  positions: string[];
}

const StaffFiltersToolbar = ({
  searchTerm,
  positionFilter,
  onSearchChange,
  onPositionChange,
  commissionStatus,
  onCommissionStatusChange,
  onAddStaff,
  exportData,
  positions
}: StaffFiltersToolbarProps) => {
  return (
    <div className=" rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or phone..."
            className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={positionFilter} onValueChange={onPositionChange}>
            <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-lg border-border hover:border-primary">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border/40">
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((position, index) => (
                <SelectItem key={index} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={commissionStatus} onValueChange={onCommissionStatusChange}>
            <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-lg border-border hover:border-primary">
              <SelectValue placeholder="Commission" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border/40">
              <SelectItem value="all">All Commission</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
              <SelectItem value="has_balance">Has Balance</SelectItem>
            </SelectContent>
          </Select>
          {exportData && (
            <ExportButtons
              data={exportData}
              filename="staff_export"
              title="Staff Report"
              columns={[
                { header: 'Name', key: 'fullName' },
                { header: 'Email', key: 'emailAddress' },
                { header: 'Phone', key: 'mobileNo' },
                { header: 'Position', key: 'position' },
                { header: 'Commission', key: 'commission' },
                { header: 'Commission Rate (%)', key: 'commissionRate' },
                { header: 'Status', key: 'status' }
              ]}
              className="h-12"
            />
          )}
          <Button
            onClick={onAddStaff}
            className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffFiltersToolbar;