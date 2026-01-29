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

interface Review {
  _id: string;
  entityId: string;
  entityType: 'product' | 'service' | 'salon' | 'doctor';
  entityDetails?: {
    _id: string;
    productName?: string;
    serviceName?: string;
    salonName?: string;
    name?: string;
    specialties?: string[];
    experience?: string;
    productImages?: string[];
    price?: number;
    category?: string;
  };
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsDeleteDialogProps {
  isOpen: boolean;
  reviewToDelete: Review | null;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const ReviewsDeleteDialog = ({
  isOpen,
  reviewToDelete,
  onClose,
  onDelete,
  isDeleting
}: ReviewsDeleteDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Review</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewsDeleteDialog;