"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { useCreateExpenseMutation, useUpdateExpenseMutation, useGetCrmExpenseTypesQuery, useGetCrmPaymentModesQuery } from '@repo/store/api';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

interface ExpenseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense?: any;
    onSuccess: () => void;
}

export const ExpenseFormModal = ({ isOpen, onClose, expense, onSuccess }: ExpenseFormModalProps) => {
    const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
    const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
    const { data: expenseTypes = [], isLoading: isLoadingTypes } = useGetCrmExpenseTypesQuery(undefined);
    const { data: paymentModes = [], isLoading: isLoadingPaymentModes } = useGetCrmPaymentModesQuery(undefined);

    const [formData, setFormData] = useState({
        expenseType: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMode: '',
        invoiceNo: '',
        invoice: '',
        note: '',
    });

    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

    useEffect(() => {
        if (expense) {
            setFormData({
                expenseType: expense.expenseType || '',
                date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                amount: expense.amount?.toString() || '',
                paymentMode: expense.paymentMode || '',
                invoiceNo: expense.invoiceNo || '',
                invoice: expense.invoice || '',
                note: expense.note || '',
            });
            setInvoiceFile(null);
        } else {
            setFormData({
                expenseType: '',
                date: new Date().toISOString().split('T')[0],
                amount: '',
                paymentMode: '',
                invoiceNo: '',
                invoice: '',
                note: '',
            });
            setInvoiceFile(null);
        }
    }, [expense, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }
            setInvoiceFile(file);
        }
    };

    const removeFile = () => {
        setInvoiceFile(null);
        setFormData((prev) => ({ ...prev, invoice: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.expenseType.trim()) {
            toast.error('Please enter expense type');
            return;
        }
        if (!formData.date) {
            toast.error('Please select a date');
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            const expenseData = {
                ...formData,
                amount: parseFloat(formData.amount),
            };

            // If there's a file, convert to base64 or upload to server
            // For now, we'll just store the filename
            if (invoiceFile) {
                // In a real app, you'd upload to a storage service
                // For now, we'll just store a reference
                expenseData.invoice = invoiceFile.name;
            }

            if (expense) {
                // Update existing expense
                await updateExpense({ ...expenseData, _id: expense._id }).unwrap();
                toast.success('Expense updated successfully');
            } else {
                // Create new expense
                await createExpense(expenseData).unwrap();
                toast.success('Expense added successfully');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving expense:', error);
            toast.error(error?.data?.message || 'Failed to save expense');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                    <DialogDescription>
                        {expense ? 'Update the expense details below' : 'Fill in the details to add a new expense'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Expense Type */}
                        <div className="space-y-2">
                            <Label htmlFor="expenseType">Expense Type <span className="text-red-500">*</span></Label>
                            <select
                                id="expenseType"
                                name="expenseType"
                                value={formData.expenseType}
                                onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                                disabled={isLoadingTypes}
                            >
                                <option value="">
                                    {isLoadingTypes ? 'Loading expense types...' : 'Select expense type'}
                                </option>
                                {expenseTypes.map((type: any) => (
                                    <option key={type._id} value={type.name}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date and Amount Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (₹) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Payment Mode */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentMode">Payment Mode <span className="text-red-500">*</span></Label>
                            <select
                                id="paymentMode"
                                name="paymentMode"
                                value={formData.paymentMode}
                                onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                                disabled={isLoadingPaymentModes}
                            >
                                <option value="">
                                    {isLoadingPaymentModes ? 'Loading payment modes...' : 'Select payment mode'}
                                </option>
                                {paymentModes.map((mode: any) => (
                                    <option key={mode._id} value={mode.name}>
                                        {mode.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Invoice Number */}
                        <div className="space-y-2">
                            <Label htmlFor="invoiceNo">Invoice Number (Optional)</Label>
                            <Input
                                id="invoiceNo"
                                name="invoiceNo"
                                placeholder="INV-001"
                                value={formData.invoiceNo}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Expense Invoice File Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="invoice">Expense Invoice (Optional)</Label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="invoice"
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                    {!invoiceFile && formData.invoice && (
                                        <span className="text-xs text-muted-foreground mt-1 block">
                                            Current: {formData.invoice}
                                        </span>
                                    )}
                                </div>
                                {(invoiceFile || formData.invoice) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={removeFile}
                                        className="flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {invoiceFile && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Upload className="h-4 w-4" />
                                    <span>{invoiceFile.name}</span>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Accepted formats: Images, PDF (Max 5MB)
                            </p>
                        </div>

                        {/* Note */}
                        <div className="space-y-2">
                            <Label htmlFor="note">Note (Optional)</Label>
                            <Textarea
                                id="note"
                                name="note"
                                placeholder="Add any additional notes about this expense..."
                                value={formData.note}
                                onChange={handleInputChange}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating || isUpdating}>
                            {isCreating || isUpdating ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
