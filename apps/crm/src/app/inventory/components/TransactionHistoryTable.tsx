
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import { format } from "date-fns";
import { Button } from "@repo/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Transaction {
    _id: string;
    date: string;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    productId: {
        _id: string;
        productName: string;
    };
    productCategory: {
        _id: string;
        name: string;
    }
    quantity: number;
    previousStock: number;
    newStock: number;
    reason: string;
    reference?: string;
    performedBy?: {
        name: string;
        email: string;
    };
}

interface TransactionHistoryTableProps {
    transactions: Transaction[];
    isLoading: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    onPageChange: (page: number) => void;
}

export default function TransactionHistoryTable({
    transactions,
    isLoading,
    pagination,
    onPageChange
}: TransactionHistoryTableProps) {

    if (isLoading) {
        return <div className="p-8 text-center">Loading history...</div>;
    }

    if (!transactions || transactions.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No transaction history found.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Change</TableHead>
                            <TableHead className="text-right">New Stock</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>User</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx._id}>
                                <TableCell className="whitespace-nowrap">
                                    {format(new Date(tx.date), "MMM d, yyyy HH:mm")}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {tx.productId?.productName || "Unknown Product"}
                                </TableCell>
                                <TableCell>
                                    {tx.productCategory?.name || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={tx.type === 'IN' ? 'default' : tx.type === 'OUT' ? 'destructive' : 'secondary'}>
                                        {tx.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className={`text-right font-bold ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                    {tx.newStock}
                                </TableCell>
                                <TableCell>{tx.reason}</TableCell>
                                <TableCell>{tx.reference || "-"}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {tx.performedBy?.name || "System"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {pagination.pages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {pagination.page} of {pagination.pages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
