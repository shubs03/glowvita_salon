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
  onAddCategory,
}: ProductModalProps) => {
  const handleFieldChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (isOpen) {
      if (selectedProduct) {
        setFormData({
          ...selectedProduct,
          price: selectedProduct.price || 0,
          salePrice: selectedProduct.salePrice || 0,
          stock: selectedProduct.stock || 0,
          isActive: selectedProduct.isActive ?? true,
          status: selectedProduct.status || "pending",
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
  }, [isOpen, selectedProduct, setFormData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <ProductFormFields
            formData={formData}
            setFormData={setFormData}
            categoriesData={categoriesData}
            onAddCategory={onAddCategory}
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
            {selectedProduct ? "Update Product" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
