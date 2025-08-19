
"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Plus, Search, FileDown, Eye, Edit, Trash2, Clock, Truck, PackageCheck } from 'lucide-react';
import { Textarea } from '@repo/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";


type Product = {
  id: string;
  productImage: string;
  productName: string;
  price: number;
  salePrice: number;
  category: string;
  stock: number;
  status: 'Published' | 'Draft' | 'Archived';
};

const mockProducts: Product[] = [
    { id: 'PROD-001', productImage: "https://placehold.co/400x400.png", productName: "Organic Face Serum", price: 85.00, salePrice: 75.00, category: 'Skincare', stock: 50, status: 'Published' },
    { id: 'PROD-002', productImage: "https://placehold.co/400x400.png", productName: "Matte Lipstick", price: 25.00, salePrice: 25.00, category: 'Makeup', stock: 120, status: 'Published' },
    { id: 'PROD-003', productImage: "https://placehold.co/400x400.png", productName: "Keratin Shampoo", price: 45.00, salePrice: 40.00, category: 'Haircare', stock: 0, status: 'Archived' },
    { id: 'PROD-004', productImage: "https://placehold.co/400x400.png", productName: "Professional Hair Dryer", price: 120.00, salePrice: 120.00, category: 'Tools', stock: 30, status: 'Draft' },
];

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

const mockOrders: ProductOrder[] = [
    { id: 'ORD-001', productImage: "https://placehold.co/400x400.png", productName: "Organic Face Serum", customerName: "Alice Johnson", date: '2024-08-25', price: 85.00, salePrice: 75.00, quantity: 1, status: 'Delivered' },
    { id: 'ORD-002', productImage: "https://placehold.co/400x400.png", productName: "Matte Lipstick", customerName: "Bob Williams", date: '2024-08-24', price: 25.00, salePrice: 25.00, quantity: 2, status: 'Shipped' },
    { id: 'ORD-003', productImage: "https://placehold.co/400x400.png", productName: "Keratin Shampoo", customerName: "Charlie Brown", date: '2024-08-23', price: 45.00, salePrice: 40.00, quantity: 1, status: 'Processing' },
    { id: 'ORD-004', productImage: "https://placehold.co/400x400.png", productName: "Professional Hair Dryer", customerName: "Diana Prince", date: '2024-08-22', price: 120.00, salePrice: 120.00, quantity: 1, status: 'Pending' },
    { id: 'ORD-005', productImage: "https://placehold.co/400x400.png", productName: "Nail Art Kit", customerName: "Ethan Hunt", date: '2024-08-21', price: 60.00, salePrice: 50.00, quantity: 1, status: 'Cancelled' },
];

export default function ProductsAndOrdersPage() {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [orders, setOrders] = useState<ProductOrder[]>(mockOrders);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');

    const filteredProducts = useMemo(() => {
        return products.filter(product => 
            (product.productName.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === 'all' || product.status === statusFilter)
        );
    }, [products, searchTerm, statusFilter]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => 
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

    const handleOpenModal = (type: 'add' | 'edit' | 'view', product?: Product) => {
        setModalType(type);
        setSelectedProduct(product || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if(selectedProduct) {
            setProducts(products.filter(p => p.id !== selectedProduct.id));
        }
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
    };

    const getStatusColor = (status: Product['status'] | ProductOrder['status']) => {
        switch (status) {
          case 'Published':
          case 'Delivered': return 'bg-green-100 text-green-800';
          case 'Draft': 
          case 'Pending': return 'bg-yellow-100 text-yellow-800';
          case 'Archived':
          case 'Cancelled': return 'bg-red-100 text-red-800';
          case 'Processing': return 'bg-purple-100 text-purple-800';
          case 'Shipped': return 'bg-blue-100 text-blue-800';
          default: return 'bg-gray-100 text-gray-800';
        }
    };

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
                                            <SelectItem value="Published">Published</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline">
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                    <Button onClick={() => handleOpenModal('add')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Product
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto no-scrollbar rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentItems.map(product => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Image 
                                                            src={product.productImage} 
                                                            alt={product.productName} 
                                                            width={40} 
                                                            height={40} 
                                                            className="rounded-md"
                                                        />
                                                        <span className="font-medium">{product.productName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className={product.salePrice < product.price ? "line-through text-muted-foreground text-xs" : ""}>
                                                            ₹{product.price.toFixed(2)}
                                                        </span>
                                                        {product.salePrice < product.price && (
                                                            <span className="font-semibold">₹{product.salePrice.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{product.stock > 0 ? `${product.stock} units` : <span className="text-red-600">Out of Stock</span>}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                                                        {product.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal('view', product)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal('edit', product)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(product)}>
                                                        <Trash2 className="h-4 w-4" />
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
                                        {currentOrders.map(order => (
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
                                                <TableCell>₹{(order.salePrice * order.quantity).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {}}>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalType === 'add' ? 'New Product' : 'Product Details'}</DialogTitle>
                        <DialogDescription>
                            {modalType === 'add' ? 'Create a new product.' : `Viewing/editing details for product #${selectedProduct?.id}`}
                        </DialogDescription>
                    </DialogHeader>
                    {/* Add form here */}
                    <DialogFooter>
                        {modalType !== 'view' && <Button>Save Changes</Button>}
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
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
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
