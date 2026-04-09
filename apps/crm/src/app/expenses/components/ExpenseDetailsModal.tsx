"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Receipt, Calendar, CreditCard, Hash, FileText, X, Image as ImageIcon } from 'lucide-react';
import { Expense } from '../page';

interface ExpenseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense: Expense | null;
}

export const ExpenseDetailsModal = ({ isOpen, onClose, expense }: ExpenseDetailsModalProps) => {
    if (!expense) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar p-0 border-none shadow-2xl">
                <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                    {/* Left Side: Invoice Preview */}
                    <div className="md:w-1/2 bg-muted flex items-center justify-center p-6 relative min-h-[300px]">
                        {expense.invoice ? (
                            expense.invoice.startsWith('data:image/') ? (
                                <img
                                    src={expense.invoice}
                                    alt="Invoice"
                                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-md">
                                        <FileText className="h-10 w-10 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">PDF Document</span>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={expense.invoice} target="_blank" rel="noopener noreferrer">View Full PDF</a>
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-muted-foreground/50">
                                <ImageIcon className="h-20 w-20" />
                                <span className="text-sm font-medium">No invoice image attached</span>
                            </div>
                        )}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 left-2 md:hidden"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Right Side: Expense Details */}
                    <div className="md:w-1/2 bg-background p-8 flex flex-col relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-4 right-4 hidden md:flex rounded-full h-8 w-8 hover:bg-muted"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        <div className="mb-8">
                            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Expense Details</h2>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <Receipt className="h-6 w-6 text-primary/70" />
                                {expense.expenseType}
                            </h1>
                        </div>

                        <div className="space-y-6 flex-1">
                            {/* Amount Section */}
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <label className="text-xs font-medium text-primary/60 block mb-1">Total Amount</label>
                                <span className="text-3xl font-bold text-primary">{formatCurrency(expense.amount)}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block">Transaction Date</label>
                                        <span className="text-sm font-semibold">{formatDate(expense.date)}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block">Payment Mode</label>
                                        <span className="text-sm font-semibold">{expense.paymentMode}</span>
                                    </div>
                                </div>

                                {expense.invoiceNo && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground block">Invoice No.</label>
                                            <span className="text-sm font-semibold">{expense.invoiceNo}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {expense.note && (
                                <div className="mt-4 p-4 bg-muted/30 rounded-xl">
                                    <label className="text-xs font-medium text-muted-foreground block mb-2">Note</label>
                                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed italic">
                                        "{expense.note}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t flex justify-end">
                            <Button onClick={onClose} variant="secondary" className="w-full md:w-auto px-8">
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
