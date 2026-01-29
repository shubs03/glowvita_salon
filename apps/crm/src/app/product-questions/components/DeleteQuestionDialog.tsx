import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Loader2 } from 'lucide-react';

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

interface DeleteQuestionDialogProps {
  isOpen: boolean;
  questionToDelete: ProductQuestion | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteQuestionDialog = ({
  isOpen,
  questionToDelete,
  isDeleting,
  onOpenChange,
  onConfirm
}: DeleteQuestionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteQuestionDialog;