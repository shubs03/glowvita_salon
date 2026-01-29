import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { Search, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";

interface AddOnsFiltersToolbarProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAddNew: () => void;
}

const AddOnsFiltersToolbar = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onAddNew
}: AddOnsFiltersToolbarProps) => {
  return (
    <div className="rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search add-ons..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              onClick={onAddNew}
              className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Add-On
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOnsFiltersToolbar;