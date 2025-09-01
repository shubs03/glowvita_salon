
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Pagination } from '@repo/ui/pagination';
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
import {
  Plus,
  Search,
  FileDown,
  Edit,
  Trash2,
  Truck,
  PackageCheck,
  Archive,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@repo/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import {
  useGetAdminProductCategoriesQuery,
  useCreateAdminProductCategoryMutation,
  useGetCrmProductsQuery,
  useCreateCrmProductMutation,
  useUpdateCrmProductMutation,
  useDeleteCrmProductMutation,
  useGetShippingConfigQuery,
  useUpdateShippingConfigMutation,
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
};

type Category = {
  _id: string;
  name: string;
  description: string;
};

type Order = {
  id: string;
  productImage: string;
  productName: string;
  customerName: string;
  date: string;
  price: number;
  salePrice: number;
  quantity: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
};

const mockOrders: Order[] = [
  // ... mock orders data
];

export default function ProductsPage() {
    const { user } = useCrmAuth();
    
    // RTK Query Hooks
    const { data: productsData = [], isLoading: isProductsLoading, refetch: refetchProducts } = useGetCrmProductsQuery({});
    const [createProduct, { isLoading: isCreatingProduct }] = useCreateCrmProductMutation();
    const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateCrmProductMutation();
    const [deleteProduct, { isLoading: isDeletingProduct }] = useDeleteCrmProductMutation();
    
    const { data: categoriesData = [], isLoading: isCategoriesLoading, refetch: refetchCategories } = useGetAdminProductCategoriesQuery({});
    const [createCategory, { isLoading: isCreatingCategory }] = useCreateAdminProductCategoryMutation();
    
    const { data: shippingConfig, isLoading: isShippingLoading } = useGetShippingConfigQuery({});
    const [updateShippingConfig, { isLoading: isUpdatingShipping }] = useUpdateShippingConfigMutation();

    // Component State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [formData, setFormData] = useState<Partial<Product>>({});
    
    const [shippingEnabled, setShippingEnabled] = useState(false);
    const [shippingType, setShippingType] = useState<'fixed' | 'percentage'>('fixed');
    const [shippingValue, setShippingValue] = useState(0);

    // Memos and useEffects
    useEffect(() => {
        if (shippingConfig) {
            setShippingEnabled(shippingConfig.isEnabled);
            setShippingType(shippingConfig.chargeType);
            setShippingValue(shippingConfig.amount);
        }
    }, [shippingConfig]);
    
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
    
    const handleSaveShipping = async () => {
        try {
            await updateShippingConfig({
                chargeType: shippingType,
                amount: shippingValue,
                isEnabled: shippingEnabled,
            }).unwrap();
            toast.success('Shipping settings saved!');
            setIsShippingModalOpen(false);
        } catch (error: any) {
            toast.error(error.data?.message || 'Failed to save shipping settings.');
        }
    };
    
    // Other UI logic...
    const getStatusBadge = (status) => {
        const statusMap = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            disapproved: 'bg-red-100 text-red-800'
        };
        return <Badge className={statusMap[status] || 'bg-gray-100'}>{status}</Badge>;
    };

    if (isProductsLoading) return <p>Loading products...</p>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Products & Orders</h1>

            <Tabs defaultValue="products">
                <TabsList>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>All Products</CardTitle>
                                    <CardDescription>Manage your product catalog.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleOpenProductModal()}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Product
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsShippingModalOpen(true)}>
                                        <Truck className="mr-2 h-4 w-4" /> Shipping
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {paginatedProducts.map(product => (
                                    <Card key={product._id} className="group">
                                        <CardContent className="p-0">
                                            <div className="relative aspect-square">
                                                <Image src={product.productImage || 'https://placehold.co/400x400.png'} alt={product.productName} layout="fill" className="object-cover rounded-t-lg" />
                                                <div className="absolute top-2 right-2">
                                                    {getStatusBadge(product.status)}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold truncate">{product.productName}</h3>
                                                <p className="text-sm text-muted-foreground">{product.category}</p>
                                                <div className="flex items-baseline gap-2 mt-2">
                                                    <p className="text-lg font-bold">₹{product.salePrice.toFixed(2)}</p>
                                                    {product.price > product.salePrice && <p className="text-sm line-through text-muted-foreground">₹{product.price.toFixed(2)}</p>}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">Stock: {product.stock}</p>
                                                <div className="mt-2 flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenProductModal(product)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelectedProduct(product); setIsDeleteModalOpen(true); }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <Pagination
                                className="mt-6"
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={setItemsPerPage}
                                totalItems={filteredProducts.length}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>A log of all product orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Order history will be displayed here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
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
                                <Input id="productName" value={formData.productName} onChange={(e) => setFormData(prev => ({...prev, productName: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <div className="flex gap-2">
                                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {categoriesData?.map(cat => <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" onClick={() => setIsCategoryModalOpen(true)}><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData(prev => ({...prev, price: Number(e.target.value)}))}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salePrice">Sale Price</Label>
                                <Input id="salePrice" type="number" value={formData.salePrice} onChange={(e) => setFormData(prev => ({...prev, salePrice: Number(e.target.value)}))}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData(prev => ({...prev, stock: Number(e.target.value)}))}/>
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

             {/* Shipping Modal */}
            <Dialog open={isShippingModalOpen} onOpenChange={setIsShippingModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Shipping Charges</DialogTitle></DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="shipping-enabled">Enable Shipping Charges</Label>
                            <Switch id="shipping-enabled" checked={shippingEnabled} onCheckedChange={setShippingEnabled} />
                        </div>
                         {shippingEnabled && (
                             <div className="space-y-4 pt-4 border-t">
                                <RadioGroup value={shippingType} onValueChange={(value) => setShippingType(value as any)}>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="fixed" id="fixed" /><Label htmlFor="fixed">Fixed Rate</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="percentage" id="percentage" /><Label htmlFor="percentage">Percentage</Label></div>
                                </RadioGroup>
                                 <Input type="number" placeholder="Value" value={shippingValue} onChange={(e) => setShippingValue(Number(e.target.value))} />
                            </div>
                         )}
                     </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsShippingModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveShipping} disabled={isUpdatingShipping}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
