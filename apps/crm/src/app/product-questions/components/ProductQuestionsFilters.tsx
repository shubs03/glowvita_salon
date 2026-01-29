import { Card, CardHeader } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Search } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions, products, or customers..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'unanswered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('unanswered')}
            >
              Unanswered
            </Button>
            <Button
              variant={filterStatus === 'answered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('answered')}
            >
              Answered
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ProductQuestionsFilters;