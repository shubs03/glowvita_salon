import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Star, Package, User } from 'lucide-react';
import { Badge } from '@repo/ui/badge';
import { format } from 'date-fns';
import Image from 'next/image';

interface Review {
  _id: string;
  entityId: string;
  entityType: 'product' | 'service' | 'salon' | 'doctor';
  entityDetails?: {
    _id: string;
    productName?: string;
    serviceName?: string;
    salonName?: string;
    name?: string;
    specialties?: string[];
    experience?: string;
    productImages?: string[];
    price?: number;
    category?: string;
  };
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsViewDialogProps {
  isOpen: boolean;
  selectedReview: Review | null;
  onClose: () => void;
}

const ReviewsViewDialog = ({
  isOpen,
  selectedReview,
  onClose
}: ReviewsViewDialogProps) => {
  // Get entity name
  const getEntityName = (review: Review) => {
    if (review.entityType === 'product') {
      return review.entityDetails?.productName || 'Product';
    } else if (review.entityType === 'service') {
      return review.entityDetails?.serviceName || 'Service';
    } else if (review.entityType === 'doctor') {
      return review.entityDetails?.name || 'Doctor';
    } else {
      return review.entityDetails?.salonName || 'Salon';
    }
  };

  // Get entity image
  const getEntityImage = (review: Review) => {
    if (review.entityType === 'product') {
      return review.entityDetails?.productImages?.[0] || null;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {getEntityImage(selectedReview) ? (
                <Image
                  src={getEntityImage(selectedReview)!}
                  alt={getEntityName(selectedReview)}
                  width={80}
                  height={80}
                  className="rounded object-cover"
                />
              ) : selectedReview.entityType === 'doctor' ? (
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{getEntityName(selectedReview)}</h3>
                <p className="text-sm text-muted-foreground capitalize">{selectedReview.entityType}</p>
                {selectedReview.entityDetails?.price && (
                  <p className="text-sm">₹{selectedReview.entityDetails.price}</p>
                )}
                {selectedReview.entityType === 'doctor' && selectedReview.entityDetails?.specialties && (
                  <p className="text-sm text-muted-foreground">
                    {selectedReview.entityDetails.specialties.join(', ')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold">{selectedReview.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedReview.createdAt), 'MMMM dd, yyyy · hh:mm a')}
                  </p>
                </div>
                <Badge variant={selectedReview.isApproved ? 'default' : 'secondary'}>
                  {selectedReview.isApproved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${
                      i < selectedReview.rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
                <span className="ml-2 font-semibold">{selectedReview.rating} out of 5</span>
              </div>
              
              <p className="text-sm">{selectedReview.comment}</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewsViewDialog;