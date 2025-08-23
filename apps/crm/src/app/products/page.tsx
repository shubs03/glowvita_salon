'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchShippingConfig, 
  updateShippingConfig,
  selectShippingConfig,
  selectShippingStatus,
  selectShippingError,
  selectIsShippingEnabled
} from '@repo/store/slices/shippingSlice';
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
  Eye,
  Edit,
  Trash2,
  Truck,
  PackageCheck,
  Archive,
  Check,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@repo/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Switch } from '@repo/ui/switch';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import {
  useGetShippingConfigQuery,
  useUpdateShippingConfigMutation,
  useGetProductCategoriesQuery,
  useCreateProductCategoryMutation,
  useGetCrmProductsQuery,
  useCreateCrmProductMutation,
  useUpdateCrmProductMutation,
  useDeleteCrmProductMutation,
} from '@repo/store/api';

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
};

type Category = {
  name: string;
  description: string;
};

type ProductOrder = {
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

const mockProducts: Product[] = [
  {
    id: 'PROD-001',
    productImage: 'https://placehold.co/400x400.png',
    productName: 'Organic Face Serum',
    price: 85.0,
    salePrice: 75.0,
    category: 'Skincare',
    categoryDescription: 'Products for skin care and treatment',
    stock: 50,
    status: 'Approved',
  },
  {
    id: 'PROD-002',
    productImage: 'https://placehold.co/400x400.png',
    productName: 'Matte Lipstick',
    price: 25.0,
    salePrice: 25.0,
    category: 'Makeup',
    categoryDescription: 'Cosmetic products for makeup',
    stock: 120,
    status: 'Approved',
  },
  {
    id: 'PROD-003',
    productImage: 'https://placehold.co/400x400.png',
    productName: 'Keratin Shampoo',
    price: 45.0,
    salePrice: 40.0,
    category: 'Haircare',
    categoryDescription: 'Products for hair maintenance',
    stock: 0,
    status: 'Disapproved',
  },
  {
    id: 'PROD-004',
    productImage: 'https://placehold.co/400x400.png',
    productName: 'Professional Hair Dryer',
    price: 120.0,
    salePrice: 120.0,
    category: 'Tools',
    categoryDescription: 'Beauty tools and accessories',
    stock: 30,
    status: 'Pending',
  },
];

const mockOrders: ProductOrder[] = [
  {
    id: 'ORD-001',
    productImage: 'https://placehold.co/400x400.png',
    productName: 'Organic Face Serum',
    customerName: 'Alice Johnson',
    date: '2024-08-25',
    price: 85.0,
    salePrice: 75.0,
    quantity: 1,
    status: 'Delivered',
  },
  {
    id: 'ORD-002',
    productImage: 'https://placehold.co/400x400.png',
    productName: 'Matte Lipstick',
    customerName: 'Bob Williams',
    date: '2024-08-24',
    price: 25.0,
    salePrice: 25.0,
    quantity: 2,
    status: 'Shipped',
  },
  {
    id: 'ORD-003',
    productImage: 'https://placehold.co/400x400.png',
    productName: 'Keratin Shampoo',
    customerName: 'Charlie Brown',
    date: '2024-08-23',
    price: 45.0,
    salePrice: 40.0,
    quantity: 1,
    status: 'Processing',
  },
  {
    id: 'ORD-004',
    productImage: 'https://placehold.co/400x400.png',
    productName: 'Professional Hair Dryer',
    customerName: 'Diana Prince',
    date: '2024-08-22',
    price: 120.0,
    salePrice: 120.0,
    quantity: 1,
    status: 'Pending',
  },
  {
    id: 'ORD-005',
    productImage: 'https://placehold.co/400x400.png',
    productName: 'Nail Art Kit',
    customerName: 'Ethan Hunt',
    date: '2024-08-21',
    price: 60.0,
    salePrice: 50.0,
    quantity: 1,
    status: 'Cancelled',
  },
];

export default function ProductsAndOrdersPage() {
  const [orders, setOrders] = useState<ProductOrder[]>(mockOrders);
  
  // Fetch products from CRM API
  const { data: productsData = [], isLoading: isProductsLoading, refetch: refetchProducts } = useGetCrmProductsQuery();
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateCrmProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateCrmProductMutation();
  const [deleteProduct, { isLoading: isDeletingProduct }] = useDeleteCrmProductMutation();
  
  // Fetch categories from Admin API
  const { data: categoriesData, isLoading: isCategoriesLoading, refetch: refetchCategories } = useGetProductCategoriesQuery();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateProductCategoryMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: '',
    categoryDescription: '',
    image: '',
    price: 0,
    salePrice: 0,
    stock: 0,
    status: 'Pending',
  });

  const resetForm = () => {
    setFormData({
      productName: '',
      description: '',
      category: '',
      categoryDescription: '',
      image: '',
      price: 0,
      salePrice: 0,
      stock: 0,
      status: 'Pending',
    });
  };

  // Fetch shipping config using RTK Query
  const { data: shippingConfigData, isLoading: isShippingLoading } = useGetShippingConfigQuery();
  const [updateShippingConfig, { isLoading: isUpdatingShipping }] = useUpdateShippingConfigMutation();


  // Local state for shipping form
  const [shippingEnabled, setShippingEnabled] = useState(shippingConfigData?.isEnabled || false);
  const [shippingType, setShippingType] = useState<'fixed' | 'percentage'>(shippingConfigData?.chargeType || 'fixed');
  const [shippingValue, setShippingValue] = useState(shippingConfigData?.amount || 0);
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  const filteredProducts = useMemo(() => {
    return productsData.filter((p: Product) => {
      const matchesSearch = p.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'Approved' && p.isActive) ||
        (statusFilter === 'Pending' && !p.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [productsData, searchTerm, statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        (order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'all' || order.status === statusFilter)
    );
  }, [orders, searchTerm, statusFilter]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredProducts.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(firstItemIndex, lastItemIndex);
  const totalOrderPages = Math.ceil(filteredOrders.length / itemsPerPage);

  useEffect(() => {
    if (shippingConfigData) {
      setShippingEnabled(shippingConfigData.isEnabled || false);
      setShippingType(shippingConfigData.chargeType || 'fixed');
      setShippingValue(shippingConfigData.amount || 0);
    }
  }, [shippingConfigData]);

  // Show loading state
  if (isShippingLoading) {
    return <div className="p-8">Loading shipping configuration...</div>;
  }

  
  // Show loading state for products
  if (isProductsLoading) {
    return <div className="p-8">Loading products...</div>;
  }

  const handleOpenModal = (type: 'add' | 'edit' | 'view', product?: Product) => {
    setModalType(type);
    if (product && type !== 'add') {
      setSelectedProduct(product);
      setFormData({
        productName: product.productName,
        price: product.price,
        salePrice: product.salePrice,
        category: product.category,
        categoryDescription: product.categoryDescription || '',
        description: product.description || '',
        stock: product.stock,
        status: product.isActive ? 'Approved' : 'Pending',
        image: product.productImage,
      });
    } else {
      setFormData({
        productName: '',
        description: '',
        category: '',
        categoryDescription: '',
        image: '',
        price: 0,
        salePrice: 0,
        stock: 0,
        status: 'Pending',
      });
    }
    setIsModalOpen(true);
  };

  const handleAddCategory = () => {
    if (newCategory.name && !categoriesData?.some((cat) => cat.name === newCategory.name)) {
      // This function is now handled by handleSaveCategory
      // which creates the category via API and updates the form
      setFormData({
        ...formData,
        category: newCategory.name,
        categoryDescription: newCategory.description,
      });
      setNewCategory({ name: '', description: '' });
      setIsCategoryModalOpen(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      console.log('Creating category:', { name: newCategory.name.trim(), description: newCategory.description.trim() });
      
      const result = await createCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim()
      }).unwrap();

      console.log('Category created successfully:', result);
      toast.success(`Category "${newCategory.name}" created and stored in Admin database!`);
      
      // Update the form with the new category
      setFormData({
        ...formData,
        category: newCategory.name,
        categoryDescription: newCategory.description,
      });
      
      setNewCategory({ name: '', description: '' });
      setIsCategoryModalOpen(false);
      
      // Refetch categories to get updated list
      refetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error(error?.data?.message || 'Failed to create category');
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.productName.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (formData.stock < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    const productData = {
      productName: formData.productName.trim(),
      description: formData.description.trim(),
      category: formData.category,
      categoryDescription: formData.categoryDescription,
      price: formData.price,
      salePrice: formData.salePrice || 0,
      stock: formData.stock,
      productImage: formData.image || '',
      isActive: formData.status === 'Approved',
    };

    if (modalType === 'add') {
      const result = await createProduct(productData);
      if (result.error) {
        toast.error(result.error?.data?.message || 'Failed to create product');
        return;
      }
      toast.success('Product created successfully');
    } else if (modalType === 'edit' && selectedProduct) {
      const result = await updateProduct({
        id: selectedProduct._id,
        ...productData
      });
      if (result.error) {
        toast.error(result.error?.data?.message || 'Failed to update product');
        return;
      }
      toast.success('Product updated successfully');
    }
    
    setIsModalOpen(false);
    resetForm();
    refetchProducts();
  };

  const handleViewOrder = (order: ProductOrder) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      const result = await deleteProduct(selectedProduct._id);
      if (result.error) {
        toast.error(result.error?.data?.message || 'Failed to delete product');
        return;
      }
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      refetchProducts();
    }
  };

  const handleSaveShipping = async () => {
    try {
      setIsSavingShipping(true);
      await updateShippingConfig({
        chargeType: shippingType,
        amount: shippingValue,
        isEnabled: shippingEnabled,
      }).unwrap();
      
      toast.success('Shipping configuration saved successfully');
      setIsShippingModalOpen(false);
    } catch (error) {
      console.error('Failed to save shipping config:', error);
      toast.error(error?.data?.message || 'Failed to save shipping configuration');
    } finally {
      setIsSavingShipping(false);
    }
  };

  const getStatusColor = (status: Product['status'] | ProductOrder['status']) => {
    switch (status) {
      case 'Approved':
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Disapproved':
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Processing':
        return 'bg-purple-100 text-purple-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateShippingCost = (orderTotal: number) => {
    if (!shippingEnabled) return 0;
    return shippingType === 'percentage'
      ? (shippingValue / 100) * orderTotal
      : shippingValue;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Products & Orders</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsData.length}</div>
            <p className="text-xs text-muted-foreground">Total products in catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">All-time product orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Products</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {productsData.filter((p) => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently live for sale</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {productsData.filter((p) => p.stock === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Products needing restock</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>All Products</CardTitle>
                  <CardDescription>View, create, and manage all your products.</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by product name..."
                      className="w-full md:w-64 pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Disapproved">Disapproved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenModal('add')}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Product
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsShippingModalOpen(true)}
                      className="border-dashed"
                      disabled={isShippingLoading}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Shipping Charges
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentItems.map((product) => (
                  <Card key={product.id} className="flex flex-col">
                    <CardHeader className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={product.productImage}
                          alt={product.productName}
                          layout="fill"
                          className="object-cover rounded-t-lg"
                        />
                        <Badge className={`absolute top-2 left-2 ${getStatusColor(product.status)}`}>
                          {product.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow flex flex-col">
                      <div className="flex-grow">
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <CardTitle className="text-base leading-tight mt-1">
                          {product.productName}
                        </CardTitle>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-lg font-bold">₹{product.salePrice.toFixed(2)}</span>
                          {product.price > product.salePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          Stock:{' '}
                          {product.stock > 0 ? (
                            product.stock
                          ) : (
                            <span className="text-red-600 font-bold">Out</span>
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenModal('edit', product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteClick(product)}
                          >
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
              <CardDescription>A log of all product orders placed by customers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Image
                              src={order.productImage}
                              alt={order.productName}
                              width={40}
                              height={40}
                              className="rounded-md"
                            />
                            <span className="font-medium">{order.productName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          ₹
                          {(
                            order.salePrice * order.quantity +
                            calculateShippingCost(order.salePrice * order.quantity)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalOrderPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredOrders.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <PackageCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {modalType === 'add' ? 'Add New Product' : modalType === 'edit' ? 'Edit Product' : 'Product Details'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {modalType === 'add'
                    ? 'Fill in the details below to add a new product to your catalog'
                    : modalType === 'edit'
                    ? 'Update the product information as needed'
                    : 'View detailed information about this product'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <span className="p-1.5 bg-primary/10 rounded-md">
                  <PackageCheck className="h-4 w-4 text-primary" />
                </span>
                Basic Information
              </h3>
              <p className="text-sm text-muted-foreground -mt-3 pl-7">
                Enter the basic details of your product
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Enter product name"
                  disabled={modalType === 'view'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      const category = categoriesData?.find(cat => cat.name === value);
                      setFormData({
                        ...formData,
                        category: value,
                        categoryDescription: category?.description || '',
                      });
                    }}
                    disabled={modalType === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {isCategoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categoriesData && categoriesData.length > 0 ? (
                        categoriesData.map((cat) => (
                          <SelectItem key={cat._id || cat.name} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCategoryModalOpen(true)}
                    disabled={modalType === 'view'}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            {formData.category && (
              <div className="space-y-2">
                <Label>Category Description</Label>
                <Textarea
                  value={formData.categoryDescription}
                  readOnly
                  placeholder="Category description"
                  rows={2}
                  className="bg-gray-50"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={2}
                disabled={modalType === 'view'}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={modalType === 'view'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price (₹)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={modalType === 'view'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  disabled={modalType === 'view'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-32 rounded-lg border bg-muted/50 overflow-hidden">
                    {formData.image ? (
                      <Image src={formData.image} alt="Product preview" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <Image
                          src="/placeholder-image.svg"
                          alt="No image"
                          width={48}
                          height={48}
                          className="opacity-40"
                        />
                        <span className="text-xs text-muted-foreground">No image selected</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a product image. Recommended size: 800x800px. Max file size: 5MB.
                      </p>
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size should be less than 5MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setFormData({ ...formData, image: event.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                        disabled={modalType === 'view'}
                      />
                      <Label
                        htmlFor="image-upload"
                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer ${
                          modalType === 'view' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {formData.image ? 'Change Image' : 'Upload Image'}
                      </Label>
                      {formData.image && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-destructive hover:text-destructive"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          type="button"
                          disabled={modalType === 'view'}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            {modalType !== 'view' && (
              <Button type="button" onClick={handleFormSubmit}>
                {modalType === 'add' ? 'Add Product' : 'Save Changes'}
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {modalType === 'view' ? 'Close' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category for products.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Category Name *
              </Label>
              <Input
                id="categoryName"
                className="col-span-3"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="categoryDescription"
                className="col-span-3"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Enter category description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={!newCategory.name.trim() || isCreatingCategory}>
              {isCreatingCategory ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.productName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isShippingModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsShippingModalOpen(open);
        } else {
          setIsShippingModalOpen(open);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Shipping Charges</DialogTitle>
                <DialogDescription>Configure shipping charges for your products</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {isShippingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading shipping configuration...</span>
            </div>
          ) : (
            <>
              
              <div className="space-y-6 py-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="shipping-enabled" className="font-medium">
                      Enable Shipping Charges
                    </Label>
                    <p className="text-sm text-muted-foreground">Add shipping costs to your products</p>
                  </div>
                  <Switch
                    id="shipping-enabled"
                    checked={shippingEnabled}
                    onCheckedChange={setShippingEnabled}
                    disabled={isUpdatingShipping}
                  />
                </div>
                
                {shippingEnabled && (
                  <div className="space-y-6 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-value" className="font-medium">
                        Shipping Charges Value
                      </Label>
                      <div className="relative">
                        <Input
                          id="shipping-value"
                          type="number"
                          value={shippingValue}
                          onChange={(e) => setShippingValue(Number(e.target.value))}
                          placeholder="0"
                          min="0"
                          step={shippingType === 'fixed' ? '1' : '0.01'}
                          className="pl-8 h-10"
                          disabled={isUpdatingShipping}
                        />
                        <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">
                          {shippingType === 'fixed' ? '₹' : '%'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="font-medium">Charge Type</Label>
                      <RadioGroup
                        value={shippingType}
                        onValueChange={(value) => setShippingType(value as 'fixed' | 'percentage')}
                        className="grid grid-cols-2 gap-4"
                        disabled={isUpdatingShipping}
                      >
                        <div className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 cursor-pointer">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <div>
                            <Label htmlFor="fixed" className="font-medium">
                              Fixed Amount
                            </Label>
                            <p className="text-sm text-muted-foreground">Flat rate per order</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent/50 cursor-pointer">
                          <RadioGroupItem value="percentage" id="percentage" />
                          <div>
                            <Label htmlFor="percentage" className="font-medium">
                              Percentage
                            </Label>
                            <p className="text-sm text-muted-foreground">% of order total</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsShippingModalOpen(false)}
                  disabled={isUpdatingShipping}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveShipping} 
                  disabled={isUpdatingShipping || isShippingLoading}
                  className="min-w-[100px]"
                >
                  {isUpdatingShipping ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  Order placed on {new Date(selectedOrder.date).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium">Order Summary</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20">
                      <Image
                        src={selectedOrder.productImage}
                        alt={selectedOrder.productName}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedOrder.productName}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {selectedOrder.quantity}</p>
                      <p className="text-sm">
                        ₹{selectedOrder.salePrice} × {selectedOrder.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₹{(selectedOrder.salePrice * selectedOrder.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{(selectedOrder.salePrice * selectedOrder.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shippingEnabled
                        ? `₹${calculateShippingCost(selectedOrder.salePrice * selectedOrder.quantity).toFixed(2)}`
                        : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>
                      ₹
                      {(
                        selectedOrder.salePrice * selectedOrder.quantity +
                        calculateShippingCost(selectedOrder.salePrice * selectedOrder.quantity)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p>{selectedOrder.customerName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Order Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Order Date</p>
                        <p>{new Date(selectedOrder.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Order ID</p>
                        <p className="font-mono">{selectedOrder.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                  Close
                </Button>
                <Button>Print Invoice</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}