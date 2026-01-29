import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Skeleton } from '@repo/ui/skeleton';
import { Star, Package, User, MessageSquare, CheckCircle, Clock, XCircle, Trash2, Eye } from 'lucide-react';
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

interface ReviewsTableProps {
  filteredReviews: Review[];
  isLoading: boolean;
  searchTerm: string;
  onViewReview: (review: Review) => void;
  onApproveReview: (reviewId: string, isApproved: boolean) => void;
  onDeleteReview: (review: Review) => void;
  isApproving: boolean;
}

const ReviewsTable = ({
  filteredReviews,
  isLoading,
  searchTerm,
  onViewReview,
  onApproveReview,
  onDeleteReview,
  isApproving
}: ReviewsTableProps) => {
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
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Entity</TableHead>
              <TableHead className="min-w-[100px]">Type</TableHead>
              <TableHead className="min-w-[120px]">Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="min-w-[200px]">Review</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No reviews found matching your criteria' : 'Reviews from customers for your products, services, salon, and doctors will appear here'}
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review._id} className="hover:bg-muted/50">
                  <TableCell className="font-medium py-3 min-w-[120px] max-w-[150px]">
                    <div className="flex items-center gap-3">
                      {getEntityImage(review) ? (
                        <Image
                          src={getEntityImage(review)!}
                          alt={getEntityName(review)}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : review.entityType === 'doctor' ? (
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold truncate max-w-[80px]">{getEntityName(review)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[100px] capitalize">
                    <p className="font-medium text-sm">{review.entityType}</p>
                  </TableCell>
                  <TableCell className="min-w-[120px] max-w-[150px] truncate">
                    <p className="font-medium text-sm">{review.userName}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < review.rating 
                              ? 'text-primary fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-sm ml-1">({review.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[200px] max-w-[250px] truncate">
                    <p className="text-sm line-clamp-2">{review.comment}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {format(new Date(review.createdAt), 'hh:mm a')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={review.isApproved ? 'default' : 'secondary'}
                      className="w-fit"
                    >
                      {review.isApproved ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewReview(review)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!review.isApproved && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onApproveReview(review._id, true)}
                          disabled={isApproving}
                          className="h-8 w-8 p-0"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {review.isApproved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onApproveReview(review._id, false)}
                          disabled={isApproving}
                          className="h-8 w-8 p-0"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteReview(review)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReviewsTable;