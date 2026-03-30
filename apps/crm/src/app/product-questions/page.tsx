"use client";

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  useGetCrmProductQuestionsQuery,
  useAnswerProductQuestionMutation,
  useDeleteProductQuestionMutation,
  useGetSupplierProductQuestionsQuery,
  useAnswerSupplierProductQuestionMutation,
  useDeleteSupplierProductQuestionMutation,
} from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';

// Import components
import ProductQuestionsHeader from './components/ProductQuestionsHeader';
import ProductQuestionsFilters from './components/ProductQuestionsFilters';
import ProductQuestionsTable from './components/ProductQuestionsTable';
import AnswerQuestionDialog from './components/AnswerQuestionDialog';
import DeleteQuestionDialog from './components/DeleteQuestionDialog';

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
  // Fetch questions based on user role - skip the query that doesn't match the role
  const vendorQuestionsQuery = useGetCrmProductQuestionsQuery(filterStatus, { skip: isSupplier });
  const supplierQuestionsQuery = useGetSupplierProductQuestionsQuery(filterStatus, { skip: !isSupplier });

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
    setPublishAnswer(question.isAnswered ? question.isPublished : true);
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
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        <ProductQuestionsHeader questions={filteredQuestions} />
        
        <ProductQuestionsFilters
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterStatus}
        />
        
        <ProductQuestionsTable
          questions={questions}
          filteredQuestions={filteredQuestions}
          searchTerm={searchTerm}
          isLoading={isLoading}
          onAnswerClick={handleOpenAnswerDialog}
          onDeleteClick={(question) => {
            setQuestionToDelete(question);
            setIsDeleteDialogOpen(true);
          }}
        />
        
        <AnswerQuestionDialog
          isOpen={isAnswerDialogOpen}
          selectedQuestion={selectedQuestion}
          answerText={answerText}
          publishAnswer={publishAnswer}
          isAnswering={isAnswering}
          onOpenChange={setIsAnswerDialogOpen}
          onAnswerTextChange={setAnswerText}
          onPublishAnswerChange={setPublishAnswer}
          onSubmit={handleSubmitAnswer}
        />
        
        <DeleteQuestionDialog
          isOpen={isDeleteDialogOpen}
          questionToDelete={questionToDelete}
          isDeleting={isDeleting}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteQuestion}
        />
      </div>
    </div>
  );
}