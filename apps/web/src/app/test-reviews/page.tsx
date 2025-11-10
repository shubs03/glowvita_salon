"use client";

import { useState } from 'react';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';

export default function TestReviewsPage() {
  const [showProductReview, setShowProductReview] = useState(false);
  const [showServiceReview, setShowServiceReview] = useState(false);
  const [showSalonReview, setShowSalonReview] = useState(false);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Review System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Review</CardTitle>
          </CardHeader>
          <CardContent>
            {showProductReview ? (
              <ReviewForm 
                entityId="test-product-id"
                entityType="product"
                onSubmitSuccess={() => setShowProductReview(false)}
              />
            ) : (
              <Button onClick={() => setShowProductReview(true)}>
                Write Product Review
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Service Review</CardTitle>
          </CardHeader>
          <CardContent>
            {showServiceReview ? (
              <ReviewForm 
                entityId="test-service-id"
                entityType="service"
                onSubmitSuccess={() => setShowServiceReview(false)}
              />
            ) : (
              <Button onClick={() => setShowServiceReview(true)}>
                Write Service Review
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Salon Review</CardTitle>
          </CardHeader>
          <CardContent>
            {showSalonReview ? (
              <ReviewForm 
                entityId="test-salon-id"
                entityType="salon"
                onSubmitSuccess={() => setShowSalonReview(false)}
              />
            ) : (
              <Button onClick={() => setShowSalonReview(true)}>
                Write Salon Review
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}