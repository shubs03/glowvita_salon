import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Loader2 } from "lucide-react";
import ProductFormFields from "./ProductFormFields";

interface Category {
  _id: string;
  name: string;
  description: string;
}

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
  status?: "pending" | "approved" | "disapproved" | "rejected";
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

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Product | null;
  categories: Category[];
  isSaving: boolean;
  formData: Partial<Product>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  onAddCategoryClick: () => void;
}

const ProductModal = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  isSaving,
  formData,
  setFormData,
  onAddCategoryClick,
}: ProductModalProps) => {
  const handleFieldChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          ...product,
          price: product.price || 0,
          salePrice: product.salePrice || 0,
          stock: product.stock || 0,
          isActive: product.isActive ?? true,
          status: product.status || "pending",
        });
      } else {
        setFormData({
          price: 0,
          salePrice: 0,
          stock: 0,
          isActive: true,
          status: "pending",
        });
      }
    }
  }, [isOpen, product, setFormData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border-0 bg-background/95 backdrop-blur-xl shadow-2xl scrollbar-hide"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <ProductFormFields
            formData={formData}
            categories={categories}
            onFieldChange={handleFieldChange}
            onAddCategoryClick={onAddCategoryClick}
          />
        </div>

        {/* Enhanced Footer */}
        <div className="sticky bottom-0 -mx-6 -mb-6 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
          <div className="flex justify-end gap-3">
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
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
