"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Skeleton } from "@repo/ui/skeleton";
import { Edit, Trash2 } from 'lucide-react';
import { ExpenseFormModal } from '@/components/ExpenseFormModal';
import { useGetExpensesQuery, useDeleteExpenseMutation, useGetCrmPaymentModesQuery } from '@repo/store/api';
import { toast } from 'sonner';
import { useCrmAuth } from '@/hooks/useCrmAuth';

// Import new components
import ExpenseStatsCards from './components/ExpenseStatsCards';
import ExpenseFiltersToolbar from './components/ExpenseFiltersToolbar';
import ExpenseTable from './components/ExpenseTable';
import ExpensePaginationControls from './components/ExpensePaginationControls';

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
    const { data: expensesListRaw = [], isLoading, isError, refetch } = useGetExpensesQuery(undefined, {
        skip: !user?._id,
    });

    const expensesList = useMemo(() => {
        return [...expensesListRaw].sort((a: Expense, b: Expense) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [expensesListRaw]);
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

    const hasActiveFilters: boolean =
        filters.paymentMode !== 'All' ||
        !!filters.startDate ||
        !!filters.endDate ||
        !!filters.minAmount ||
        !!filters.maxAmount ||
        !!searchTerm;

    const handleOpenModal = (expense?: Expense) => {
        setSelectedExpense(expense || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedExpense) {
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



    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                        <div>
                            <Skeleton className="h-8 w-64" />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        {[...Array(2)].map((_, i) => (
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
                        <CardContent>
                            <div className="overflow-x-auto no-scrollbar rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-secondary hover:bg-secondary">
                                            {["Expense Type", "Date", "Amount", "Payment Mode", "Invoice No", "Note", "Actions"].map((_, i) => (
                                                <TableHead key={i} className={i < 3 ? (i === 0 ? "min-w-[120px]" : "min-w-[120px]") : ""}>
                                                    <Skeleton className="h-5 w-full" />
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...Array(5)].map((_, i) => (
                                            <TableRow key={i} className="hover:bg-muted/50">
                                                <TableCell className="font-medium py-3 min-w-[120px] max-w-[150px]">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="w-10 h-10 rounded-full" />
                                                        <Skeleton className="h-5 w-32" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="min-w-[120px] max-w-[150px]">
                                                    <Skeleton className="h-5 w-full mb-1" />
                                                </TableCell>
                                                <TableCell className="min-w-[120px] max-w-[150px]">
                                                    <Skeleton className="h-5 w-full mb-1" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-full" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Skeleton className="h-8 w-8 rounded" />
                                                        <Skeleton className="h-8 w-8 rounded" />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isError) {
        return <div className="min-h-screen bg-background">
            <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
                Error loading expenses data.
            </div>
        </div>
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Enhanced Header Section matching marketplace design */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                                Expense Management
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                                View, add, and manage your personal expenses.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Expense Stats Cards */}
                <ExpenseStatsCards
                    totalExpenses={totalExpenses}
                    currentMonthExpenses={currentMonthExpenses}
                    filteredExpensesCount={filteredExpenses.length}
                    hasActiveFilters={hasActiveFilters}
                />

                {/* Filters Toolbar */}
                <ExpenseFiltersToolbar
                    searchTerm={searchTerm}
                    showFilters={showFilters}
                    filters={filters}
                    paymentModes={paymentModes}
                    isLoadingPaymentModes={isLoadingPaymentModes}
                    hasActiveFilters={hasActiveFilters}
                    onSearchChange={setSearchTerm}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    onExport={handleExport}
                    onAddExpense={() => handleOpenModal()}
                />

                {/* Expense Table */}
                <div className="flex-1 flex flex-col min-h-0">
                    <Card className="flex-1 flex flex-col min-h-0">
                        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                            <ExpenseTable
                                currentItems={currentItems}
                                searchTerm={searchTerm}
                                hasActiveFilters={hasActiveFilters}
                                onOpenModal={handleOpenModal}
                                onDeleteClick={handleDeleteClick}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Pagination Controls */}
                <ExpensePaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredExpenses.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />

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
        </div>
    );
}
