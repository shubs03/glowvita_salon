import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from '@repo/ui/label';
import { Plus } from 'lucide-react';
import { PayoutData } from "../types";

interface SettlementsPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectPayment: (payoutId: string, amount: number) => void;
  selectedPayout: PayoutData | null;
  isProcessing: boolean;
}

const SettlementsPaymentModal = ({
  isOpen,
  onClose,
  onCollectPayment,
  selectedPayout,
  isProcessing
}: SettlementsPaymentModalProps) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (selectedPayout && numAmount > selectedPayout.pendingAmount) {
      setError(`Amount cannot exceed pending amount (₹${selectedPayout.pendingAmount.toFixed(2)})`);
      return;
    }

    if (selectedPayout) {
      onCollectPayment(selectedPayout.id, numAmount);
      setAmount('');
    }
  };

  const handleReset = () => {
    setAmount('');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        handleReset();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Receive Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="col-span-3"
                placeholder={selectedPayout ? `Max: ₹${selectedPayout.pendingAmount.toFixed(2)}` : "Enter amount"}
                step="0.01"
                min="0.01"
                max={selectedPayout?.pendingAmount}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                handleReset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Receive
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettlementsPaymentModal;