import { Card, CardContent } from '@repo/ui/card';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

// Types
type ProductQuestion = {
  _id: string;
  productId: {
    _id: string;
    productName: string;
    productImages: string[];
    price: number;
  };
  userId: string;
  userName: string;
  userEmail: string;
  question: string;
  answer?: string;
  isAnswered: boolean;
  answeredAt?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

interface ProductQuestionsHeaderProps {
  questions: ProductQuestion[];
}

const ProductQuestionsHeader = ({ questions }: ProductQuestionsHeaderProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Questions</p>
              <p className="text-2xl font-bold text-primary">{questions.length}</p>
              <p className="text-xs text-primary/70 mt-1">Total customer questions</p>
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
              <p className="text-sm font-medium text-secondary-foreground mb-1">Answered</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {questions.filter((q: ProductQuestion) => q.isAnswered).length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Successfully resolved</p>
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
                {questions.filter((q: ProductQuestion) => !q.isAnswered).length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Awaiting response</p>
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

export default ProductQuestionsHeader;