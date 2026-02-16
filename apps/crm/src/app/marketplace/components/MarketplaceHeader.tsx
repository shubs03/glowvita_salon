import { ShoppingCart, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@repo/ui/button';

interface MarketplaceHeaderProps {
  viewMode?: 'suppliers' | 'products';
  selectedSupplier?: { shopName: string } | null;
  onBack?: () => void;
}

export const MarketplaceHeader = ({ 
  viewMode = 'suppliers', 
  selectedSupplier = null,
  onBack 
}: MarketplaceHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          {viewMode === 'products' && selectedSupplier ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Suppliers
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span 
                  onClick={onBack}
                  className="cursor-pointer hover:text-primary transition-colors"
                >
                  Suppliers
                </span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{selectedSupplier.shopName}</span>
              </div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                {selectedSupplier.shopName}'s Products
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Browse and order products from this verified supplier
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Marketplace
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Discover and connect with verified suppliers worldwide
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};