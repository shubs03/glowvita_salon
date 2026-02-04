import { Input } from '@repo/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface PackageFiltersToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddPackage: () => void;
}

export function PackageFiltersToolbar({
  searchTerm,
  onSearchChange,
  onAddPackage,
}: PackageFiltersToolbarProps) {
  return (
    <div className="rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or description..."
            className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            onClick={onAddPackage}
            className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Package
          </Button>
        </div>
      </div>
    </div>
  );
}
