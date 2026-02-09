import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Loader2 } from 'lucide-react';

interface Product {
  _id?: string;
  productImages?: string[];
  productName?: string;
  price?: number;
  salePrice?: number;
  category?: string;
  stock?: number;
  isActive?: boolean;
  description?: string;
  status?: 'pending' | 'approved' | 'disapproved' | 'rejected';
  rejectionReason?: string;
  size?: string;
  sizeMetric?: string;
  keyIngredients?: string[];
  forBodyPart?: string;
  bodyPartType?: string;
  productForm?: string;
  brand?: string;
  vendorId?: { name: string };
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  product: Product | null;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onDelete,
  isDeleting,
  product
}: DeleteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{product?.productName}"? This action cannot be undone.
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
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;