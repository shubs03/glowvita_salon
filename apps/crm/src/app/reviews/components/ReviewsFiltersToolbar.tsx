import { Input } from '@repo/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@repo/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select';
import { Checkbox } from '@repo/ui/checkbox';

interface ReviewsFiltersToolbarProps {
  searchTerm: string;
  filterStatus: 'all' | 'approved' | 'pending';
  filterType: 'all' | 'product' | 'service' | 'salon' | 'doctor';
  onSearchChange: (value: string) => void;
  onFilterStatusChange: (value: 'all' | 'approved' | 'pending') => void;
  onFilterTypeChange: (value: 'all' | 'product' | 'service' | 'salon' | 'doctor') => void;
}

interface MultiSelectOption {
  value: string;
  label: string;
}

const ReviewsFiltersToolbar = ({
  searchTerm,
  filterStatus,
  filterType,
  onSearchChange,
  onFilterStatusChange,
  onFilterTypeChange
}: ReviewsFiltersToolbarProps) => {
  // Define filter options
  const statusOptions: MultiSelectOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
  ];

  const typeOptions: MultiSelectOption[] = [
    { value: 'all', label: 'All Types' },
    { value: 'product', label: 'Products' },
    { value: 'service', label: 'Services' },
    { value: 'salon', label: 'Salon' },
    { value: 'doctor', label: 'Doctors' },
  ];

  return (
    <div className="rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow min-w-0 w-full sm:min-w-[380px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by reviews, products, or customers..."
            className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full">
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger className="h-12 px-4 rounded-lg w-full sm:w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={onFilterTypeChange}>
            <SelectTrigger className="h-12 px-4 rounded-lg w-full sm:w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ReviewsFiltersToolbar;