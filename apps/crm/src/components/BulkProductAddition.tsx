'use client';

import { useState, useRef } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@repo/ui/dialog';
import { Textarea } from '@repo/ui/textarea';
import {
  Upload,
  Download,
  X,
  PackagePlus,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateCrmProductMutation } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';

type BulkProductData = {
  productName: string;
  price: number;
  salePrice?: number;
  category: string;
  description?: string;
  stock: number;
  size?: string;
  sizeMetric?: string;
  keyIngredients?: string;
  forBodyPart?: string;
  bodyPartType?: string;
  productForm?: string;
  brand?: string;
  productImages?: string;
};

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

const BulkProductAddition = ({
  isOpen,
  onOpenChange,
  onProductsAdded
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductsAdded: () => void;
}) => {
  const [createProduct] = useCreateCrmProductMutation();
  const { user } = useCrmAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingResults, setProcessingResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample CSV template
  const csvTemplate = [
    ['ProductName', 'Price', 'SalePrice', 'Category', 'Description', 'Stock', 'Size', 'SizeMetric', 'KeyIngredients', 'ForBodyPart', 'BodyPartType', 'ProductForm', 'Brand', 'ProductImages'],
    ['Moisturizer', '499', '399', 'Skincare', 'Hydrating moisturizer', '50', '50', 'ml', 'Hyaluronic Acid, Vitamin E', 'Face', 'Dry Skin', 'Cream', 'GlowVita', 'https://example.com/image1.jpg,https://example.com/image2.jpg'],
    ['Sunscreen', '799', '699', 'Skincare', 'SPF 50 sunscreen', '30', '100', 'ml', 'Zinc Oxide, Titanium Dioxide', 'Body', 'Sensitive Skin', 'Lotion', 'GlowVita', 'https://example.com/sunscreen.jpg']
  ];

  const downloadTemplate = () => {
    const csvContent = csvTemplate.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'product_template.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const validateProductData = (product: BulkProductData): ValidationResult => {
    const errors: string[] = [];

    if (!product.productName?.trim()) {
      errors.push('Product name is required');
    }

    if (product.price === undefined || product.price < 0) {
      errors.push('Valid price is required');
    }

    if (!product.category?.trim()) {
      errors.push('Category is required');
    }

    if (product.stock === undefined || product.stock < 0) {
      errors.push('Valid stock quantity is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const processCSVData = (csvText: string): BulkProductData[] => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
      throw new Error('CSV file must contain at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const products: BulkProductData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());

      if (values.length !== headers.length) {
        continue; // Skip malformed rows
      }

      const product: any = {};
      headers.forEach((header, index) => {
        const value = values[index]?.trim();

        // Convert numeric values
        if (['Price', 'SalePrice', 'Stock'].includes(header)) {
          product[header.toLowerCase()] = value ? parseFloat(value) || 0 : 0;
        } else if (header === 'ProductImages') {
          // Handle product images - convert comma-separated URLs to array
          if (value) {
            product.productImages = value.split(',').map(url => url.trim()).filter(url => url.length > 0);
          } else {
            product.productImages = [];
          }
        } else {
          // Handle other fields
          product[header.toLowerCase()] = value || '';
        }
      });

      products.push(product);
    }

    return products;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file to upload');
      return;
    }

    setIsProcessing(true);
    setProcessingResults({ success: 0, failed: 0, errors: [] });

    try {
      const text = await file.text();
      const products = processCSVData(text);

      if (products.length === 0) {
        toast.error('No valid products found in the CSV file');
        setIsProcessing(false);
        return;
      }

      let successCount = 0;
      const errors: string[] = [];

      // Prepare the bulk payload
      const bulkPayload = {
        products: products.map(product => {
          // Validate the product data
          const validation = validateProductData(product);

          // Prepare the product payload
          const payload: any = {
            productName: product.productName,
            price: product.price,
            salePrice: product.salePrice || 0,
            category: product.category,
            description: product.description || '',
            stock: product.stock,
            size: product.size || '',
            sizeMetric: product.sizeMetric || '',
            forBodyPart: product.forBodyPart || '',
            bodyPartType: product.bodyPartType || '',
            productForm: product.productForm || '',
            brand: product.brand || '',
            productImages: product.productImages || []
          };

          // Process key ingredients if present
          if (product.keyIngredients) {
            const ingredients = product.keyIngredients.split(',').map(i => i.trim()).filter(Boolean);
            payload.keyIngredients = ingredients;
          }

          return payload;
        })
      };

      // Make a single API call to create all products
      const response = await fetch('/api/crm/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(bulkPayload)
      });

      const result = await response.json();

      if (result.success) {
        successCount = result.data?.successCount || result.data?.created?.length || 0;

        // Add any errors to the errors array
        const resultErrors = result.data?.errors || [];
        if (resultErrors && resultErrors.length > 0) {
          resultErrors.forEach((error: any) => {
            errors.push(`Failed to add product "${error.productName}": ${error.error}`);
          });
        }
      } else {
        throw new Error(result.message || 'Bulk creation failed');
      }

      setProcessingResults({
        success: successCount,
        failed: products.length - successCount,
        errors
      });

      toast.success(`Bulk upload completed: ${successCount} products added, ${products.length - successCount} failed`);

      if (successCount > 0) {
        onProductsAdded();
      }
    } catch (error: any) {
      console.error('Error processing bulk upload:', error);
      toast.error(`Error processing bulk upload: ${error.message}`);
      setProcessingResults({
        success: 0,
        failed: 0,
        errors: [error.message]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileName('');
    setProcessingResults({ success: 0, failed: 0, errors: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border-0 bg-background/95 backdrop-blur-xl shadow-2xl">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/20 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent flex items-center gap-3">
              <PackagePlus className="h-6 w-6" />
              Bulk Product Addition
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file to add multiple products at once
            </p>
          </DialogHeader>
        </div>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload CSV File
              </CardTitle>
              <CardDescription>
                Prepare your product data in CSV format and upload it here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                  <p className="text-sm text-muted-foreground flex-1">
                    Use the template to format your product data correctly
                  </p>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center transition-colors hover:border-primary/30">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,.zip"
                    className="hidden"
                    id="csv-upload"
                    aria-label="Upload CSV or ZIP file" />
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <Label
                    htmlFor="csv-upload"
                    className="cursor-pointer block text-sm font-medium text-foreground mb-1"
                  >
                    {fileName ? fileName : 'Click to upload CSV or ZIP file'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    CSV or ZIP files accepted. Max file size: 10MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setFileName('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {processingResults.success > 0 && (
                  <div className="p-3 bg-green-50/80 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">
                        Success: {processingResults.success} product(s) added
                      </p>
                    </div>
                  </div>
                )}

                {processingResults.failed > 0 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-destructive">
                          Failed: {processingResults.failed} product(s)
                        </p>
                        {processingResults.errors.length > 0 && (
                          <ul className="mt-2 space-y-1 text-sm text-destructive/80 list-disc pl-5">
                            {processingResults.errors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Fields</CardTitle>
              <CardDescription>
                These fields must be included in your CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">ProductName *</Label>
                  <p className="text-sm text-muted-foreground">Name of the product</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Price *</Label>
                  <p className="text-sm text-muted-foreground">Regular price (numeric)</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Category *</Label>
                  <p className="text-sm text-muted-foreground">Product category</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Stock *</Label>
                  <p className="text-sm text-muted-foreground">Available stock quantity (numeric)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optional Fields</CardTitle>
              <CardDescription>
                These fields are optional but enhance your product listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SalePrice</Label>
                  <p className="text-sm text-muted-foreground">Discounted price (numeric)</p>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">Product description</p>
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <p className="text-sm text-muted-foreground">Product size (numeric)</p>
                </div>
                <div className="space-y-2">
                  <Label>SizeMetric</Label>
                  <p className="text-sm text-muted-foreground">Unit of measurement (ml, g, etc.)</p>
                </div>
                <div className="space-y-2">
                  <Label>KeyIngredients</Label>
                  <p className="text-sm text-muted-foreground">Comma-separated list</p>
                </div>
                <div className="space-y-2">
                  <Label>ForBodyPart</Label>
                  <p className="text-sm text-muted-foreground">Target body part</p>
                </div>
                <div className="space-y-2">
                  <Label>BodyPartType</Label>
                  <p className="text-sm text-muted-foreground">Skin/hair type</p>
                </div>
                <div className="space-y-2">
                  <Label>ProductForm</Label>
                  <p className="text-sm text-muted-foreground">Form of the product</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Brand</Label>
                  <p className="text-sm text-muted-foreground">Brand name</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>ProductImages</Label>
                  <p className="text-sm text-muted-foreground">Comma-separated URLs of product images (e.g., https://example.com/image1.jpg,https://example.com/image2.jpg)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Footer */}
        <div className="sticky bottom-0 -mx-6 -mb-6 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="rounded-xl border-border/40 hover:border-border/60 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing}
              className="rounded-xl bg-primary hover:bg-primary/90 px-6"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Products
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkProductAddition;