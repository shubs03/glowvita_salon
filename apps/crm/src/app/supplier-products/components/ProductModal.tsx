import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Loader2 } from 'lucide-react';
import ProductFormFields from './ProductFormFields';

interface Product {
  _id?: string;
  productName?: string;
  category?: string;
  description?: string;
  productImages?: string[];
  price?: number;
  salePrice?: number;
  stock?: number;
  status?: 'pending' | 'approved' | 'disapproved';
  brand?: string;
  productForm?: string;
  size?: string;
  sizeMetric?: string;
  forBodyPart?: string;
  bodyPartType?: string;
  keyIngredients?: string[];
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  selectedProduct: Product | null;
  formData: Partial<Product>;
  setFormData: (data: Partial<Product> | ((prev: Partial<Product>) => Partial<Product>)) => void;
  categoriesData: Category[];
  onAddCategory: () => void;
}

const ProductModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  selectedProduct,
  formData,
  setFormData,
  categoriesData,
  onAddCategory
}: ProductModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border-0 bg-background/95 backdrop-blur-xl shadow-2xl scrollbar-hide">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/20 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <ProductFormFields
            formData={formData}
            setFormData={setFormData}
            categoriesData={categoriesData}
            onAddCategory={onAddCategory}
          />
        </div>
        
        {/* Enhanced Footer */}
        <div className="sticky bottom-0 -mx-6 -mb-6 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl border-border/40 hover:border-border/60 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={onSave} 
              disabled={isSaving}
              className="rounded-xl bg-primary hover:bg-primary/90 px-6"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
