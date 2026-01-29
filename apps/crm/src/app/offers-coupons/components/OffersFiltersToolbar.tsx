import { Input } from '@repo/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface OffersFiltersToolbarProps {
  onAddCoupon: () => void;
  getCreateButtonText: () => string;
}

const OffersFiltersToolbar = ({
  onAddCoupon,
  getCreateButtonText
}: OffersFiltersToolbarProps) => {
  return (
    <div className="rounded-lg">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Manage Coupons</h2>
          <p className="text-muted-foreground">Create, edit, and manage your promotional coupons.</p>
        </div>
        <Button onClick={onAddCoupon} className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          {getCreateButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default OffersFiltersToolbar;