"use client";

import Image from "next/image";
import { Card, CardContent } from "@repo/ui/card";
import { MapPin, Package, FileText } from "lucide-react";

interface SupplierCardProps {
  supplier: {
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
    businessRegistrationNo?: string;
  };
  onClick: (supplier: any) => void;
}

export function SupplierCard({ supplier, onClick }: SupplierCardProps) {
  const displayCity = supplier.city || "Unknown";
  const displayCountry = supplier.country || "Location";

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-border hover:border-primary/50"
      onClick={() => onClick(supplier)}
    >
      <CardContent className="p-6">
        {/* Image */}
        <div className="flex justify-center mb-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20">
            <Image
              src={supplier.profileImage || 'https://placehold.co/80x80.png'}
              alt={supplier.shopName}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Supplier Name */}
        <h3 className="font-bold text-lg mb-2 text-center truncate group-hover:text-primary transition-colors">
          {supplier.shopName}
        </h3>

        {/* Location */}
        <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {displayCity}, {displayCountry}
          </span>
        </div>

        {/* Registration Number */}
        {supplier.businessRegistrationNo && (
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-3">
            <FileText className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              Reg : {supplier.businessRegistrationNo}
            </span>
          </div>
        )}

        {/* Product Count */}
        <div className="flex items-center justify-center gap-2 bg-primary/5 rounded-lg p-3 border border-primary/10">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {supplier.productCount} {supplier.productCount === 1 ? 'Product' : 'Products'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
