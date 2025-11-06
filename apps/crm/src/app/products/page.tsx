"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Pagination } from '@repo/ui/pagination';
import { Skeleton } from '@repo/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Switch } from '@repo/ui/switch';
import {
  Plus,
  Search,
  FileDown,
  Edit,
  Trash2,
  PackageCheck,
  Archive,
  Loader2,
  Store,
  Eye,
  TrendingUp,
  ShoppingCart,
  Star,
  MoreVertical,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@repo/ui/textarea';
import {
  useGetAdminProductCategoriesQuery,
  useCreateAdminProductCategoryMutation,
  useGetCrmProductsQuery,
  useCreateCrmProductMutation,
  useUpdateCrmProductMutation,
  useDeleteCrmProductMutation,
} from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';

// Types
type Product = {
  _id: string;
  productImage: string;
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
  status: 'pending' | 'approved' | 'disapproved';
  vendorId?: { name: string };
};

type Category = {
  _id: string;
  name: string;
  description: string;
};

export default function ProductsPage() {
    const { user } = useCrmAuth();
    
    // RTK Query Hooks
    const { data: productsData = [], isLoading: isProductsLoading, refetch: refetchProducts } = useGetCrmProductsQuery(user?._id, { skip: !user });
    const [createProduct, { isLoading: isCreatingProduct }] = useCreateCrmProductMutation();
    const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateCrmProductMutation();
    const [deleteProduct, { isLoading: isDeletingProduct }] = useDeleteCrmProductMutation();
    
    const { data: categoriesDatas = [], isLoading: isCategoriesLoading, refetch: refetchCategories } = useGetAdminProductCategoriesQuery({});

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
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [formData, setFormData] = useState<Partial<Product>>({});

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(productsData)) return [];
        return productsData.filter(p => 
            p.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (statusFilter === 'all' || p.status === statusFilter)
        );
    }, [productsData, searchTerm, statusFilter]);

    const paginatedProducts = useMemo(() => {
        const firstItemIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(firstItemIndex, firstItemIndex + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

    // Handlers
    const handleOpenProductModal = (product: Product | null = null) => {
        setSelectedProduct(product);
        setFormData(product || { 
            price: 0, salePrice: 0, stock: 0, isActive: true, status: 'pending' 
        });
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!formData.productName?.trim() || !formData.category?.trim()) {
            toast.error('Product Name and Category are required.');
            return;
        }

        const mutation = selectedProduct ? updateProduct : createProduct;
        const payload = selectedProduct ? { id: selectedProduct._id, ...formData } : formData;

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
    
    // Enhanced status badge with better styling
    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
            pending: { 
                bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30', 
                text: 'text-yellow-700 dark:text-yellow-300', 
                icon: '⏳' 
            },
            approved: { 
                bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30', 
                text: 'text-green-700 dark:text-green-300', 
                icon: '✅' 
            },
            disapproved: { 
                bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400/30', 
                text: 'text-red-700 dark:text-red-300', 
                icon: '❌' 
            }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        
        return (
            <Badge 
                className={`${config.bg} ${config.text} border backdrop-blur-sm px-3 py-1 font-medium text-xs rounded-full shadow-sm`}
            >
                <span className="mr-1">{config.icon}</span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
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
                {/* Enhanced Header Section matching marketplace design */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary to-transparent border border-primary/20 shadow-lg backdrop-blur-sm">
                            <Store className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-headline mb-2 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                                Product Catalog
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                                Manage your product inventory and track sales performance
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="bg-card border border-border rounded-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px] h-12 rounded-lg border-border hover:border-primary">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border border-border/40">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="disapproved">Disapproved</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex items-center border border-border rounded-lg p-1">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-md"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-md"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button 
                                    onClick={() => handleOpenProductModal()}
                                    className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Section */}
                <Card className="bg-card border border-border rounded-lg">
                    <CardHeader className="pb-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    My Products
                                </CardTitle>
                                <CardDescription className="text-muted-foreground mt-2 text-base">
                                    {filteredProducts.length} products in your catalog
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-sm font-medium px-4 py-2 rounded-full border-border bg-background">
                                    <Package className="h-3 w-3 mr-1" />
                                    {filteredProducts.length} Products
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
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
                              <Card
                                key={product._id}
                                className="group overflow-hidden hover:shadow-lg transition-shadow flex flex-col text-left"
                              >
                                <div className="relative aspect-square overflow-hidden rounded-md m-3">
                                  <Image
                                    src={product.productImage || 'https://placehold.co/300x300.png'}
                                    alt={product.productName}
                                    fill
                                    className="group-hover:scale-105 transition-transform duration-300 object-cover"
                                  />
                                  <Badge
                                    variant={product.stock > 0 ? "secondary" : "default"}
                                    className="absolute top-2 right-2 text-xs"
                                  >
                                    {product.stock > 0 ? `In Stock` : "Out of Stock"}
                                  </Badge>
                                  {/* Status Badge */}
                                  <div className="absolute top-2 left-2">
                                    {getStatusBadge(product.status)}
                                  </div>
                                </div>
                                <div className="p-3 flex flex-col flex-grow">
                                  <p className="text-xs font-bold text-primary mb-1">
                                    {product.category}
                                  </p>
                                  <h4 className="text-sm font-semibold flex-grow mb-2">
                                    {product.productName}
                                  </h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {product.description || "No description available"}
                                  </p>
                                  <div className="flex justify-between items-center mt-auto">
                                    <p className="font-bold text-primary">
                                      ₹{product.salePrice.toFixed(2)}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-blue-400 fill-current" />
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {(4.2 + Math.random() * 0.8).toFixed(1)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 mt-2">
                                    <div className="flex justify-between w-full">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs lg:mr-3"
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          handleOpenProductModal(product); 
                                        }}
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-fit text-xs"
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setSelectedProduct(product); 
                                          setIsDeleteModalOpen(true); 
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                            /* Simplified List View */
                            <div className="space-y-4">
                                {paginatedProducts.map((product, index) => (
                                    <Card 
                                        key={product._id} 
                                        className="group relative overflow-hidden border border-border hover:border-border/80 shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-xl hover:-translate-y-1"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-5">
                                                {/* Product Image */}
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/30 bg-muted/20 shadow-sm flex-shrink-0">
                                                    <Image 
                                                        src={product.productImage || 'https://placehold.co/80x80.png'} 
                                                        alt={product.productName} 
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                                                    />
                                                    {product.price > product.salePrice && (
                                                        <div className="absolute -top-1 -right-1">
                                                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                                                                {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 space-y-2">
                                                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                                                                {product.productName}
                                                            </h3>
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="outline" className="rounded-full border-border/40 text-xs">
                                                                    {product.category}
                                                                </Badge>
                                                                {getStatusBadge(product.status)}
                                                                <Badge 
                                                                    variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
                                                                    className="rounded-full text-xs"
                                                                >
                                                                    <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                                                        product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    }`} />
                                                                    {product.stock} units
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="text-right ml-5">
                                                            {/* Price section */}
                                                            <div className="space-y-1 mb-3">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-xl font-bold text-primary">
                                                                        ₹{product.salePrice.toFixed(0)}
                                                                    </span>
                                                                    {product.price > product.salePrice && (
                                                                        <span className="text-sm line-through text-muted-foreground">
                                                                            ₹{product.price.toFixed(0)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Action buttons */}
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleOpenProductModal(product)}
                                                                    className="rounded-lg border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 px-3"
                                                                >
                                                                    <Edit className="mr-1 h-3 w-3" />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => { setSelectedProduct(product); setIsDeleteModalOpen(true); }}
                                                                    className="rounded-lg transition-all duration-300 hover:scale-105 px-3"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                        
                        {paginatedProducts.length > 0 && (
                            <Pagination
                                className="mt-8"
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={setItemsPerPage}
                                totalItems={filteredProducts.length}
                            />
                        )}
                    </CardContent>
                </Card>

            {/* Enhanced Product Form Modal with glassmorphism */}
            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="productName" className="text-sm font-medium">Product Name</Label>
                                <Input 
                                    placeholder="Enter product name" 
                                    id="productName" 
                                    value={formData.productName || ''} 
                                    onChange={(e) => setFormData(prev => ({...prev, productName: e.target.value}))}
                                    className="rounded-xl border-border/40 focus:border-primary/50 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                                <div className="flex gap-2">
                                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
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
                                        onClick={() => setIsCategoryModalOpen(true)}
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
                                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                                className="rounded-xl border-border/40 focus:border-primary/50 focus:ring-primary/20 min-h-[100px]"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="productImage" className="text-sm font-medium">Product Image</Label>
                            <Input 
                                id="productImage" 
                                type="file" 
                                accept="image/*"
                                className="rounded-xl border-border/40 focus:border-primary/50"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const base64String = event.target?.result as string;
                                            setFormData(prev => ({...prev, productImage: base64String}));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {formData.productImage && (
                                <div className="mt-3 flex justify-center">
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border/30 shadow-sm">
                                        <Image 
                                            src={formData.productImage} 
                                            alt="Product preview" 
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
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
                                    onChange={(e) => setFormData(prev => ({...prev, price: Number(e.target.value)}))}
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
                                    onChange={(e) => setFormData(prev => ({...prev, salePrice: Number(e.target.value)}))}
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
                                    onChange={(e) => setFormData(prev => ({...prev, stock: Number(e.target.value)}))}
                                    className="rounded-xl border-border/40 focus:border-primary/50"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Enhanced Footer */}
                    <div className="sticky bottom-0 -mx-6 -mb-6 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
                        <DialogFooter className="gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsProductModalOpen(false)}
                                className="rounded-xl border-border/40 hover:border-border/60 px-6"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSaveProduct} 
                                disabled={isCreatingProduct || isUpdatingProduct}
                                className="rounded-xl bg-primary hover:bg-primary/90 px-6"
                            >
                                {isCreatingProduct || isUpdatingProduct ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {selectedProduct ? 'Update Product' : 'Create Product'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Enhanced Category Modal */}
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-0 bg-background/95 backdrop-blur-xl shadow-2xl">
                    <div className="-mx-6 -mt-6 px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/20">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                Add New Category
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Category Name</Label>
                            <Input 
                                placeholder="Enter category name" 
                                value={newCategory.name} 
                                onChange={(e) => setNewCategory(prev => ({...prev, name: e.target.value}))}
                                className="rounded-xl border-border/40 focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Description</Label>
                            <Textarea 
                                placeholder="Enter category description" 
                                value={newCategory.description} 
                                onChange={(e) => setNewCategory(prev => ({...prev, description: e.target.value}))}
                                className="rounded-xl border-border/40 focus:border-primary/50 min-h-[80px]"
                            />
                        </div>
                    </div>
                    
                    <div className="-mx-6 -mb-6 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
                        <DialogFooter className="gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="rounded-xl border-border/40 hover:border-border/60"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSaveCategory} 
                                disabled={isCreatingCategory}
                                className="rounded-xl bg-primary hover:bg-primary/90"
                            >
                                {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Category
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Enhanced Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
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
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{selectedProduct?.productName}"</span>? 
                            This action cannot be undone.
                        </p>
                    </div>
                    
                    <div className="-mx-6 -mb-6 px-6 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
                        <DialogFooter className="gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="rounded-xl border-border/40 hover:border-border/60"
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteProduct} 
                                disabled={isDeletingProduct}
                                className="rounded-xl"
                            >
                                {isDeletingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete Product
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
            </div>
        </div>
    );
}
