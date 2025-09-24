
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Star } from 'lucide-react';

const allReviews = [
  { id: "REV-001", type: "service", item: "Signature Facial", rating: 5, review: "Absolutely amazing experience. My skin has never felt better!" },
  { id: "REV-002", type: "product", item: "Aura Revitalizing Serum", rating: 4, review: "Great product, noticed a difference in a week. A bit pricey though." },
  { id: "REV-003", type: "service", item: "Haircut & Style", rating: 4, review: "Great haircut, but the wait was a bit long." },
  { id: "REV-004", type: "product", item: "Chroma Hydrating Balm", rating: 5, review: "Love this lip balm! So hydrating and the color is perfect." },
];

const ReviewItem = ({ review }) => (
  <div className="border-b pb-4">
    <div className="flex justify-between items-center mb-1">
      <div>
        <p className="font-semibold">{review.item}</p>
        <p className="text-xs text-muted-foreground capitalize">{review.type} Review</p>
      </div>
      <div className="flex items-center">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-blue-400 fill-current" />
        ))}
        {[...Array(5 - review.rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
    </div>
    <p className="text-sm text-muted-foreground">{review.review}</p>
  </div>
);

export default function ReviewsPage() {
  const productReviews = allReviews.filter(r => r.type === 'product');
  const serviceReviews = allReviews.filter(r => r.type === 'service');

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reviews</CardTitle>
        <CardDescription>Your feedback on our products and services.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="products">Product Reviews</TabsTrigger>
            <TabsTrigger value="services">Service Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="space-y-4">
              {allReviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="products" className="mt-4">
            <div className="space-y-4">
              {productReviews.length > 0 ? (
                productReviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No product reviews yet.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="services" className="mt-4">
            <div className="space-y-4">
              {serviceReviews.length > 0 ? (
                serviceReviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No service reviews yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
