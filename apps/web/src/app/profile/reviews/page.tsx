
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Star } from 'lucide-react';

const reviews = [
  { id: "REV-001", service: "Signature Facial", rating: 5, review: "Absolutely amazing experience. My skin has never felt better!" },
  { id: "REV-002", service: "Haircut & Style", rating: 4, review: "Great haircut, but the wait was a bit long." },
];

export default function ReviewsPage() {
    return (
        <Card>
            <CardHeader>
              <CardTitle>My Reviews</CardTitle>
              <CardDescription>Your feedback on our services.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold">{review.service}</p>
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
                ))}
              </div>
            </CardContent>
        </Card>
    );
}
