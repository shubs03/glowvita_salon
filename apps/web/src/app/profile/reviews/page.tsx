"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Star, Search, Loader2 } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Pagination } from '@repo/ui/pagination';
import { useAuth } from '@/hooks/useAuth';

interface Review {
  id: string;
  type: 'product' | 'service' | 'salon';
  item: string;
  rating: number;
  review: string;
  date: string;
}

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Fetch reviews from API
  useEffect(() => {
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

    fetchReviews();
  }, [isAuthenticated, user]);

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

  if (loading) {
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
                No approved reviews found. Reviews you submit will appear here after approval by the product owners.
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
  );
}

interface ReviewItemProps {
  review: Review;
}

const ReviewItem = ({ review }: ReviewItemProps) => (
  <div className="border-b pb-4">
    <div className="flex justify-between items-center mb-1">
      <div>
        <p className="font-semibold">{review.item}</p>
        <p className="text-xs text-muted-foreground capitalize">{review.type} Review</p>
      </div>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-blue-400 fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
    </div>
    <p className="text-sm text-muted-foreground">{review.review}</p>
    {review.date && (
      <p className="text-xs text-muted-foreground mt-1">{new Date(review.date).toLocaleDateString()}</p>
    )}
  </div>
);