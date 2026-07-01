"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Star, Search, Loader2 } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Pagination } from '@repo/ui/pagination';
import { Button } from '@repo/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ReviewForm } from '@/components/ReviewForm';
import { toast } from 'sonner';

interface Review {
  id: string;
  type: 'product' | 'service' | 'salon';
  item: string;
  rating: number;
  review: string;
  status: 'approved' | 'pending';
  date: string;
}

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId');
  const selectedTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(selectedTab === 'services' ? 'services' : 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // Single appointment feedback state
  const [appointment, setAppointment] = useState<any>(null);
  const [fetchingAppointment, setFetchingAppointment] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<{ id: string; name: string } | null>(null);

  // Fetch reviews from API
  const fetchReviews = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/client/reviews`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.reviews);
      } else {
        setError(result.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [isAuthenticated, user]);

  // Handle authentication redirect if appointmentId is present
  useEffect(() => {
    if (!authLoading && !isAuthenticated && appointmentId) {
      router.push(`/client-login?redirect=${encodeURIComponent(`/profile/reviews?appointmentId=${appointmentId}&tab=services`)}`);
    }
  }, [authLoading, isAuthenticated, appointmentId, router]);

  useEffect(() => {
    if (selectedTab && ['all', 'products', 'services', 'salons'].includes(selectedTab)) {
      setActiveTab(selectedTab);
      setCurrentPage(1);
    }
  }, [selectedTab]);

  // Fetch appointment details if appointmentId is present
  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId || !isAuthenticated) return;

      try {
        setFetchingAppointment(true);
        setAppointmentError(null);
        const response = await fetch(`/api/client/appointments/${appointmentId}`);
        const result = await response.json();

        if (result.success) {
          setAppointment(result.appointment);
        } else {
          setAppointmentError(result.message || 'Failed to fetch appointment details');
        }
      } catch (err) {
        setAppointmentError('Failed to fetch appointment details');
        console.error('Error fetching appointment:', err);
      } finally {
        setFetchingAppointment(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, isAuthenticated]);

  // Pre-select service if single service appointment
  useEffect(() => {
    if (appointment) {
      const items = appointment.serviceItems || [];
      if (items.length <= 1) {
        const serviceId = appointment.service || items[0]?.service;
        const serviceName = appointment.serviceName || items[0]?.serviceName;
        if (serviceId) {
          setSelectedService({ id: serviceId, name: serviceName });
        }
      }
    } else {
      setSelectedService(null);
    }
  }, [appointment]);

  const filteredReviews = useMemo(() => {
    let reviewsList = reviews;
    if (activeTab === 'products') {
      reviewsList = reviews.filter(r => r.type === 'product');
    } else if (activeTab === 'services') {
      reviewsList = reviews.filter(r => r.type === 'service');
    } else if (activeTab === 'salons') {
      reviewsList = reviews.filter(r => r.type === 'salon');
    }

    return reviewsList.filter(review =>
      review.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, searchTerm, reviews]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredReviews.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page on tab change
  };

  const closeReviewModal = () => {
    setAppointment(null);
    setSelectedService(null);
    setAppointmentError(null);
    router.replace('/profile/reviews?tab=services');
  };

  const handleAppointmentReviewSuccess = () => {
    toast.success('Thank you for your feedback!');
    closeReviewModal();
    fetchReviews();
  };

  if (authLoading || (loading && reviews.length === 0 && !appointmentId)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
          <CardDescription>Your feedback on our products and services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
          <CardDescription>Your feedback on our products and services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Appointment-specific review modal */}
      {appointmentId && isAuthenticated && (
        <Dialog open={true} onOpenChange={(open) => !open && closeReviewModal()}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">Leave Feedback for {appointment ? appointment.vendorName : 'Loading...'}</DialogTitle>
                  {appointment && (
                    <DialogDescription className="mt-2">
                      Appointment on {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
                    </DialogDescription>
                  )}
                </div>
                <button
                  onClick={closeReviewModal}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Skip / Dismiss
                </button>
              </div>
            </DialogHeader>

            <div className="pt-2">
              {fetchingAppointment ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : appointmentError ? (
                <p className="text-sm text-red-500 text-center">{appointmentError}</p>
              ) : appointment ? (
                selectedService ? (
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h3 className="font-semibold text-lg text-primary">Reviewing service: {selectedService.name}</h3>
                      {appointment.serviceItems && appointment.serviceItems.length > 1 && (
                        <button
                          onClick={() => setSelectedService(null)}
                          className="text-xs text-primary hover:underline"
                        >
                          &larr; Back to services list
                        </button>
                      )}
                    </div>
                    <ReviewForm
                      entityId={selectedService.id}
                      entityType="service"
                      onSubmitSuccess={handleAppointmentReviewSuccess}
                    />
                  </div>
                ) : (
                  <div>
                    <p className="mb-4 text-sm text-muted-foreground">Select a service to write a review:</p>
                    <div className="space-y-3">
                      {(appointment.serviceItems || []).map((item: any) => (
                        <div key={item._id || item.service} className="flex justify-between items-center p-3 border rounded-lg bg-card hover:bg-accent/20 transition-colors">
                          <div>
                            <p className="font-medium text-sm sm:text-base">{item.serviceName}</p>
                            <p className="text-xs text-muted-foreground">{item.duration} mins • ₹{item.amount || item.price}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedService({
                              id: item.service || item._id,
                              name: item.serviceName
                            })}
                          >
                            Write Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* General Reviews Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>My Reviews</CardTitle>
              <CardDescription>Your feedback on our products and services.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reviews..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
              <TabsTrigger value="products">Products ({reviews.filter(r => r.type === 'product').length})</TabsTrigger>
              <TabsTrigger value="services">Services ({reviews.filter(r => r.type === 'service').length})</TabsTrigger>
              <TabsTrigger value="salons">Salons ({reviews.filter(r => r.type === 'salon').length})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              {currentItems.length > 0 ? (
                <div className="space-y-4">
                  {currentItems.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No reviews found. Reviews you submit will appear here after approval by the product owners.
                </p>
              )}
              {filteredReviews.length > itemsPerPage && (
                <Pagination
                  className="mt-6"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={filteredReviews.length}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
}

const ReviewItem = ({ review }: ReviewItemProps) => (
  <div className="border-b pb-4">
    <div className="flex justify-between items-center mb-1 gap-4">
      <div>
        <p className="font-semibold text-sm sm:text-base">{review.item}</p>
        <p className="text-xs text-muted-foreground capitalize">{review.type} Review</p>
        {review.status === 'pending' && (
          <span className="inline-flex mt-1 rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-yellow-800">
            Pending approval
          </span>
        )}
      </div>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
    </div>
    <p className="text-sm text-muted-foreground">{review.review}</p>
    {review.date && (
      <p className="text-xs text-muted-foreground mt-1">{new Date(review.date).toLocaleDateString()}</p>
    )}
  </div>
);