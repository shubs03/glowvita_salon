"use client";

import { useState, useMemo } from 'react';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Skeleton } from '@repo/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import {
  Star,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Loader2,
  ThumbsUp,
  Package,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetCrmReviewsQuery,
  useApproveReviewMutation,
  useDeleteReviewMutation,
} from '@repo/store/api';
import { format } from 'date-fns';
import Image from 'next/image';

// Types
type Review = {
  _id: string;
  entityId: string;
  entityType: 'product' | 'service' | 'salon';
  entityDetails?: {
    _id: string;
    productName?: string;
    serviceName?: string;
    salonName?: string;
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
};

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service' | 'salon'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // Fetch reviews
  const { data: reviewsResponse, isLoading, refetch } = useGetCrmReviewsQuery({ 
    filter: filterStatus,
    entityType: filterType 
  });
  const [approveReview, { isLoading: isApproving }] = useApproveReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const reviews = reviewsResponse?.reviews || [];

  // Filter reviews based on search
  const filteredReviews = useMemo(() => {
    return reviews.filter((r: Review) => {
      const searchLower = searchTerm.toLowerCase();
      const entityName = r.entityDetails?.productName || r.entityDetails?.serviceName || r.entityDetails?.salonName || '';
      return (
        r.comment.toLowerCase().includes(searchLower) ||
        r.userName.toLowerCase().includes(searchLower) ||
        entityName.toLowerCase().includes(searchLower)
      );
    });
  }, [reviews, searchTerm]);

  // Handle view review
  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };

  // Handle approve review
  const handleApproveReview = async (reviewId: string, isApproved: boolean) => {
    try {
      await approveReview({ reviewId, isApproved }).unwrap();
      toast.success(isApproved ? 'Review approved successfully' : 'Review rejected successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update review');
    }
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReview(reviewToDelete._id).unwrap();
      toast.success('Review deleted successfully');
      setIsDeleteDialogOpen(false);
      setReviewToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete review');
    }
  };

  // Get entity name
  const getEntityName = (review: Review) => {
    if (review.entityType === 'product') {
      return review.entityDetails?.productName || 'Product';
    } else if (review.entityType === 'service') {
      return review.entityDetails?.serviceName || 'Service';
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and moderate customer reviews for your products, services, and salon
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter((r: Review) => r.isApproved).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter((r: Review) => !r.isApproved).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews, products, or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('approved')}
                >
                  Approved
                </Button>
              </div>
              <div className="flex gap-1">
                <Button
                  variant={filterType === 'all' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  All Types
                </Button>
                <Button
                  variant={filterType === 'product' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('product')}
                >
                  Products
                </Button>
                <Button
                  variant={filterType === 'service' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('service')}
                >
                  Services
                </Button>
                <Button
                  variant={filterType === 'salon' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('salon')}
                >
                  Salon
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews List</CardTitle>
          <CardDescription>
            {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Reviews from customers will appear here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product/Service</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review: Review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getEntityImage(review) ? (
                            <Image
                              src={getEntityImage(review)!}
                              alt={getEntityName(review)}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {getEntityName(review)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {review.entityType}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{review.userName}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < review.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                          <span className="text-sm ml-1">({review.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm line-clamp-2">{review.comment}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReview(review)}
                          >
                            View
                          </Button>
                          {!review.isApproved && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveReview(review._id, true)}
                              disabled={isApproving}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {review.isApproved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveReview(review._id, false)}
                              disabled={isApproving}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setReviewToDelete(review);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {getEntityImage(selectedReview) && (
                  <Image
                    src={getEntityImage(selectedReview)!}
                    alt={getEntityName(selectedReview)}
                    width={80}
                    height={80}
                    className="rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{getEntityName(selectedReview)}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{selectedReview.entityType}</p>
                  {selectedReview.entityDetails?.price && (
                    <p className="text-sm">₹{selectedReview.entityDetails.price}</p>
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
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setReviewToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
