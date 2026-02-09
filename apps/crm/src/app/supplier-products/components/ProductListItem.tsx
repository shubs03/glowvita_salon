import Image from 'next/image';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
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
  status: 'pending' | 'approved' | 'disapproved';
}

interface ProductListItemProps {
  product: Product;
  index: number;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductListItem = ({ product, index, onEdit, onDelete }: ProductListItemProps) => {
  return (
    <Card 
      className="group relative overflow-hidden border border-border hover:border-border/80 shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-xl hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-5">
          {/* Product Image */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/30 bg-muted/20 shadow-sm flex-shrink-0">
            <Image 
              src={product.productImages?.[0] || 'https://placehold.co/80x80.png'} 
              alt={product.productName} 
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {product.price > product.salePrice && (
              <div className="absolute -top-1 -right-1">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                  {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                  {product.productName}
                </h3>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="rounded-full border-border/40 text-xs">
                    {product.category}
                  </Badge>
                  <StatusBadge status={product.status} />
                  <Badge 
                    variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
                    className="rounded-full text-xs"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                      product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    {product.stock} units
                  </Badge>
                </div>
              </div>
              
              <div className="text-right ml-5">
                {/* Price section */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                      ₹{product.salePrice.toFixed(0)}
                    </span>
                    {product.price > product.salePrice && (
                      <span className="text-sm line-through text-muted-foreground">
                        ₹{product.price.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="rounded-lg border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 px-3"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(product)}
                    className="rounded-lg transition-all duration-300 hover:scale-105 px-3"
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
