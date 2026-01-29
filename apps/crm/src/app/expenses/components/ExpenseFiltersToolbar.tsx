import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Button } from "@repo/ui/button";
import { Search, Filter, FileDown, Plus, X } from 'lucide-react';
import { Expense } from '../page';

interface ExpenseFiltersToolbarProps {
  searchTerm: string;
  showFilters: boolean;
  filters: {
    paymentMode: string;
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
  };
  paymentModes: any[];
  isLoadingPaymentModes: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onExport: () => void;
  onAddExpense: () => void;
}

const ExpenseFiltersToolbar = ({
  searchTerm,
  showFilters,
  filters,
  paymentModes,
  isLoadingPaymentModes,
  hasActiveFilters,
  onSearchChange,
  onToggleFilters,
  onFilterChange,
  onClearFilters,
  onExport,
  onAddExpense
}: ExpenseFiltersToolbarProps) => {
  return (
    <div className=" rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenses..."
            className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            variant={showFilters ? "default" : "outline"}
            onClick={onToggleFilters}
            className="h-12 rounded-lg"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" onClick={onExport} className="h-12 rounded-lg">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={onAddExpense} className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90 flex-1">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Filter Options</h3>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClearFilters}
              >
                <X className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Payment Mode Filter */}
            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <select
                id="paymentMode"
                value={filters.paymentMode}
                onChange={(e) => onFilterChange('paymentMode', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isLoadingPaymentModes}
              >
                <option value="All">
                  {isLoadingPaymentModes ? 'Loading...' : 'All Payment Modes'}
                </option>
                {paymentModes.map((mode: any) => (
                  <option key={mode._id} value={mode.name}>
                    {mode.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="startDate">From Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => onFilterChange('startDate', e.target.value)}
              />
            </div>

            {/* End Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="endDate">To Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => onFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Min Amount Filter */}
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Amount (₹)</Label>
              <Input
                id="minAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => onFilterChange('minAmount', e.target.value)}
              />
            </div>

            {/* Max Amount Filter */}
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Amount (₹)</Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="No limit"
                value={filters.maxAmount}
                onChange={(e) => onFilterChange('maxAmount', e.target.value)}
              />
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  <span>Search: {searchTerm}</span>
                  <button onClick={() => onSearchChange('')} className="hover:text-primary/80">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.paymentMode !== 'All' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  <span>Mode: {filters.paymentMode}</span>
                  <button onClick={() => onFilterChange('paymentMode', 'All')} className="hover:text-primary/80">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.startDate && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  <span>From: {new Date(filters.startDate).toLocaleDateString('en-IN')}</span>
                  <button onClick={() => onFilterChange('startDate', '')} className="hover:text-primary/80">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.endDate && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  <span>To: {new Date(filters.endDate).toLocaleDateString('en-IN')}</span>
                  <button onClick={() => onFilterChange('endDate', '')} className="hover:text-primary/80">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.minAmount && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  <span>Min: ₹{filters.minAmount}</span>
                  <button onClick={() => onFilterChange('minAmount', '')} className="hover:text-primary/80">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.maxAmount && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  <span>Max: ₹{filters.maxAmount}</span>
                  <button onClick={() => onFilterChange('maxAmount', '')} className="hover:text-primary/80">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseFiltersToolbar;