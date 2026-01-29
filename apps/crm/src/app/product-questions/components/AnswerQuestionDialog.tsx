import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Switch } from '@repo/ui/switch';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

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

interface AnswerQuestionDialogProps {
  isOpen: boolean;
  selectedQuestion: ProductQuestion | null;
  answerText: string;
  publishAnswer: boolean;
  isAnswering: boolean;
  onOpenChange: (open: boolean) => void;
  onAnswerTextChange: (text: string) => void;
  onPublishAnswerChange: (publish: boolean) => void;
  onSubmit: () => void;
}

const AnswerQuestionDialog = ({
  isOpen,
  selectedQuestion,
  answerText,
  publishAnswer,
  isAnswering,
  onOpenChange,
  onAnswerTextChange,
  onPublishAnswerChange,
  onSubmit
}: AnswerQuestionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                onChange={(e) => onAnswerTextChange(e.target.value)}
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
                onCheckedChange={onPublishAnswerChange}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isAnswering || !answerText.trim()}>
            {isAnswering && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {selectedQuestion?.isAnswered ? 'Update Answer' : 'Submit Answer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnswerQuestionDialog;