import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <ProductFormFields
            formData={formData}
            categories={categories}
            onFieldChange={handleFieldChange}
            onAddCategoryClick={onAddCategoryClick}
          />
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {product ? "Update Product" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
