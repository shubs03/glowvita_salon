import { Input } from '@repo/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Button } from '@repo/ui/button';
import { Grid3X3, List, Plus } from 'lucide-react';

interface FiltersToolbarProps {
  searchTerm: string;
  statusFilter: string;
  viewMode: 'grid' | 'list';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddProduct: () => void;
}

const FiltersToolbar = ({
  searchTerm,
  statusFilter,
  viewMode,
  onSearchChange,
  onStatusChange,
  onViewModeChange,
  onAddProduct
}: FiltersToolbarProps) => {
  return (
    <div className=" rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="disapproved">Disapproved</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border border-border rounded-lg p-1 w-full sm:w-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-md flex-1 min-w-[40px]"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-md flex-1 min-w-[40px]"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              onClick={onAddProduct}
              className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersToolbar;