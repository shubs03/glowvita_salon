"use client";

import { useState, useMemo } from 'react';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Skeleton } from '@repo/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Switch } from '@repo/ui/switch';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Loader2,
  Send,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetCrmProductQuestionsQuery,
  useAnswerProductQuestionMutation,
  useDeleteProductQuestionMutation,
  useGetSupplierProductQuestionsQuery,
  useAnswerSupplierProductQuestionMutation,
  useDeleteSupplierProductQuestionMutation,
} from '@repo/store/api';
import { format } from 'date-fns';
import Image from 'next/image';
import { useCrmAuth } from '@/hooks/useCrmAuth';

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

export default function ProductQuestionsPage() {
  const { role } = useCrmAuth();
  const isSupplier = role === 'supplier';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<ProductQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [publishAnswer, setPublishAnswer] = useState(true);
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<ProductQuestion | null>(null);

  // Fetch questions based on user role
  const vendorQuestionsQuery = useGetCrmProductQuestionsQuery(filterStatus);
  const supplierQuestionsQuery = useGetSupplierProductQuestionsQuery(filterStatus);
  
  const { data: questionsResponse, isLoading, refetch } = isSupplier ? supplierQuestionsQuery : vendorQuestionsQuery;
  
  // Mutations based on user role
  const [answerVendorQuestion, { isLoading: isAnsweringVendor }] = useAnswerProductQuestionMutation();
  const [deleteVendorQuestion, { isLoading: isDeletingVendor }] = useDeleteProductQuestionMutation();
  const [answerSupplierQuestion, { isLoading: isAnsweringSupplier }] = useAnswerSupplierProductQuestionMutation();
  const [deleteSupplierQuestion, { isLoading: isDeletingSupplier }] = useDeleteSupplierProductQuestionMutation();
  
  const isAnswering = isSupplier ? isAnsweringSupplier : isAnsweringVendor;
  const isDeleting = isSupplier ? isDeletingSupplier : isDeletingVendor;

  const questions = questionsResponse?.questions || [];

  // Filter questions based on search
  const filteredQuestions = useMemo(() => {
    return questions.filter((q: ProductQuestion) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        q.question.toLowerCase().includes(searchLower) ||
        q.userName.toLowerCase().includes(searchLower) ||
        q.productId?.productName?.toLowerCase().includes(searchLower)
      );
    });
  }, [questions, searchTerm]);

  // Handle opening answer dialog
  const handleOpenAnswerDialog = (question: ProductQuestion) => {
    setSelectedQuestion(question);
    setAnswerText(question.answer || '');
    setPublishAnswer(question.isPublished);
    setIsAnswerDialogOpen(true);
  };

  // Handle submit answer
  const handleSubmitAnswer = async () => {
    if (!selectedQuestion || !answerText.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (answerText.trim().length < 10) {
      toast.error('Answer must be at least 10 characters long');
      return;
    }

    try {
      if (isSupplier) {
        await answerSupplierQuestion({
          questionId: selectedQuestion._id,
          answer: answerText.trim(),
          isPublished: publishAnswer,
        }).unwrap();
      } else {
        await answerVendorQuestion({
          questionId: selectedQuestion._id,
          answer: answerText.trim(),
          isPublished: publishAnswer,
        }).unwrap();
      }

      toast.success('Answer submitted successfully');
      setIsAnswerDialogOpen(false);
      setSelectedQuestion(null);
      setAnswerText('');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit answer');
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      if (isSupplier) {
        await deleteSupplierQuestion(questionToDelete._id).unwrap();
      } else {
        await deleteVendorQuestion(questionToDelete._id).unwrap();
      }
      
      toast.success('Question deleted successfully');
      setIsDeleteDialogOpen(false);
      setQuestionToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete question');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Questions</h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to customer questions about your products
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter((q: ProductQuestion) => q.isAnswered).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter((q: ProductQuestion) => !q.isAnswered).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions, products, or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'unanswered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('unanswered')}
              >
                Unanswered
              </Button>
              <Button
                variant={filterStatus === 'answered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('answered')}
              >
                Answered
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questions Table */}
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
                            onClick={() => handleOpenAnswerDialog(question)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            {question.isAnswered ? 'Edit' : 'Answer'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setQuestionToDelete(question);
                              setIsDeleteDialogOpen(true);
                            }}
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

      {/* Answer Dialog */}
      <Dialog open={isAnswerDialogOpen} onOpenChange={setIsAnswerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedQuestion?.isAnswered ? 'Edit Answer' : 'Answer Question'}
            </DialogTitle>
            <DialogDescription>
              Provide a helpful answer to the customer's question
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  {selectedQuestion.productId?.productImages?.[0] && (
                    <Image
                      src={selectedQuestion.productId.productImages[0]}
                      alt={selectedQuestion.productId.productName}
                      width={50}
                      height={50}
                      className="rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{selectedQuestion.productId?.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Asked by {selectedQuestion.userName}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="font-medium text-sm">Question:</p>
                  <p className="text-sm mt-1">{selectedQuestion.question}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Your Answer *</Label>
                <Textarea
                  id="answer"
                  placeholder="Type your answer here..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters ({answerText.trim().length}/10)
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="publish" className="font-medium">
                    Publish Answer
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Make this Q&A visible on the product page
                  </p>
                </div>
                <Switch
                  id="publish"
                  checked={publishAnswer}
                  onCheckedChange={setPublishAnswer}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnswerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAnswer} disabled={isAnswering || !answerText.trim()}>
              {isAnswering && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedQuestion?.isAnswered ? 'Update Answer' : 'Submit Answer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {questionToDelete && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium">{questionToDelete.question}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Asked by {questionToDelete.userName}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuestion} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}