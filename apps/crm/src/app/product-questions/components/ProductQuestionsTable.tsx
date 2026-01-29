import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Skeleton } from '@repo/ui/skeleton';
import { Badge } from '@repo/ui/badge';
import { MessageSquare, CheckCircle, Clock, Send, Trash2, Package } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

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

interface ProductQuestionsTableProps {
  questions: ProductQuestion[];
  filteredQuestions: ProductQuestion[];
  searchTerm: string;
  isLoading: boolean;
  onAnswerClick: (question: ProductQuestion) => void;
  onDeleteClick: (question: ProductQuestion) => void;
}

const ProductQuestionsTable = ({
  questions,
  filteredQuestions,
  searchTerm,
  isLoading,
  onAnswerClick,
  onDeleteClick
}: ProductQuestionsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions List</CardTitle>
        <CardDescription>
          {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No questions found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Questions from customers will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question: ProductQuestion) => (
                  <TableRow key={question._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {question.productId?.productImages?.[0] ? (
                          <Image
                            src={question.productId.productImages[0]}
                            alt={question.productId.productName}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {question.productId?.productName || 'Product'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ₹{question.productId?.price || 0}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{question.userName}</p>
                        <p className="text-xs text-muted-foreground">{question.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm line-clamp-2">{question.question}</p>
                        {question.isAnswered && question.answer && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            A: {question.answer}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {format(new Date(question.createdAt), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(question.createdAt), 'hh:mm a')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={question.isAnswered ? 'default' : 'secondary'}
                          className="w-fit"
                        >
                          {question.isAnswered ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Answered
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                        {question.isAnswered && (
                          <Badge
                            variant={question.isPublished ? 'outline' : 'secondary'}
                            className="w-fit text-xs"
                          >
                            {question.isPublished ? 'Published' : 'Not Published'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAnswerClick(question)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {question.isAnswered ? 'Edit' : 'Answer'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteClick(question)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductQuestionsTable;