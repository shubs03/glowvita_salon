import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Skeleton } from '@repo/ui/skeleton';
import { Star, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';

interface Supplier {
  _id: string;
  shopName: string;
  email: string;
  country: string;
  city: string;
  description: string;
  profileImage: string;
}

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  isLoading: boolean;
}

export const SupplierModal = ({
  isOpen,
  onClose,
  supplier,
  isLoading
}: SupplierModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Supplier Profile</DialogTitle>
          <DialogDescription>Verified supplier information</DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex-1 p-4 space-y-3">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-3 w-1/2 mx-auto" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : supplier ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center">
              <div className="relative inline-block">
                <Image 
                  src={supplier.profileImage || 'https://placehold.co/60x60.png'} 
                  alt={supplier.shopName} 
                  width={60} 
                  height={60} 
                  className="rounded-full mx-auto border-2 border-primary/20 shadow-lg" 
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-base font-bold mt-2">{supplier.shopName}</h3>
              <Badge variant="secondary" className="rounded-full text-xs mt-1">
                Verified Supplier
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{supplier.city}, {supplier.country}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-medium">4.8 (120 reviews)</span>
            </div>

            {supplier.description && (
              <div className="bg-muted/20 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">About</h4>
                <p className="text-sm text-muted-foreground">
                  {supplier.description}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};