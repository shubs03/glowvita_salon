import { Card, CardContent } from '@repo/ui/card';
import { ShoppingCart, Package, Users, DollarSign } from 'lucide-react';

interface MarketplaceStats {
  totalProducts: number;
  totalSuppliers: number;
  totalValue: number;
  averageRating: number;
}

interface MarketplaceStatsCardsProps {
  stats: MarketplaceStats;
  viewMode?: 'suppliers' | 'products';
  selectedSupplier?: { shopName: string; totalStock?: number } | null;
}

export const MarketplaceStatsCards = ({ 
  stats, 
  viewMode = 'suppliers',
  selectedSupplier = null 
}: MarketplaceStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">
                {viewMode === 'suppliers' ? 'Total Products' : 'Supplier Products'}
              </p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{stats.totalProducts}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">
                {viewMode === 'suppliers' ? 'Available for purchase' : `From ${selectedSupplier?.shopName || 'this supplier'}`}
              </p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <Package className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">
                {viewMode === 'suppliers' ? 'Suppliers' : 'Total Stock'}
              </p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                {viewMode === 'suppliers' ? stats.totalSuppliers : (selectedSupplier?.totalStock || 0)}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">
                {viewMode === 'suppliers' ? 'Verified suppliers' : 'Items available'}
              </p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <Users className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Market Value</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">₹{stats.totalValue.toLocaleString()}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Total inventory value</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <DollarSign className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Avg Rating</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{stats.averageRating.toFixed(1)}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Customer satisfaction</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <ShoppingCart className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};