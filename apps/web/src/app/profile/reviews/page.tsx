
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Star, Search } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Pagination } from '@repo/ui/pagination';

interface Review {
  id: string;
  type: 'product' | 'service';
  item: string;
  rating: number;
  review: string;
}

const allReviews: Review[] = [
  { id: "REV-001", type: "service", item: "Signature Facial", rating: 5, review: "Absolutely amazing experience. My skin has never felt better!" },
  { id: "REV-002", type: "product", item: "Aura Revitalizing Serum", rating: 4, review: "Great product, noticed a difference in a week. A bit pricey though." },
  { id: "REV-003", type: "service", item: "Haircut & Style", rating: 4, review: "Great haircut, but the wait was a bit long." },
  { id: "REV-004", type: "product", item: "Chroma Hydrating Balm", rating: 5, review: "Love this lip balm! So hydrating and the color is perfect." },
  { id: "REV-005", type: "service", item: "Deep Tissue Massage", rating: 5, review: "Incredibly relaxing and professional." },
  { id: "REV-006", type: "product", item: "Terra Scrub", rating: 3, review: "It's okay, but a bit too harsh for my sensitive skin." },
];

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
  </div>
);

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredReviews = useMemo(() => {
    let reviews = allReviews;
    if (activeTab === 'products') {
      reviews = allReviews.filter(r => r.type === 'product');
    } else if (activeTab === 'services') {
      reviews = allReviews.filter(r => r.type === 'service');
    }

    return reviews.filter(review =>
      review.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, searchTerm]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredReviews.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page on tab change
  };

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({allReviews.length})</TabsTrigger>
            <TabsTrigger value="products">Product Reviews ({allReviews.filter(r => r.type === 'product').length})</TabsTrigger>
            <TabsTrigger value="services">Service Reviews ({allReviews.filter(r => r.type === 'service').length})</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {currentItems.length > 0 ? (
              <div className="space-y-4">
                {currentItems.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No reviews found.</p>
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
