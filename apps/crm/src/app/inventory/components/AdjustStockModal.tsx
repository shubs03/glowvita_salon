
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { toast } from "sonner";
import { useAdjustInventoryMutation } from "@repo/store/api";

interface AdjustStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        _id: string;
        productName: string;
        stock: number;
    } | null;
    onSuccess: () => void;
}

export default function AdjustStockModal({ isOpen, onClose, product, onSuccess }: AdjustStockModalProps) {
    const [adjustmentType, setAdjustmentType] = useState<"IN" | "OUT">("IN");
    const [quantity, setQuantity] = useState<number>(1);
    const [reason, setReason] = useState<string>("");
    const [reference, setReference] = useState<string>("");

    const [adjustInventory, { isLoading }] = useAdjustInventoryMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        if (quantity <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        if (!reason.trim()) {
            toast.error("Reason is required");
            return;
        }

        try {
            await adjustInventory({
                productId: product._id,
                adjustmentType,
                quantity,
                reason,
                reference
            }).unwrap();

            toast.success("Stock adjusted successfully");
            // Reset form
            setQuantity(1);
            setReason("");
            setReference("");
            setAdjustmentType("IN");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.data?.message || "Failed to adjust stock");
        }
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adjust Stock - {product.productName}</DialogTitle>
                    <DialogDescription>
                        Current Stock: {product.stock}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Action</Label>
                        <Select
                            value={adjustmentType}
                            onValueChange={(val: "IN" | "OUT") => setAdjustmentType(val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IN">Add Stock (+)</SelectItem>
                                <SelectItem value="OUT">Remove Stock (-)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Select
                            value={reason}
                            onValueChange={setReason}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {adjustmentType === 'IN' ? (
                                    <>
                                        <SelectItem value="Purchase">New Purchase / Restock</SelectItem>
                                        <SelectItem value="Return">Customer Return</SelectItem>
                                        <SelectItem value="Correction">Stock Correction (Audit Found)</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="Sale">Offline Sale</SelectItem>
                                        <SelectItem value="Damage">Damaged / Expired</SelectItem>
                                        <SelectItem value="Theft">Loss / Theft</SelectItem>
                                        <SelectItem value="Correction">Stock Correction (Audit Missing)</SelectItem>
                                        <SelectItem value="Internal Use">Internal Use</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                        {/* Fallback text input if needed or just use Select for structured data */}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reference">Reference (Optional)</Label>
                        <Input
                            id="reference"
                            placeholder="Invoice #, Order ID, etc."
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Adjustment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
