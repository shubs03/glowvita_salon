"use client";

import { useState, useMemo } from 'react';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Pagination } from '@repo/ui/pagination';
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
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetCrmReviewsQuery,
  useApproveReviewMutation,
  useDeleteReviewMutation,
} from '@repo/store/api';
import { format } from 'date-fns';
import { useCrmAuth } from '@/hooks/useCrmAuth';

// Types
type Review = {
  _id: string;
  entityId: string;
  entityType: 'doctor';
  entityDetails?: {
    _id: string;
    name?: string;
    specialties?: string[];
    experience?: string;
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

export default function DoctorReviewsPage() {
  const { user, role } = useCrmAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // Fetch reviews - only for doctors
  const { data: reviewsResponse, isLoading, refetch } = useGetCrmReviewsQuery({ 
    filter: filterStatus,
    entityType: 'doctor'
  });
  
  const [approveReview, { isLoading: isApproving }] = useApproveReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const reviews = reviewsResponse?.reviews || [];

  // Filter reviews based on search and status
  const filteredReviews = useMemo(() => {
    return reviews.filter((r: Review) => {
      const searchLower = searchTerm.toLowerCase();
      const doctorName = r.entityDetails?.name || '';
      const matchesSearch = (
        r.comment.toLowerCase().includes(searchLower) ||
        r.userName.toLowerCase().includes(searchLower) ||
        doctorName.toLowerCase().includes(searchLower)
      );
      
      const matchesStatus = (
        filterStatus === 'all' || 
        (filterStatus === 'approved' && r.isApproved) || 
        (filterStatus === 'pending' && !r.isApproved)
      );
      
      return matchesSearch && matchesStatus;
    });
  }, [reviews, searchTerm, filterStatus]);

  // Pagination
  const paginatedReviews = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(firstItemIndex, firstItemIndex + itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));

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

  // Get doctor name
  const getDoctorName = (review: Review) => {
    return review.entityDetails?.name || 'Doctor';
  };

  // Reset to first page when filters change
  const handleFilterChange = (newFilter: 'all' | 'approved' | 'pending') => {
    setFilterStatus(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Patient Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view reviews from your patients
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
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
                placeholder="Search reviews or patients..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('approved')}
                >
                  Approved
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Reviews</CardTitle>
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
              <ThumbsUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Patient reviews will appear here'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReviews.map((review: Review) => (
                      <TableRow key={review._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {review.userName}
                              </p>
                            </div>
                          </div>
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
                            <Button
                              variant="ghost"
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
              
              {/* Pagination */}
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(value) => {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }}
                  totalItems={filteredReviews.length}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              View the full review details
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedReview.userName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Patient
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge
                    variant={selectedReview.isApproved ? 'default' : 'secondary'}
                    className="w-fit"
                  >
                    {selectedReview.isApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < selectedReview.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                    <span className="text-sm ml-1">({selectedReview.rating})</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {format(new Date(selectedReview.createdAt), 'MMM dd, yyyy hh:mm a')}
                </p>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>

              {!selectedReview.isApproved && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleApproveReview(selectedReview._id, false)}
                    disabled={isApproving}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveReview(selectedReview._id, true)}
                    disabled={isApproving}
                  >
                    {isApproving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}