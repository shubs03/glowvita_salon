import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Eye } from 'lucide-react';
import { PayoutData } from "../types";

interface SettlementsTableProps {
  payouts: PayoutData[];
  isLoading?: boolean;
  searchTerm: string;
  statusFilter: string;
  currentItems: PayoutData[];
  onOpenModal: (type: 'view', payout?: PayoutData) => void;
}

const SettlementsTableNew = ({
  payouts,
  isLoading = false,
  searchTerm,
  statusFilter,
  currentItems,
  onOpenModal
}: SettlementsTableProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Contact No</TableHead>
              <TableHead>Owner Name</TableHead>
              <TableHead>Admin Receive</TableHead>
              <TableHead>Admin Pay</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading settlements...
                  </div>
                </TableCell>
              </TableRow>
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'No settlements found matching your criteria' : 'No settlements available'}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">
                    {payout.vendor}
                  </TableCell>
                  <TableCell>{payout.contactNo}</TableCell>
                  <TableCell>{payout.ownerName}</TableCell>
                  <TableCell>₹{payout.adminReceiveAmount.toFixed(2)}</TableCell>
                  <TableCell>₹{payout.adminPayAmount.toFixed(2)}</TableCell>
                  <TableCell>₹{payout.pendingAmount.toFixed(2)}</TableCell>
                  <TableCell className="font-bold">₹{payout.totalSettlement.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${payout.status === "Paid"
                        ? "bg-primary text-white" : "bg-secondary text-primary"
                      }`}>
                      {payout.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenModal('view', payout)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SettlementsTableNew;