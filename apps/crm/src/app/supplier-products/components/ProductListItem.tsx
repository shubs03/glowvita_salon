import Image from 'next/image';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface Product {
  _id: string;
  productImages: string[];
  productName: string;
  price: number;
  salePrice: number;
  category: string;
  stock: number;
  isActive: boolean;
  description?: string;
  status: 'pending' | 'approved' | 'disapproved' | 'rejected';
  rejectionReason?: string;
  size?: string;
  sizeMetric?: string;
  keyIngredients?: string[];
  forBodyPart?: string;
  bodyPartType?: string;
  productForm?: string;
  brand?: string;
  vendorId?: { name: string };
  supplierName?: string;
}

interface ProductListItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
}

const ProductListItem = ({ product, onEdit, onDelete, onView }: ProductListItemProps) => {
  const calculateDiscountPercentage = () => {
    if (product.price > product.salePrice) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    return 0;
  };

  const discountPercentage = calculateDiscountPercentage();

  return (
    <Card
      key={product._id}
      className="border border-border bg-card rounded-lg transition-all duration-200"
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border/30 flex-shrink-0">
            <Image
              src={product.productImages?.[0] || 'https://placehold.co/80x80.png'}
              alt={product.productName}
              fill
              className="object-cover"
            />
            {discountPercentage > 0 && product.stock > 0 && (
              <div className="absolute -top-1 -right-1">
                <Badge className="bg-primary text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                  {discountPercentage}%
                </Badge>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-1">
                <h3 className="font-medium text-foreground">
                  {product.productName}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                  <StatusBadge status={product.status} rejectionReason={product.rejectionReason} />
                  <Badge
                    variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {product.stock > 0 ? `${product.stock} units` : "Out of Stock"}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Supplier: {product.supplierName || product.vendorId?.name || 'Self'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="mb-2">
                  <span className="font-semibold text-primary">
                    ₹{product.salePrice.toFixed(0)}
                  </span>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(product)}
                    className="h-7 px-2 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(product)}
                    className="h-7 px-2 text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductListItem;

