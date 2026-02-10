import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Loader2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  productName?: string;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  productName
}: DeleteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {productName ? `"${productName}"` : 'this product'}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
