import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Trash2 } from 'lucide-react';
import { Appointment } from '@repo/types';

import { useState } from 'react';

interface AppointmentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectPayment: (amount: number, paymentMethod: string, notes: string, paymentAt: string) => Promise<void>;
  selectedAppointment: Appointment | null;
  isProcessing: boolean;
}

const AppointmentPaymentModal = ({
  isOpen,
  onClose,
  onCollectPayment,
  selectedAppointment,
  isProcessing
}: AppointmentPaymentModalProps) => {
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash',
    notes: ''
  });
  
  const [paymentAt, setPaymentAt] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const handleOpen = () => {
    if (selectedAppointment) {
      const totalAmount = (selectedAppointment as any).finalAmount || selectedAppointment.totalAmount || 0;
      const paidAmount = (selectedAppointment as any).amountPaid || selectedAppointment.payment?.paid || 0;
      const remainingAmount = Math.max(0, totalAmount - paidAmount);

      setPaymentData({
        amount: remainingAmount,
        paymentMethod: 'cash',
        notes: ''
      });
      
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      setPaymentAt(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
    }
  };

  const handleSubmit = async () => {
    await onCollectPayment(
      paymentData.amount,
      paymentData.paymentMethod,
      paymentData.notes,
      paymentAt
    );
  };

  if (!selectedAppointment) return null;

  const totalAmount = (selectedAppointment as any).finalAmount || selectedAppointment.totalAmount || 0;
  const paidAmount = (selectedAppointment as any).amountPaid || selectedAppointment.payment?.paid || 0;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open) handleOpen();
      onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>
            Collect payment for <strong>{selectedAppointment.clientName}</strong>'s appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Paid:</span>
              <span className="font-semibold text-green-600">₹{paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="font-medium">Remaining:</span>
              <span className="font-bold text-orange-600">₹{remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Collecting Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <Input
                id="amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="pl-7"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={paymentData.paymentMethod}
              onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="netbanking">Net Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={paymentData.notes}
              onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Payment reference or notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || paymentData.amount <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Payment ₹{paymentData.amount.toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentPaymentModal;