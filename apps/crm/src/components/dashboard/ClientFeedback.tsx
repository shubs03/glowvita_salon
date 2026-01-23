import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Feedback {
  client: string;
  comment: string;
  rating: number;
  date: string;
  entityType?: string;
}

export function ClientFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ratings, setRatings] = useState({
    salon: 0,
    product: 0,
    service: 0
  });

  useEffect(() => {
    const fetchClientFeedback = async () => {
      try {
        const response = await fetch('/api/crm/vendor/metrics/reviews');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setFeedback(result.data);
            calculateRatings(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching client feedback:', error);
        // Fallback to mock data on error
        const mockFeedback = [
          { client: 'Sarah L.', comment: "Amazing service! My nails have never looked better.", rating: 5, date: 'Aug 20, 2024', entityType: 'Service' },
          { client: 'Michael B.', comment: "Great haircut, and the conversation was even better.", rating: 5, date: 'Aug 19, 2024', entityType: 'Service' },
          { client: 'Jessica P.', comment: "Very relaxing spa day. Just what I needed.", rating: 4, date: 'Aug 19, 2024', entityType: 'Service' },
          { client: 'David R.', comment: "Good service, but a bit of a wait.", rating: 3, date: 'Aug 18, 2024', entityType: 'Product' },
        ];
        setFeedback(mockFeedback);
        calculateRatings(mockFeedback);
      } finally {
        setLoading(false);
      }
    };

    fetchClientFeedback();
  }, []);

  const calculateRatings = (feedbackData: Feedback[]) => {
    const serviceReviews = feedbackData.filter(f => f.entityType === 'Service');
    const productReviews = feedbackData.filter(f => f.entityType === 'Product');
    
    const avgService = serviceReviews.length > 0
      ? serviceReviews.reduce((sum, f) => sum + f.rating, 0) / serviceReviews.length
      : 0;
    
    const avgProduct = productReviews.length > 0
      ? productReviews.reduce((sum, f) => sum + f.rating, 0) / productReviews.length
      : 0;
    
    const avgSalon = feedbackData.length > 0
      ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length
      : 0;

    setRatings({
      salon: avgSalon,
      product: avgProduct,
      service: avgService
    });
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Client Feedback Ratings</CardTitle>
          <CardDescription>Average ratings across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Client Feedback Ratings</CardTitle>
        <CardDescription>Average ratings across all categories</CardDescription>
      </CardHeader>
      <CardContent>
        {feedback.length > 0 ? (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Overall Salon Rating */}
              <div className="flex flex-col items-center gap-2">
                <div style={{ width: 120, height: 120 }}>
                  <CircularProgressbar
                    value={ratings.salon * 20} // Convert 0-5 scale to 0-100 percentage
                    text={`${ratings.salon.toFixed(1)}`}
                    styles={buildStyles({
                      textSize: '16px',
                      pathColor: ratings.salon >= 4 ? 'hsl(var(--primary))' : ratings.salon >= 3 ? 'hsl(var(--accent))' : ratings.salon >= 2 ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))',
                      textColor: 'hsl(var(--foreground))',
                      trailColor: 'hsl(var(--muted))',
                      backgroundColor: 'transparent',
                      pathTransitionDuration: 0.5,
                      rotation: 0,
                      strokeLinecap: 'round',
                    })}
                  />
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm font-medium text-muted-foreground">Overall Salon</div>
                </div>
              </div>

              {/* Products Rating */}
              <div className="flex flex-col items-center gap-2">
                <div style={{ width: 120, height: 120 }}>
                  <CircularProgressbar
                    value={ratings.product * 20} // Convert 0-5 scale to 0-100 percentage
                    text={`${ratings.product.toFixed(1)}`}
                    styles={buildStyles({
                      textSize: '16px',
                      pathColor: ratings.product >= 4 ? 'hsl(var(--primary))' : ratings.product >= 3 ? 'hsl(var(--accent))' : ratings.product >= 2 ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))',
                      textColor: 'hsl(var(--foreground))',
                      trailColor: 'hsl(var(--muted))',
                      backgroundColor: 'transparent',
                      pathTransitionDuration: 0.5,
                      rotation: 0,
                      strokeLinecap: 'round',
                    })}
                  />
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm font-medium text-muted-foreground">Products</div>
                </div>
              </div>

              {/* Services Rating */}
              <div className="flex flex-col items-center gap-2">
                <div style={{ width: 120, height: 120 }}>
                  <CircularProgressbar
                    value={ratings.service * 20} // Convert 0-5 scale to 0-100 percentage
                    text={`${ratings.service.toFixed(1)}`}
                    styles={buildStyles({
                      textSize: '16px',
                      pathColor: ratings.service >= 4 ? 'hsl(var(--primary))' : ratings.service >= 3 ? 'hsl(var(--accent))' : ratings.service >= 2 ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))',
                      textColor: 'hsl(var(--foreground))',
                      trailColor: 'hsl(var(--muted))',
                      backgroundColor: 'transparent',
                      pathTransitionDuration: 0.5,
                      rotation: 0,
                      strokeLinecap: 'round',
                    })}
                  />
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm font-medium text-muted-foreground">Services</div>
                </div>
              </div>
            </div>
            
            {/* Additional Summary Details */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-muted-foreground">Total Reviews</p>
                  <p className="text-lg font-bold">{feedback.length}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-muted-foreground">Top Category</p>
                  <p className="text-lg font-bold capitalize">{Object.entries(ratings).sort(([,a], [,b]) => b - a)[0][0]}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-muted-foreground">Avg. Rating</p>
                  <p className="text-lg font-bold">{(feedback.reduce((sum, f) => sum + f.rating, 0) / Math.max(feedback.length, 1)).toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No client feedback available
        </div>
      )}
    </CardContent>
  </Card>
);
}