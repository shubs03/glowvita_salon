import { Button } from "@repo/ui/button";
import { Plus } from "lucide-react";
import { PayoutData } from "./SettlementsTable";

interface SettlementsDetailCardProps {
  payout: PayoutData;
  onReceivePayment: (payout: PayoutData) => void;
  onClose: () => void;
}

const SettlementsDetailCard = ({
  payout,
  onReceivePayment,
  onClose
}: SettlementsDetailCardProps) => {
  return (
    <div className="space-y-6">
      <div className="pb-4">
        <h2 className="text-xl font-bold">{payout.vendor}</h2>
        <p className="text-muted-foreground text-sm">Transaction History</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Received</p>
          <p className="text-lg font-semibold">₹{payout.adminReceiveAmount.toFixed(2)}</p>
        </div>
        <div className="border p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-lg font-semibold">₹{payout.adminPayAmount.toFixed(2)}</p>
        </div>
        <div className="border p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Pending Amount</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">₹{payout.pendingAmount.toFixed(2)}</p>
            {payout.pendingAmount > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="h-8"
                onClick={() => onReceivePayment(payout)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Receive
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-3">Transaction Details</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {payout.transactions.map((txn, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <div>
                <p className="font-medium">{txn.description}</p>
                <p className="text-sm text-muted-foreground">{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className={`font-medium ${txn.type === 'receive' ? 'text-green-600' : 'text-blue-600'}`}>
                {txn.type === 'receive' ? '+' : '-'}₹{txn.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default SettlementsDetailCard;