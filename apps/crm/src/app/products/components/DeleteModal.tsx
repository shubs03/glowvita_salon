import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Trash2 } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md rounded-3xl border-0 bg-background/95 backdrop-blur-xl shadow-2xl">
        <div className="-mx-6 -mt-6 px-6 pt-6 pb-4 bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border-b border-border/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Product
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="py-4">
          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{product?.productName}"</span>?
            This action cannot be undone.
          </p>
        </div>

        <div className="-mx-6 -mb-6 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-border/40 hover:border-border/60"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Product
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;