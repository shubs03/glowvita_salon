import { Card, CardContent } from '@repo/ui/card';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface Review {
  _id: string;
  isApproved: boolean;
  createdAt: string;
  // other properties...
}

interface ReviewsStatsCardsProps {
  reviews: Review[];
}

const ReviewsStatsCards = ({ reviews }: ReviewsStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Reviews</p>
              <p className="text-2xl font-bold text-primary">{reviews.length}</p>
              <p className="text-xs text-primary/70 mt-1">All reviews received</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Approved</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {reviews.filter((r) => r.isApproved).length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Published reviews</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <CheckCircle className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {reviews.filter((r) => !r.isApproved).length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Awaiting approval</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Clock className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsStatsCards;