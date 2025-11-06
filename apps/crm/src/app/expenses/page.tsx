"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Skeleton } from "@repo/ui/skeleton";
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Plus, Search, FileDown, Edit, Trash2, Receipt, TrendingUp, Wallet, DollarSign, Filter, X } from 'lucide-react';
import { ExpenseFormModal } from '@/components/ExpenseFormModal';
import { useGetExpensesQuery, useDeleteExpenseMutation, useGetCrmPaymentModesQuery } from '@repo/store/api';
import { toast } from 'sonner';
import { useCrmAuth } from '@/hooks/useCrmAuth';

export type Expense = {
    _id: string;
    expenseType: string;
    date: string;
    amount: number;
    paymentMode: 'Cash' | 'Card' | 'UPI' | 'Net Banking' | 'Cheque' | 'Other';
    invoiceNo?: string;
    invoice?: string;
    note?: string;
    status: 'Active' | 'Deleted';
    createdAt?: string;
    updatedAt?: string;
};

export default function ExpensesPage() {
    const { user } = useCrmAuth();
    const { data: expensesList = [], isLoading, isError, refetch } = useGetExpensesQuery(undefined, {
        skip: !user?._id,
    });
    const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();
    const { data: paymentModes = [], isLoading: isLoadingPaymentModes } = useGetCrmPaymentModesQuery(undefined);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        paymentMode: 'All',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
    });
    
    const filteredExpenses = useMemo(() => {
        if (!expensesList) return [];
        return expensesList.filter((expense: Expense) => {
            // Search filter
            const matchesSearch = 
                expense.expenseType.toLowerCase().includes(searchTerm.toLowerCase()) || 
                expense.paymentMode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Payment mode filter
            const matchesPaymentMode = filters.paymentMode === 'All' || expense.paymentMode === filters.paymentMode;
            
            // Date range filter
            const expenseDate = new Date(expense.date);
            const matchesStartDate = !filters.startDate || expenseDate >= new Date(filters.startDate);
            const matchesEndDate = !filters.endDate || expenseDate <= new Date(filters.endDate);
            
            // Amount range filter
            const matchesMinAmount = !filters.minAmount || expense.amount >= parseFloat(filters.minAmount);
            const matchesMaxAmount = !filters.maxAmount || expense.amount <= parseFloat(filters.maxAmount);
            
            return matchesSearch && matchesPaymentMode && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
        });
    }, [expensesList, searchTerm, filters]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = filteredExpenses.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

    // Calculate statistics based on filtered expenses
    const totalExpenses = useMemo(() => {
        return filteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    }, [filteredExpenses]);

    const currentMonthExpenses = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return filteredExpenses
            .filter((expense: Expense) => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    }, [filteredExpenses]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const clearFilters = () => {
        setFilters({
            paymentMode: 'All',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: '',
        });
        setSearchTerm('');
        setCurrentPage(1);
    };

    const hasActiveFilters = 
        filters.paymentMode !== 'All' || 
        filters.startDate || 
        filters.endDate || 
        filters.minAmount || 
        filters.maxAmount ||
        searchTerm;

    const handleOpenModal = (expense?: Expense) => {
        setSelectedExpense(expense || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if(selectedExpense) {
            try {
                await deleteExpense(selectedExpense._id).unwrap();
                toast.success("Expense deleted successfully.");
                refetch();
            } catch (err) {
                toast.error("Failed to delete expense.");
            } finally {
                setIsDeleteModalOpen(false);
                setSelectedExpense(null);
            }
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleExport = () => {
        if (filteredExpenses.length === 0) {
            toast.error('No data to export');
            return;
        }

        try {
            // Prepare CSV headers
            const headers = ['Date', 'Expense Type', 'Amount (₹)', 'Payment Mode', 'Invoice No', 'Note'];
            
            // Prepare CSV rows
            const rows: string[][] = filteredExpenses.map((expense: Expense) => [
                formatDate(expense.date),
                expense.expenseType,
                expense.amount.toString(),
                expense.paymentMode,
                expense.invoiceNo || '-',
                expense.note ? expense.note.replace(/,/g, ';') : '-' // Replace commas in notes to avoid CSV issues
            ]);

            // Combine headers and rows
            const rowsText = rows.map((row: string[]) => row.join(',')).join('\n');
            const csvContent = `${headers.join(',')}\n${rowsText}`;

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('Expenses exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export expenses');
        }
    };

    const getPaymentModeColor = (mode: string) => {
        switch (mode) {
            case 'Cash': return 'bg-blue-100 text-blue-800';
            case 'Card': return 'bg-blue-100 text-blue-800';
            case 'UPI': return 'bg-blue-100 text-blue-800';
            case 'Net Banking': return 'bg-blue-100 text-blue-800';
            case 'Cheque': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if(isLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                        <Skeleton className="h-8 w-64" />
                    </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <div className="relative">
                                    <Skeleton className="h-10 w-80" />
                                </div>
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-10 w-28" />
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if(isError) {
        return <div className="p-4 sm:p-6 lg:p-8">Error loading expenses data.</div>
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Expense Management</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground">All-time expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(currentMonthExpenses)}</div>
                        <p className="text-xs text-muted-foreground">Current month expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredExpenses.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {hasActiveFilters ? 'Filtered' : 'Total'} expense entries
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle>All Expenses</CardTitle>
                            <CardDescription>View, add, and manage your personal expenses.</CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    type="search" 
                                    placeholder="Search expenses..."
                                    className="w-full md:w-80 pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button 
                                variant={showFilters ? "default" : "outline"}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                            <Button variant="outline" onClick={handleExport}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                            <Button onClick={() => handleOpenModal()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Expense
                            </Button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold">Filter Options</h3>
                                {hasActiveFilters && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        <X className="mr-1 h-3 w-3" />
                                        Clear All
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Payment Mode Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMode">Payment Mode</Label>
                                    <select
                                        id="paymentMode"
                                        value={filters.paymentMode}
                                        onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        disabled={isLoadingPaymentModes}
                                    >
                                        <option value="All">
                                            {isLoadingPaymentModes ? 'Loading...' : 'All Payment Modes'}
                                        </option>
                                        {paymentModes.map((mode: any) => (
                                            <option key={mode._id} value={mode.name}>
                                                {mode.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Start Date Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">From Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    />
                                </div>

                                {/* End Date Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">To Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    />
                                </div>

                                {/* Min Amount Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="minAmount">Min Amount (₹)</Label>
                                    <Input
                                        id="minAmount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0"
                                        value={filters.minAmount}
                                        onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                                    />
                                </div>

                                {/* Max Amount Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="maxAmount">Max Amount (₹)</Label>
                                    <Input
                                        id="maxAmount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="No limit"
                                        value={filters.maxAmount}
                                        onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Active Filter Tags */}
                            {hasActiveFilters && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {searchTerm && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                                            <span>Search: {searchTerm}</span>
                                            <button onClick={() => setSearchTerm('')} className="hover:text-primary/80">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    {filters.paymentMode !== 'All' && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                                            <span>Mode: {filters.paymentMode}</span>
                                            <button onClick={() => handleFilterChange('paymentMode', 'All')} className="hover:text-primary/80">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    {filters.startDate && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                                            <span>From: {new Date(filters.startDate).toLocaleDateString('en-IN')}</span>
                                            <button onClick={() => handleFilterChange('startDate', '')} className="hover:text-primary/80">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    {filters.endDate && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                                            <span>To: {new Date(filters.endDate).toLocaleDateString('en-IN')}</span>
                                            <button onClick={() => handleFilterChange('endDate', '')} className="hover:text-primary/80">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    {filters.minAmount && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                                            <span>Min: ₹{filters.minAmount}</span>
                                            <button onClick={() => handleFilterChange('minAmount', '')} className="hover:text-primary/80">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    {filters.maxAmount && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                                            <span>Max: ₹{filters.maxAmount}</span>
                                            <button onClick={() => handleFilterChange('maxAmount', '')} className="hover:text-primary/80">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-secondary hover:bg-secondary">
                                    <TableHead>Expense Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment Mode</TableHead>
                                    <TableHead>Invoice No</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No expenses found. Click "Add Expense" to create your first expense record.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentItems.map((expense: Expense) => (
                                        <TableRow key={expense._id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-semibold">{expense.expenseType}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(expense.date)}</TableCell>
                                            <TableCell>
                                                <span className="">
                                                    {formatCurrency(expense.amount)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1`}>
                                                    {expense.paymentMode}
                                                </span>
                                            </TableCell>
                                            <TableCell>{expense.invoiceNo || '-'}</TableCell>
                                            <TableCell>
                                                <div className="max-w-[200px] truncate" title={expense.note}>
                                                    {expense.note || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(expense)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(expense)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredExpenses.length > 0 && (
                        <Pagination
                            className="mt-4"
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={filteredExpenses.length}
                        />
                    )}
                </CardContent>
            </Card>

            <ExpenseFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                expense={selectedExpense}
                onSuccess={() => {
                    setIsModalOpen(false);
                    refetch();
                }}
            />
            
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Expense?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this expense "{selectedExpense?.expenseType}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
