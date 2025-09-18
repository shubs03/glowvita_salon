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
                await deleteProduct({ id: selectedProduct._id }).unwrap();
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
    
    // Other UI logic...
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            disapproved: 'bg-red-100 text-red-800'
        };
        return <Badge className={statusMap[status] || 'bg-gray-100'}>{status}</Badge>;
    };

    if (isProductsLoading) {
        // ... skeleton loading UI ...
        return <div>Loading products...</div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-headline mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Product Catalog
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your product inventory and track sales performance
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-sm font-medium">Total Products</p>
                                    <p className="text-3xl font-bold text-blue-900">{filteredProducts.length}</p>
                                </div>
                                <Package className="h-12 w-12 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-medium">Active Products</p>
                                    <p className="text-3xl font-bold text-green-900">
                                        {filteredProducts.filter(p => p.isActive && p.status === 'approved').length}
                                    </p>
                                </div>
                                <PackageCheck className="h-12 w-12 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-600 text-sm font-medium">Pending Approval</p>
                                    <p className="text-3xl font-bold text-yellow-900">
                                        {filteredProducts.filter(p => p.status === 'pending').length}
                                    </p>
                                </div>
                                <Archive className="h-12 w-12 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-600 text-sm font-medium">Revenue</p>
                                    <p className="text-3xl font-bold text-purple-900">
                                        ₹{filteredProducts.reduce((acc, p) => acc + (p.salePrice * (p.stock || 0)), 0).toFixed(0)}
                                    </p>
                                </div>
                                <TrendingUp className="h-12 w-12 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="backdrop-blur-xl bg-background/95 border-border/50 shadow-xl">
                    <CardHeader className="pb-6">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                            <div>
                                <CardTitle className="text-2xl mb-2 flex items-center gap-3">
                                    <Store className="h-6 w-6 text-primary" />
                                    My Product Catalog
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Manage products you sell directly to customers. Add, edit, and track inventory.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search products..."
                                        className="w-full lg:w-80 pl-12 pr-4 h-12 rounded-2xl border-border/30 focus:border-primary focus:ring-primary/20 bg-background/50"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Status Filter */}
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px] h-12 rounded-xl border-border/30">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="disapproved">Disapproved</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* View Toggle */}
                                <div className="flex items-center border border-border/30 rounded-xl p-1">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-lg"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-lg"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Add Product Button */}
                                <Button 
                                    onClick={() => handleOpenProductModal()}
                                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Add Product
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {paginatedProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="mx-auto w-32 h-32 mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                                    <Package className="h-16 w-16 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                <p className="text-muted-foreground mb-6">Create your first product to start selling.</p>
                                <Button onClick={() => handleOpenProductModal()}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Product
                                </Button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedProducts.map((product, index) => (
                                    <Card 
                                        key={product._id} 
                                        className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-border/30 hover:border-primary/30 bg-gradient-to-br from-background to-muted/20 hover:-translate-y-2"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="relative aspect-square overflow-hidden">
                                            <Image 
                                                src={product.productImage || 'https://placehold.co/400x400.png'} 
                                                alt={product.productName} 
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                            />
                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3">
                                                {getStatusBadge(product.status)}
                                            </div>
                                            {/* Active/Inactive Badge */}
                                            <div className="absolute top-3 right-3">
                                                <Badge variant={product.isActive ? "secondary" : "destructive"} className="rounded-full">
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            {/* Quick Actions */}
                                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-md shadow-lg"
                                                        onClick={() => handleOpenProductModal(product)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-md hover:bg-red-50 hover:text-red-600 shadow-lg"
                                                        onClick={() => { setSelectedProduct(product); setIsDeleteModalOpen(true); }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-5 space-y-4">
                                            <div>
                                                <h3 className="font-bold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {product.productName}
                                                </h3>
                                                <Badge variant="outline" className="rounded-full text-xs">
                                                    {product.category}
                                                </Badge>
                                            </div>

                                            {/* Price Section */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-2xl font-bold text-primary">₹{product.salePrice.toFixed(2)}</p>
                                                        {product.price > product.salePrice && (
                                                            <p className="text-sm line-through text-muted-foreground">₹{product.price.toFixed(2)}</p>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">per unit</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">Stock</p>
                                                    <p className="text-lg font-bold">{product.stock}</p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 rounded-xl border-border/50 hover:border-primary/50 hover:bg-primary/5"
                                                    onClick={() => handleOpenProductModal(product)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="rounded-xl"
                                                    onClick={() => { setSelectedProduct(product); setIsDeleteModalOpen(true); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            /* List View */
                            <div className="space-y-4">
                                {paginatedProducts.map((product, index) => (
                                    <Card 
                                        key={product._id} 
                                        className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-background to-muted/20"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-6">
                                                <Image 
                                                    src={product.productImage || 'https://placehold.co/100x100.png'} 
                                                    alt={product.productName} 
                                                    width={100} 
                                                    height={100} 
                                                    className="rounded-xl object-cover border border-border/20" 
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-xl mb-2">{product.productName}</h3>
                                                            <div className="flex items-center gap-4 mb-3">
                                                                <Badge variant="outline" className="rounded-full">
                                                                    {product.category}
                                                                </Badge>
                                                                {getStatusBadge(product.status)}
                                                                <Badge variant={product.isActive ? "secondary" : "destructive"} className="rounded-full">
                                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </div>
                                                            {product.description && (
                                                                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                                                    {product.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right ml-6">
                                                            <div className="flex items-baseline gap-2 mb-1">
                                                                <p className="text-2xl font-bold text-primary">₹{product.salePrice.toFixed(2)}</p>
                                                                {product.price > product.salePrice && (
                                                                    <p className="text-sm line-through text-muted-foreground">₹{product.price.toFixed(2)}</p>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-3">Stock: {product.stock}</p>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleOpenProductModal(product)}
                                                                    className="rounded-lg"
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => { setSelectedProduct(product); setIsDeleteModalOpen(true); }}
                                                                    className="rounded-lg"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
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

            {/* Product Form Modal */}
            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                     <DialogHeader>
                        <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                     </DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="productName">Product Name</Label>
                                <Input placeholder='Product Name' id="productName" value={formData.productName || ''} onChange={(e) => setFormData(prev => ({...prev, productName: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <div className="flex gap-2">
                                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {categoriesData?.map((cat: Category) => <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" onClick={() => setIsCategoryModalOpen(true)}><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea placeholder='Description' id="description" value={formData.description || ''} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="productImage">Product Image</Label>
                            <Input 
                                id="productImage" 
                                type="file" 
                                accept="image/*"
                                placeholder='Upload Image'
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
                                <div className="mt-2">
                                    <img 
                                        src={formData.productImage} 
                                        alt="Product preview" 
                                        className="w-20 h-20 object-cover rounded border"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input placeholder='Price' id="price" type="number" value={formData.price || ''} onChange={(e) => setFormData(prev => ({...prev, price: Number(e.target.value)}))}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salePrice">Sale Price</Label>
                                <Input placeholder='Sale Price' id="salePrice" type="number" value={formData.salePrice || ''} onChange={(e) => setFormData(prev => ({...prev, salePrice: Number(e.target.value)}))}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input placeholder='Stock' id="stock" type="number" value={formData.stock || ''} onChange={(e) => setFormData(prev => ({...prev, stock: Number(e.target.value)}))}/>
                            </div>
                        </div>
                     </div>
                     <DialogFooter>
                         <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                         <Button onClick={handleSaveProduct} disabled={isCreatingProduct || isUpdatingProduct}>Save</Button>
                     </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Category Modal */}
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="Category Name" value={newCategory.name} onChange={(e) => setNewCategory(prev => ({...prev, name: e.target.value}))} />
                        <Textarea placeholder="Description" value={newCategory.description} onChange={(e) => setNewCategory(prev => ({...prev, description: e.target.value}))} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveCategory} disabled={isCreatingCategory}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Product?</DialogTitle></DialogHeader>
                    <p>Are you sure you want to delete "{selectedProduct?.productName}"?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteProduct} disabled={isDeletingProduct}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>
    );
}
