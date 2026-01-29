"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@repo/ui/card';
import { toast } from 'sonner';
import {
  useGetCrmReviewsQuery,
  useApproveReviewMutation,
  useDeleteReviewMutation,
} from '@repo/store/api';
import ReviewsStatsCards from './components/ReviewsStatsCards';
import ReviewsFiltersToolbar from './components/ReviewsFiltersToolbar';
import ReviewsTable from './components/ReviewsTable';
import ReviewsViewDialog from './components/ReviewsViewDialog';
import ReviewsDeleteDialog from './components/ReviewsDeleteDialog';
import ReviewsPaginationControls from './components/ReviewsPaginationControls';

// Types
type Review = {
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
};

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service' | 'salon' | 'doctor'>('all');
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
      const entityName = r.entityDetails?.productName || r.entityDetails?.serviceName || r.entityDetails?.salonName || r.entityDetails?.name || '';
      return (
        r.comment.toLowerCase().includes(searchLower) ||
        r.userName.toLowerCase().includes(searchLower) ||
        entityName.toLowerCase().includes(searchLower)
      );
    });
  }, [reviews, searchTerm]);

  // Pagination logic
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredReviews.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section matching marketplace design */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Reviews Management
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Manage and moderate customer reviews for your products, services, salon, and doctors
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <ReviewsStatsCards reviews={reviews} />

        {/* Filters Toolbar */}
        <ReviewsFiltersToolbar
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          filterType={filterType}
          onSearchChange={setSearchTerm}
          onFilterStatusChange={setFilterStatus}
          onFilterTypeChange={setFilterType}
        />

        {/* Reviews Table */}
        <div className="flex-1 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              <ReviewsTable
                filteredReviews={currentItems}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onViewReview={handleViewReview}
                onApproveReview={handleApproveReview}
                onDeleteReview={(review) => {
                  setReviewToDelete(review);
                  setIsDeleteDialogOpen(true);
                }}
                isApproving={isApproving}
              />
            </CardContent>
          </Card>
        </div>

        {/* Pagination Controls */}
        <ReviewsPaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredReviews.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* View Review Dialog */}
        <ReviewsViewDialog
          isOpen={isViewDialogOpen}
          selectedReview={selectedReview}
          onClose={() => setIsViewDialogOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        <ReviewsDeleteDialog
          isOpen={isDeleteDialogOpen}
          reviewToDelete={reviewToDelete}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setReviewToDelete(null);
          }}
          onDelete={handleDeleteReview}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
