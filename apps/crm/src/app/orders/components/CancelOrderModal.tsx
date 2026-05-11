import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Textarea } from "@repo/ui/textarea";
import { Order } from "../types";
import { AlertCircle } from "lucide-react";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  order: Order | null;
  isUpdatingStatus: boolean;
}

export const CancelOrderModal = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  isUpdatingStatus,
}: CancelOrderModalProps) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle>Cancel Order</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to cancel order #{order?.orderId || order?._id?.substring(0, 8)}? This action will refund the items back to inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">
            Reason for cancellation <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="Please provide a reason for cancelling this order..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdatingStatus}>
            No, Keep Order
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={!reason.trim() || isUpdatingStatus}
          >
            {isUpdatingStatus ? "Cancelling..." : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
