import { Input } from '@repo/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface ProductQuestionsFiltersProps {
  searchTerm: string;
  filterStatus: 'all' | 'answered' | 'unanswered';
  onSearchChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'answered' | 'unanswered') => void;
}

const ProductQuestionsFilters = ({
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange
}: ProductQuestionsFiltersProps) => {
  return (
    <div className="rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search questions, products, or customers..."
            className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('all')}
              className="h-12 px-4 rounded-lg"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'unanswered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('unanswered')}
              className="h-12 px-4 rounded-lg"
            >
              Unanswered
            </Button>
            <Button
              variant={filterStatus === 'answered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('answered')}
              className="h-12 px-4 rounded-lg"
            >
              Answered
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuestionsFilters;