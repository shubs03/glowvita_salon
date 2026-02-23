"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Skeleton } from '@repo/ui/skeleton';
import { Plus, Package, Store } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetAdminProductCategoriesQuery,
  useCreateAdminProductCategoryMutation,
  useGetCrmProductsQuery,
  useCreateCrmProductMutation,
  useUpdateCrmProductMutation,
  useDeleteCrmProductMutation,
} from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import BulkProductAddition from '@/components/BulkProductAddition';

// Import components
import StatsCards from './components/StatsCards';
import FiltersToolbar from './components/FiltersToolbar';
import ProductCard from './components/ProductCard';
import ProductListItem from './components/ProductListItem';
import ProductModal from './components/ProductModal';
import ProductViewModal from './components/ProductViewModal';
import CategoryModal from './components/CategoryModal';
import DeleteModal from './components/DeleteModal';
import PaginationControls from './components/PaginationControls';

// Types
interface Product {
  _id: string;
  productImages: string[];
  productName: string;
  price: number;
  salePrice: number;
  category: string;
  categoryDescription?: string;
  stock: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  status: "pending" | "approved" | "disapproved" | "rejected";
  rejectionReason?: string;
  size?: string;
  sizeMetric?: string;
  keyIngredients?: string[];
  forBodyPart?: string;
  bodyPartType?: string;
  productForm?: string;
  brand?: string;
  vendorId?: { name: string };
  supplierName?: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  gstType?: "none" | "fixed" | "percentage";
  gstValue?: number;
}

export default function SupplierProductsPage() {
  const { user } = useCrmAuth();

  // RTK Query Hooks
  const { data: productsData = [], isLoading: isProductsLoading, refetch: refetchProducts } = useGetCrmProductsQuery(user?._id, { skip: !user });
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateCrmProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateCrmProductMutation();
  const [deleteProduct, { isLoading: isDeletingProduct }] = useDeleteCrmProductMutation();

  const { data: categoriesDatas = { data: [] }, isLoading: isCategoriesLoading, refetch: refetchCategories } = useGetAdminProductCategoriesQuery({});
  const categoriesData = categoriesDatas?.data || [];
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateAdminProductCategoryMutation();

  // Component State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [formData, setFormData] = useState<Partial<Product>>({});

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(productsData)) return [];
    return productsData.filter(p =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'all' || p.status === statusFilter)
    );
  }, [productsData, searchTerm, statusFilter]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(firstItemIndex, firstItemIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  // Calculate product statistics
  const productStats = useMemo(() => {
    if (!Array.isArray(productsData)) return { totalProducts: 0, pendingProducts: 0, categories: 0, totalValue: 0 };

    const totalProducts = productsData.length;
    const pendingProducts = productsData.filter(p => p.status === 'pending').length;

    const uniqueCategories = [...new Set(productsData.map(p => p.category))];
    const categories = uniqueCategories.length;

    const totalValue = productsData.reduce((sum, p) => sum + p.salePrice * p.stock, 0);

    return { totalProducts, pendingProducts, categories, totalValue };
  }, [productsData]);

  // Calculate filtered statistics
  const filteredProductStats = useMemo(() => {
    if (!Array.isArray(filteredProducts)) return { filteredTotalValue: 0, filteredCategories: 0 };

    const filteredTotalValue = filteredProducts.reduce((sum, p) => sum + p.salePrice * p.stock, 0);
    const uniqueFilteredCategories = [...new Set(filteredProducts.map(p => p.category))];
    const filteredCategories = uniqueFilteredCategories.length;

    return { filteredTotalValue, filteredCategories };
  }, [filteredProducts]);

  // Handlers
  const handleOpenProductModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    setFormData(product || {
      price: 0, salePrice: 0, stock: 0, isActive: true, status: 'pending'
    });
    setIsProductModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.productName?.trim() || !formData.category?.trim()) {
      toast.error('Product Name and Category are required.');
      return;
    }

    const mutation = selectedProduct ? updateProduct : createProduct;
    let payload = selectedProduct ? { id: selectedProduct._id, ...formData } : formData;

    if (
      selectedProduct &&
      (selectedProduct.status === "disapproved" ||
        selectedProduct.status === "rejected")
    ) {
      payload = { ...payload, status: "pending" };
    }

    try {
      await mutation(payload).unwrap();
      toast.success(`Product ${selectedProduct ? 'updated' : 'created'} successfully!`);
      setIsProductModalOpen(false);
      refetchProducts();
    } catch (error: any) {
      toast.error(error.data?.message || `Failed to save product.`);
    }
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      try {
        // delete data
        await deleteProduct(selectedProduct._id).unwrap();
        toast.success('Product deleted successfully!');
        setIsDeleteModalOpen(false);
        refetchProducts();
      } catch (error: any) {
        toast.error(error.data?.message || `Failed to delete product.`);
      }
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    try {
      await createCategory(newCategory).unwrap();
      toast.success('Category created successfully!');
      setIsCategoryModalOpen(false);
      setNewCategory({ name: '', description: '' });
      refetchCategories();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to create category.');
    }
  };

  if (isProductsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-96" />
              </div>
            </div>
          </div>

          <Card className="bg-card border border-border rounded-lg">
            <CardHeader className="pb-6">
              <div className="flex justify-between items-center">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-xl bg-card border border-border/30">
                    <div className="relative aspect-square">
                      <Skeleton className="h-full w-full rounded-t-xl" />
                    </div>
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 flex-1 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold font-headline mb-2 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Supplier Product Catalog
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Manage your product inventory and track sales performance
              </p>
            </div>
          </div>
        </div>

        {/* Product Statistics Cards */}
        <StatsCards productStats={productStats} filteredProductStats={filteredProductStats} />

        {/* Search and Filters */}
        <div className="rounded-lg">
          <div className="">
            <FiltersToolbar
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              viewMode={viewMode}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onViewModeChange={setViewMode}
              onAddProduct={() => handleOpenProductModal()}
            />
          </div>
        </div>

        {/* Products Section */}
        <Card className="bg-card border border-border rounded-lg">
          <CardContent className="p-6">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="mx-auto w-32 h-32 mb-8 bg-muted/20 rounded-2xl flex items-center justify-center border border-border">
                  <Package className="h-16 w-16 text-muted-foreground/60" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">No products found</h3>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto leading-relaxed">
                  Create your first product to start building your catalog.
                </p>
                <Button
                  onClick={() => handleOpenProductModal()}
                  className="rounded-lg bg-primary hover:bg-primary/90 px-6 h-12"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedProducts.map((product: Product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onView={handleViewProduct}
                    onEdit={(p) => handleOpenProductModal(p)}
                    onDelete={(p) => { setSelectedProduct(p); setIsDeleteModalOpen(true); }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProducts.map((product) => (
                  <ProductListItem
                    key={product._id}
                    product={product}
                    onView={handleViewProduct}
                    onEdit={(p) => handleOpenProductModal(p)}
                    onDelete={(p) => { setSelectedProduct(p); setIsDeleteModalOpen(true); }}
                  />
                ))}
              </div>
            )}

            {paginatedProducts.length > 0 && (
              <div className="mt-8">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredProducts.length}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
          isSaving={isCreatingProduct || isUpdatingProduct}
          selectedProduct={selectedProduct}
          formData={formData}
          setFormData={setFormData}
          categoriesData={categoriesData}
          onAddCategory={() => setIsCategoryModalOpen(true)}
        />

        <ProductViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          product={selectedProduct}
          categories={categoriesData}
        />

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          isCreating={isCreatingCategory}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteProduct}
          isDeleting={isDeletingProduct}
          productName={selectedProduct?.productName}
        />

        <BulkProductAddition
          isOpen={isBulkModalOpen}
          onOpenChange={setIsBulkModalOpen}
          onProductsAdded={refetchProducts}
        />
      </div>
    </div>
  );
}
