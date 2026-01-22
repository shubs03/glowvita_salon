import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Button } from '@repo/ui/button';
import { Trash2, Plus } from 'lucide-react';

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
  status?: 'pending' | 'approved' | 'disapproved';
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
          <Label htmlFor="productName" className="text-sm font-medium">Product Name</Label>
          <Input 
            placeholder="Enter product name" 
            id="productName" 
            value={formData.productName || ''} 
            onChange={(e) => onFieldChange('productName', e.target.value)}
            className="rounded-xl border-border/40 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">Category</Label>
          <div className="flex gap-2">
            <Select value={formData.category} onValueChange={(value) => onFieldChange('category', value)}>
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
              <Plus className="h-4 w-4"/>
            </Button>
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