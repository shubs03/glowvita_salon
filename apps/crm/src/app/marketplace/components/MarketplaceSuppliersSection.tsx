import { Card, CardContent } from "@repo/ui/card";
import { Search, Users } from 'lucide-react';
import { SupplierCard } from './SupplierCard';

interface Supplier {
  _id: string;
  shopName: string;
  email: string;
  city?: string;
  country?: string;
  profileImage?: string;
  productCount: number;
  totalStock: number;
  averagePrice?: number;
  rating?: number;
}

interface MarketplaceSuppliersSectionProps {
  filteredSuppliers: Supplier[];
  isLoading: boolean;
  searchTerm: string;
  viewMode: 'grid' | 'list';
  onSupplierClick: (supplier: Supplier) => void;
}

export const MarketplaceSuppliersSection = ({
  filteredSuppliers,
  isLoading,
  searchTerm,
  viewMode,
  onSupplierClick
}: MarketplaceSuppliersSectionProps) => {
  return (
    <Card className="bg-card border border-border rounded-lg">
      <CardContent className="p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSuppliers.map((supplier: Supplier) => (
              <SupplierCard
                key={supplier._id}
                supplier={supplier}
                onClick={onSupplierClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSuppliers.map((supplier: Supplier) => (
              <Card
                key={supplier._id}
                className="border border-border bg-card rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
                onClick={() => onSupplierClick(supplier)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                      <img
                        src={supplier.profileImage || 'https://placehold.co/80x80.png'}
                        alt={supplier.shopName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-1">
                          <h3 className="font-bold text-lg text-foreground">
                            {supplier.shopName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {supplier.city || 'Unknown'}, {supplier.country || 'Location'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            <span className="font-semibold text-primary text-sm">
                              {supplier.productCount} Products
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">
                              {supplier.totalStock} in stock
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {filteredSuppliers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 mb-4 bg-muted/20 rounded-xl flex items-center justify-center border border-border">
              <Users className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">No suppliers found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
              {searchTerm 
                ? "No suppliers match your search criteria. Try different keywords."
                : "No verified suppliers available at the moment."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
