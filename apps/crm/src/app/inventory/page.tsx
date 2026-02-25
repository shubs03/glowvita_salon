
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { useGetCrmProductsQuery, useGetInventoryTransactionsQuery, useGetLowStockProductsQuery } from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import AdjustStockModal from './components/AdjustStockModal';
import TransactionHistoryTable from './components/TransactionHistoryTable';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";

// Minimum stock level before a product is considered low-stock
const LOW_STOCK_THRESHOLD = 10;

export default function InventoryPage() {
    const { user } = useCrmAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('stock');
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{
        _id: string;
        productName: string;
        stock: number;
        [key: string]: any;
    } | null>(null);

    // Pagination state for history
    const [historyPage, setHistoryPage] = useState(1);
    const historyLimit = 10;

    // Queries
    const { data: products = [], isLoading: isProductsLoading, refetch: refetchProducts } = useGetCrmProductsQuery(
        { vendorId: user?._id },
        { skip: !user?._id }
    );

    const { data: lowStockData, isLoading: isLowStockLoading } = useGetLowStockProductsQuery(LOW_STOCK_THRESHOLD);

    const { data: historyData, isLoading: isHistoryLoading, refetch: refetchHistory } = useGetInventoryTransactionsQuery({
        page: historyPage,
        limit: historyLimit
    }, { skip: !user });

    const lowStockCount = lowStockData?.count || 0;

    // Filter products locally for now
    const filteredProducts = products.filter((p: any) =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdjustStock = (product: any) => {
        setSelectedProduct(product);
        setIsAdjustModalOpen(true);
    };

    const handleAdjustmentSuccess = () => {
        refetchProducts();
        refetchHistory();
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Track stock levels, manage adjustments, and view transaction history.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
                        <p className="text-xs text-muted-foreground">Products below threshold</p>
                    </CardContent>
                </Card>
                {/* Placeholder for value stats if calculated */}
            </div>

            {/* Main Content */}
            <Tabs defaultValue="stock" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="stock">Stock Management</TabsTrigger>
                    <TabsTrigger value="history">Transaction History</TabsTrigger>
                </TabsList>

                <TabsContent value="stock" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Current Stock Levels</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isProductsLoading ? (
                                <div className="text-center py-8">Loading products...</div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product Name</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                                <TableHead className="text-right">Current Stock</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredProducts.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No products found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredProducts.map((product: any) => (
                                                    <TableRow key={product._id}>
                                                        <TableCell className="font-medium">{product.productName}</TableCell>
                                                        <TableCell>{product.category}</TableCell>
                                                        <TableCell className="text-right">₹{product.salePrice > 0 ? product.salePrice : product.price}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant={product.stock <= 10 ? "destructive" : "secondary"}>
                                                                {product.stock}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button size="sm" variant="outline" onClick={() => handleAdjustStock(product)}>
                                                                Adjust Stock
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TransactionHistoryTable
                                transactions={historyData?.data || []}
                                isLoading={isHistoryLoading}
                                pagination={{
                                    page: historyData?.pagination?.page || 1,
                                    limit: historyData?.pagination?.limit || 10,
                                    total: historyData?.pagination?.total || 0,
                                    pages: historyData?.pagination?.pages || 1
                                }}
                                onPageChange={setHistoryPage}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AdjustStockModal
                isOpen={isAdjustModalOpen}
                onClose={() => setIsAdjustModalOpen(false)}
                product={selectedProduct}
                onSuccess={handleAdjustmentSuccess}
            />
        </div>
    );
}
