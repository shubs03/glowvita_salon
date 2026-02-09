import Image from 'next/image';
import { Card, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Edit, Trash2, Star } from 'lucide-react';
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

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow flex flex-col text-left">
      <div className="relative aspect-square overflow-hidden rounded-md m-3">
        <Image
          src={product.productImages?.[0] || 'https://placehold.co/300x300.png'}
          alt={product.productName}
          fill
          className="group-hover:scale-105 transition-transform duration-300 object-cover"
        />
        <Badge
          variant={product.stock > 0 ? "secondary" : "default"}
          className="absolute top-2 right-2 text-xs"
        >
          {product.stock > 0 ? `In Stock` : "Out of Stock"}
        </Badge>
        <div className="absolute top-2 left-2 text-xs">
          <StatusBadge status={product.status} />
        </div>
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <p className="text-xs font-bold text-primary mb-1">
          {product.category}
        </p>
        <h4 className="text-sm font-semibold flex-grow mb-2">
          {product.productName}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {product.description || "No description available"}
        </p>
        <div className="flex justify-between items-center mt-auto">
          <p className="font-bold text-primary">
            ₹{product.salePrice.toFixed(2)}
          </p>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-blue-400 fill-current" />
            <span className="text-xs text-muted-foreground font-medium">
              {(4.2 + Math.random() * 0.8).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex justify-between w-full">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs lg:mr-3"
              onClick={(e) => { 
                e.stopPropagation(); 
                onEdit(product); 
              }}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="w-fit text-xs"
              onClick={(e) => { 
                e.stopPropagation(); 
                onDelete(product); 
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
