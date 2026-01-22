import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
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
  size?: string;
  sizeMetric?: string;
  keyIngredients?: string[];
  forBodyPart?: string;
  bodyPartType?: string;
  productForm?: string;
  brand?: string;
  vendorId?: { name: string };
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
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
      className="group overflow-hidden hover:shadow-md transition-shadow flex flex-col text-left"
    >
      <div className="relative aspect-square overflow-hidden rounded-md m-3">
        <Image
          src={product.productImages?.[0] || 'https://placehold.co/300x300.png'}
          alt={product.productName}
          fill
          className="group-hover:scale-105 transition-transform duration-300 object-cover"
        />
        {/* Status Badge */}
        <div className="absolute top-2 left-2 text-xs">
          <StatusBadge status={product.status} />
        </div>
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute -top-1 -right-1">
            <div className="bg-primary text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
              {discountPercentage}%
            </div>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <p className="text-xs font-bold text-primary mb-1">
          {product.category}
        </p>
        <h4 className="text-sm font-semibold flex-grow mb-2">
          {product.productName}
        </h4>
        {product.size && product.sizeMetric ? (
          <p className="text-xs text-muted-foreground">
            Size: {product.size} {product.sizeMetric}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            No size info
          </p>
        )}
        <div className="flex justify-between items-center mt-auto">
          <p className="font-bold text-primary">
            ₹{product.salePrice.toFixed(2)}
          </p>
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