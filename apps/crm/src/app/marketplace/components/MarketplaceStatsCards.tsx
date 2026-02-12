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
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">
                {viewMode === 'suppliers' ? 'Total Products' : 'Supplier Products'}
              </p>
              <p className="text-2xl font-bold text-primary">{stats.totalProducts}</p>
              <p className="text-xs text-primary/70 mt-1">
                {viewMode === 'suppliers' ? 'Available for purchase' : `From ${selectedSupplier?.shopName || 'this supplier'}`}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">
                {viewMode === 'suppliers' ? 'Suppliers' : 'Total Stock'}
              </p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {viewMode === 'suppliers' ? stats.totalSuppliers : (selectedSupplier?.totalStock || 0)}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">
                {viewMode === 'suppliers' ? 'Verified suppliers' : 'Items available'}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Market Value</p>
              <p className="text-2xl font-bold text-primary">₹{stats.totalValue.toLocaleString()}</p>
              <p className="text-xs text-primary/70 mt-1">Total inventory value</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Avg Rating</p>
              <p className="text-2xl font-bold text-secondary-foreground">{stats.averageRating.toFixed(1)}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Customer satisfaction</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <ShoppingCart className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};