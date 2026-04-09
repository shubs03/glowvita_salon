import { Input } from '@repo/ui/input';
import { Search, Grid3X3, List, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Button } from '@repo/ui/button';

interface FiltersToolbarProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  availableCategories: string[];
  viewMode: 'grid' | 'list';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddProduct: () => void;
}

const FiltersToolbar = ({
  searchTerm,
  statusFilter,
  categoryFilter,
  availableCategories,
  viewMode,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onViewModeChange,
  onAddProduct,
}: FiltersToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px] h-12 rounded-lg border-border hover:border-primary">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border border-border/40">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="disapproved">Disapproved</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[160px] h-12 rounded-lg border-border hover:border-primary">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border border-border/40">
            <SelectItem value="all">All Categories</SelectItem>
            {availableCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-md min-w-[40px]"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-md min-w-[40px]"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Add Product */}
        <Button
          onClick={onAddProduct}
          className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default FiltersToolbar;
