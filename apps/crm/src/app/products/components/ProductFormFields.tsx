import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Button } from '@repo/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { useGetProductMastersQuery } from '@repo/store/api';
import { Badge } from '@repo/ui/badge';

interface Category {
  _id: string;
  name: string;
  description: string;
  gstType?: 'none' | 'fixed' | 'percentage';
  gstValue?: number;
}

interface ProductMaster {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
  brand?: string;
  description?: string;
  productForm?: string;
  keyIngredients?: string[];
  productImage?: string;
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

interface ProductFormFieldsProps {
  formData: Partial<Product>;
  categories: Category[];
  onFieldChange: (field: keyof Product, value: any) => void;
  onAddCategoryClick: () => void;
}

const ProductFormFields = ({
  formData,
  categories,
  onFieldChange,
  onAddCategoryClick
}: ProductFormFieldsProps) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>(formData.productImages || []);
  const [calculatedFinalPrice, setCalculatedFinalPrice] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);

  // Fetch product masters
  const { data: productMastersData, isLoading: productMastersLoading, error: productMastersError } = useGetProductMastersQuery(undefined);
  const productMasters = productMastersData || [];

  // Debug logging
  useEffect(() => {
    if (productMastersData) {
      console.log('[CRM Products] Product Masters loaded:', productMasters.length, 'items');
      console.log('[CRM Products] Sample product master:', productMasters[0]);
    }
  }, [productMastersData, productMasters]);

  // Get selected category details
  const selectedCategory = useMemo(() => {
    if (!formData.category) return null;
    return categories.find((cat: Category) => cat.name === formData.category);
  }, [formData.category, categories]);

  // Calculate GST and final price whenever sale price or category changes
  useEffect(() => {
    const salePrice = Number(formData.salePrice) || 0;

    if (!selectedCategory || !selectedCategory.gstType || selectedCategory.gstType === 'none') {
      setGstAmount(0);
      setCalculatedFinalPrice(salePrice);
      return;
    }

    let calculatedGst = 0;
    const gstValue = Number(selectedCategory.gstValue) || 0;

    if (selectedCategory.gstType === 'fixed') {
      // Fixed GST: Add fixed amount to sale price
      calculatedGst = gstValue;
    } else if (selectedCategory.gstType === 'percentage') {
      // Percentage GST: Calculate percentage of sale price
      calculatedGst = (salePrice * gstValue) / 100;
    }

    const finalPrice = salePrice + calculatedGst;
    setGstAmount(calculatedGst);
    setCalculatedFinalPrice(finalPrice);
  }, [formData.salePrice, selectedCategory]);

  // Filter product masters by selected category
  const productMastersForCategory = useMemo(() => {
    if (!formData.category) return [];
    const filtered = productMasters.filter((pm: ProductMaster) => {
      const categoryName = typeof pm.category === 'object' ? pm.category.name : '';
      return categoryName === formData.category;
    });
    console.log(`[CRM Products] Filtering for category "${formData.category}":`, filtered.length, 'products');
    return filtered;
  }, [productMasters, formData.category]);

  // Handle product master selection
  const handleProductMasterChange = (productName: string) => {
    // Allow manual entry by checking if it's a special value
    if (productName === 'manual-entry') {
      return; // Don't update, let user type
    }

    onFieldChange('productName', productName);

    // Find the selected product master and auto-fill fields
    const selectedProductMaster = productMastersForCategory.find(
      (pm: ProductMaster) => pm.name === productName
    );

    if (selectedProductMaster) {
      // Auto-fill from master
      if (selectedProductMaster.brand) {
        onFieldChange('brand', selectedProductMaster.brand);
      }
      if (selectedProductMaster.description) {
        onFieldChange('description', selectedProductMaster.description);
      }
      if (selectedProductMaster.productForm) {
        onFieldChange('productForm', selectedProductMaster.productForm);
      }
      if (selectedProductMaster.keyIngredients && selectedProductMaster.keyIngredients.length > 0) {
        onFieldChange('keyIngredients', selectedProductMaster.keyIngredients);
      }
      // Auto-fill default image if exists (vendor can upload their own later)
      if (selectedProductMaster.productImage) {
        const existingImages = formData.productImages || [];
        // Only set as first image if no images exist yet
        if (existingImages.length === 0) {
          onFieldChange('productImages', [selectedProductMaster.productImage]);
          setImagePreviews([selectedProductMaster.productImage]);
        }
      }
    }
  };

  // Handle category change - reset product name when category changes
  const handleCategoryChange = (categoryName: string) => {
    onFieldChange('category', categoryName);
    onFieldChange('productName', ''); // Reset product name when category changes
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileReaders: Promise<string>[] = [];

      Array.from(files).forEach(file => {
        const promise = new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        fileReaders.push(promise);
      });

      Promise.all(fileReaders).then(base64Images => {
        const newImages = [...(formData.productImages || []), ...base64Images];
        onFieldChange('productImages', newImages);
        setImagePreviews(newImages);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.productImages || [])];
    newImages.splice(index, 1);
    onFieldChange('productImages', newImages);
    setImagePreviews(newImages);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">Category</Label>
          <div className="flex gap-2">
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="rounded-xl border-border/40">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {categories?.map((cat: Category) => (
                  <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={onAddCategoryClick}
              className="rounded-xl border-border/40 hover:border-primary/50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="productName" className="text-sm font-medium">Product Name</Label>
          <div className="space-y-2">
            <Select
              value={formData.productName || ''}
              onValueChange={handleProductMasterChange}
              disabled={!formData.category}
            >
              <SelectTrigger className="rounded-xl border-border/40">
                <SelectValue placeholder={formData.category ? "Select Product" : "Select Category First"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {productMastersLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading products...
                  </SelectItem>
                ) : productMastersError ? (
                  <SelectItem value="error" disabled>
                    Error loading products - Please try again
                  </SelectItem>
                ) : productMastersForCategory.length > 0 ? (
                  productMastersForCategory.map((pm: ProductMaster) => (
                    <SelectItem key={pm._id} value={pm.name}>
                      {pm.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-products" disabled>
                    No products available for this category
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {formData.category && (!productMastersLoading && !productMastersError && productMastersForCategory.length === 0) && (
              <Input
                placeholder="Or enter custom product name"
                value={formData.productName || ''}
                onChange={(e) => onFieldChange('productName', e.target.value)}
                className="rounded-xl border-border/40 focus:border-primary/50 focus:ring-primary/20"
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea
          placeholder="Enter product description"
          id="description"
          value={formData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          className="rounded-xl border-border/40 focus:border-primary/50 focus:ring-primary/20 min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="productImages" className="text-sm font-medium">Product Images</Label>
        <Input
          id="productImages"
          type="file"
          accept="image/*"
          multiple
          className="rounded-xl border-border/40 focus:border-primary/50"
          onChange={handleImageUpload}
        />
        {imagePreviews && imagePreviews.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {imagePreviews.map((image, index) => (
              <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border/30 shadow-sm group">
                <Image
                  src={image}
                  alt={`Product preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">Regular Price (₹)</Label>
          <Input
            placeholder="0.00"
            id="price"
            type="number"
            value={formData.price || ''}
            onChange={(e) => onFieldChange('price', Number(e.target.value))}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salePrice" className="text-sm font-medium">Sale Price (₹)</Label>
          <Input
            placeholder="0.00"
            id="salePrice"
            type="number"
            value={formData.salePrice || ''}
            onChange={(e) => onFieldChange('salePrice', Number(e.target.value))}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock" className="text-sm font-medium">Stock Quantity</Label>
          <Input
            placeholder="0"
            id="stock"
            type="number"
            value={formData.stock || ''}
            onChange={(e) => onFieldChange('stock', Number(e.target.value))}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
      </div>

      {/* GST and Final Price Display */}
      {selectedCategory && selectedCategory.gstType !== 'none' && formData.salePrice && (
        <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Category GST</Label>
              <div className="flex items-center gap-2">
                {selectedCategory.gstType === 'fixed' ? (
                  <Badge variant="secondary" className="text-sm">₹{selectedCategory.gstValue} Fixed</Badge>
                ) : (
                  <Badge variant="secondary" className="text-sm">{selectedCategory.gstValue}%</Badge>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">GST Amount</Label>
              <div className="text-lg font-semibold">₹{gstAmount.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Final Price (incl. GST)</Label>
              <div className="text-lg font-bold text-primary">₹{calculatedFinalPrice.toFixed(2)}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Calculation: Sale Price (₹{Number(formData.salePrice).toFixed(2)}) + GST (₹{gstAmount.toFixed(2)}) = Final Price (₹{calculatedFinalPrice.toFixed(2)})
          </p>
        </div>
      )}

      {/* New Fields Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
          <Input
            placeholder="Enter brand name"
            id="brand"
            value={formData.brand || ''}
            onChange={(e) => onFieldChange('brand', e.target.value)}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="productForm" className="text-sm font-medium">Product Form</Label>
          <Input
            placeholder="e.g., serum, cream, oil, powder"
            id="productForm"
            value={formData.productForm || ''}
            onChange={(e) => onFieldChange('productForm', e.target.value)}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size" className="text-sm font-medium">Size</Label>
          <Input
            placeholder="Enter size"
            id="size"
            value={formData.size || ''}
            onChange={(e) => onFieldChange('size', e.target.value)}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sizeMetric" className="text-sm font-medium">Size Metric</Label>
          <Input
            placeholder="e.g., grams, ml, litre, pieces"
            id="sizeMetric"
            value={formData.sizeMetric || ''}
            onChange={(e) => onFieldChange('sizeMetric', e.target.value)}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="forBodyPart" className="text-sm font-medium">For Body Part</Label>
          <Input
            placeholder="e.g., body skin, face, nails, hair"
            id="forBodyPart"
            value={formData.forBodyPart || ''}
            onChange={(e) => onFieldChange('forBodyPart', e.target.value)}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bodyPartType" className="text-sm font-medium">Body Part Type</Label>
          <Input
            placeholder="e.g., fair skin, rough skin, oily skin"
            id="bodyPartType"
            value={formData.bodyPartType || ''}
            onChange={(e) => onFieldChange('bodyPartType', e.target.value)}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keyIngredients" className="text-sm font-medium">Key Ingredients</Label>
        <Input
          placeholder="Enter ingredients separated by commas (e.g., Vitamin C, Hyaluronic Acid, Retinol)"
          id="keyIngredients"
          value={Array.isArray(formData.keyIngredients) ? formData.keyIngredients.join(', ') : formData.keyIngredients || ''}
          onChange={(e) => {
            const ingredients: string[] = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            onFieldChange('keyIngredients', ingredients);
          }}
          className="rounded-xl border-border/40 focus:border-primary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">Separate multiple ingredients with commas</p>
      </div>
    </>
  );
};

export default ProductFormFields;