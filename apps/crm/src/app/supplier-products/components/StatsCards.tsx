import { Card, CardContent } from '@repo/ui/card';
import { Boxes, PackageCheck, Tag, DollarSign } from 'lucide-react';

interface ProductStats {
  totalProducts: number;
  pendingProducts: number;
  categories: number;
  totalValue: number;
}

interface FilteredProductStats {
  filteredTotalValue: number;
  filteredCategories: number;
}

interface StatsCardsProps {
  productStats: ProductStats;
  filteredProductStats: FilteredProductStats;
}

const StatsCards = ({ productStats, filteredProductStats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Products</p>
              <p className="text-2xl font-bold text-primary">{productStats.totalProducts}</p>
              <p className="text-xs text-primary/70 mt-1">In your catalog</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Boxes className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Pending Products</p>
              <p className="text-2xl font-bold text-secondary-foreground">{productStats.pendingProducts}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Awaiting approval</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <PackageCheck className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Categories</p>
              <p className="text-2xl font-bold text-foreground">{filteredProductStats.filteredCategories}</p>
              <p className="text-xs text-muted-foreground mt-1">Product types</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Tag className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Total Value</p>
              <p className="text-2xl font-bold text-foreground">₹{filteredProductStats.filteredTotalValue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Inventory worth</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <DollarSign className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
