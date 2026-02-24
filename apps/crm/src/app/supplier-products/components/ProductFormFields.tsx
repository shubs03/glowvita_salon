import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Button } from '@repo/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useGetProductMastersQuery } from '@repo/store/api';
import { Badge } from '@repo/ui/badge';
import { Switch } from '@repo/ui/switch';

interface Product {
  productName?: string;
  category?: string;
  description?: string;
  productImages?: string[];
  price?: number;
  salePrice?: number;
  stock?: number;
  brand?: string;
  productForm?: string;
  size?: string;
  sizeMetric?: string;
  forBodyPart?: string;
  bodyPartType?: string;
  keyIngredients?: string[];
  showOnWebsite?: boolean;
}

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

interface ProductFormFieldsProps {
  formData: Partial<Product>;
  setFormData: (data: Partial<Product> | ((prev: Partial<Product>) => Partial<Product>)) => void;
  categoriesData: Category[];
  onAddCategory: () => void;
}

const ProductFormFields = ({ formData, setFormData, categoriesData, onAddCategory }: ProductFormFieldsProps) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>(formData.productImages || []);
  const [calculatedFinalPrice, setCalculatedFinalPrice] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);

  // Fetch product masters
  const { data: productMastersData, isLoading: productMastersLoading, error: productMastersError } = useGetProductMastersQuery(undefined);
  const productMasters = productMastersData || [];

  // Debug logging
  useEffect(() => {
    if (productMastersData) {
      console.log('[Supplier Products] Product Masters loaded:', productMasters.length, 'items');
      console.log('[Supplier Products] Sample product master:', productMasters[0]);
    }
  }, [productMastersData, productMasters]);

  // Get selected category details
  const selectedCategory = useMemo(() => {
    if (!formData.category) return null;
    return categoriesData.find((cat: Category) => cat.name === formData.category);
  }, [formData.category, categoriesData]);

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
      calculatedGst = gstValue;
    } else if (selectedCategory.gstType === 'percentage') {
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
    console.log(`[Supplier Products] Filtering for category "${formData.category}":`, filtered.length, 'products');
    return filtered;
  }, [productMasters, formData.category]);

  // Update image previews when formData changes
  useEffect(() => {
    setImagePreviews(formData.productImages || []);
  }, [formData.productImages]);

  // Handle product master selection
  const handleProductMasterChange = (productName: string) => {
    // Allow manual entry by checking if it's a special value
    if (productName === 'manual-entry') {
      return; // Don't update, let user type
    }

    setFormData(prev => ({ ...prev, productName }));

    // Find the selected product master and auto-fill fields
    const selectedProductMaster = productMastersForCategory.find(
      (pm: ProductMaster) => pm.name === productName
    );

    if (selectedProductMaster) {
      setFormData(prev => ({
        ...prev,
        brand: selectedProductMaster.brand || prev.brand,
        description: selectedProductMaster.description || prev.description,
        productForm: selectedProductMaster.productForm || prev.productForm,
        keyIngredients: selectedProductMaster.keyIngredients || prev.keyIngredients,
      }));

      // Auto-fill default image if exists and no images are present
      if (selectedProductMaster.productImage && (!formData.productImages || formData.productImages.length === 0)) {
        setFormData(prev => ({
          ...prev,
          productImages: [selectedProductMaster.productImage!]
        }));
        setImagePreviews([selectedProductMaster.productImage]);
      }
    }
  };

  // Handle category change - reset product name when category changes
  const handleCategoryChange = (categoryName: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryName,
      productName: '' // Reset product name when category changes
    }));
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
        setFormData(prev => ({
          ...prev,
          productImages: [...(prev.productImages || []), ...base64Images]
        }));
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.productImages || [])];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      productImages: newImages
    }));
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
                {categoriesData?.map((cat: Category) => (
                  <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={onAddCategory}
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
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
        {formData.productImages && formData.productImages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.productImages.map((image, index) => (
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
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
      </div>

      {/* GST and Final Price Display */}
      {selectedCategory && selectedCategory.gstType && selectedCategory.gstType !== 'none' && formData.salePrice && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sale Price:</span>
              <span className="text-sm font-medium">₹{Number(formData.salePrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                GST ({selectedCategory.gstType === 'fixed' ? `₹${selectedCategory.gstValue}` : `${selectedCategory.gstValue}%`}):
              </span>
              <span className="text-sm font-medium text-primary">₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-border/40">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Final Price (inc. GST):</span>
                <Badge variant="default" className="text-base font-bold px-3 py-1">
                  ₹{calculatedFinalPrice.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
          <Input
            placeholder="Enter brand name"
            id="brand"
            value={formData.brand || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="productForm" className="text-sm font-medium">Product Form</Label>
          <Input
            placeholder="e.g., serum, cream, oil, powder"
            id="productForm"
            value={formData.productForm || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, productForm: e.target.value }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sizeMetric" className="text-sm font-medium">Size Metric</Label>
          <Input
            placeholder="e.g., grams, ml, litre, pieces"
            id="sizeMetric"
            value={formData.sizeMetric || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, sizeMetric: e.target.value }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, forBodyPart: e.target.value }))}
            className="rounded-xl border-border/40 focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bodyPartType" className="text-sm font-medium">Body Part Type</Label>
          <Input
            placeholder="e.g., fair skin, rough skin, oily skin"
            id="bodyPartType"
            value={formData.bodyPartType || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, bodyPartType: e.target.value }))}
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
            setFormData(prev => ({ ...prev, keyIngredients: ingredients }));
          }}
          className="rounded-xl border-border/40 focus:border-primary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">Separate multiple ingredients with commas</p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/5">
        <div className="space-y-0.5">
          <Label htmlFor="showOnWebsite" className="text-sm font-medium">Show on Website</Label>
          <p className="text-xs text-muted-foreground">
            Decide whether this product should be displayed on the public website.
          </p>
        </div>
        <Switch
          id="showOnWebsite"
          checked={formData.showOnWebsite !== false}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnWebsite: checked }))}
        />
      </div>
    </>
  );
};

export default ProductFormFields;
