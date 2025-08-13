
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Eye, CheckCircle, RefreshCw, AlertCircle, X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

interface Transaction {
  type: 'receive' | 'pay';
  amount: number;
  date: string;
  description: string;
}

interface PayoutData {
  id: string;
  vendor: string;
  contactNo: string;
  ownerName: string;
  adminReceiveAmount: number;
  adminPayAmount: number;
  pendingAmount: number;
  totalSettlement: number;
  status: string;
  transactions: Transaction[];
}

const payoutData: PayoutData[] = [
  {
    id: "TXN7483982",
    vendor: "Glamour Salon",
    contactNo: "9876543210",
    ownerName: "Rahul Sharma",
    adminReceiveAmount: 1500.00,
    adminPayAmount: 1200.00,
    pendingAmount: 300.00,
    totalSettlement: 1500.00,
    status: "Paid",
    transactions: [
      { type: 'receive', amount: 500, date: '2025-08-10', description: 'Service Payment' },
      { type: 'receive', amount: 1000, date: '2025-08-05', description: 'Membership Fee' },
      { type: 'pay', amount: 1200, date: '2025-08-12', description: 'Vendor Payout' },
    ],
  },
  {
    id: "TXN7483981",
    vendor: "Modern Cuts",
    contactNo: "8765432109",
    ownerName: "Priya Patel",
    adminReceiveAmount: 2500.00,
    adminPayAmount: 2000.00,
    pendingAmount: 500.00,
    totalSettlement: 2500.00,
    status: "Pending",
    transactions: [
      { type: 'receive', amount: 1500, date: '2025-08-08', description: 'Service Payment' },
      { type: 'receive', amount: 1000, date: '2025-08-03', description: 'Product Sale' },
      { type: 'pay', amount: 2000, date: '2025-08-15', description: 'Vendor Payout' },
    ],
  },
  {
    id: "TXN7483980",
    vendor: "Style Lounge",
    contactNo: "7654321098",
    ownerName: "Amit Singh",
    adminReceiveAmount: 3200.00,
    adminPayAmount: 3000.00,
    pendingAmount: 200.00,
    totalSettlement: 3200.00,
    status: "Pending",
    transactions: [
      { type: 'receive', amount: 2000, date: '2025-08-07', description: 'Service Payment' },
      { type: 'receive', amount: 1200, date: '2025-08-01', description: 'Membership Fee' },
      { type: 'pay', amount: 3000, date: '2025-08-10', description: 'Vendor Payout' },
    ],
  },
  {
    id: "TXN7483979",
    vendor: "The Barber Shop",
    contactNo: "6543210987",
    ownerName: "Neha Gupta",
    adminReceiveAmount: 1800.00,
    adminPayAmount: 1500.00,
    pendingAmount: 300.00,
    totalSettlement: 1800.00,
    status: "Paid",
    transactions: [
      { type: 'receive', amount: 1000, date: '2025-08-09', description: 'Service Payment' },
      { type: 'receive', amount: 800, date: '2025-08-04', description: 'Product Sale' },
      { type: 'pay', amount: 1500, date: '2025-08-13', description: 'Vendor Payout' },
    ],
  },
  {
    id: "TXN7483978",
    vendor: "Beauty Parlor",
    contactNo: "5432109876",
    ownerName: "Vikram Mehta",
    adminReceiveAmount: 4200.00,
    adminPayAmount: 4000.00,
    pendingAmount: 200.00,
    totalSettlement: 4200.00,
    status: "Pending",
    transactions: [
      { type: 'receive', amount: 2500, date: '2025-08-11', description: 'Service Payment' },
      { type: 'receive', amount: 1700, date: '2025-08-06', description: 'Membership Fee' },
      { type: 'pay', amount: 4000, date: '2025-08-14', description: 'Vendor Payout' },
    ],
  }
];

function ReceiveAmountDialog({ open, onOpenChange, onReceive, pendingAmount }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (numAmount > pendingAmount) {
      setError(`Amount cannot exceed pending amount (₹${pendingAmount.toFixed(2)})`);
      return;
    }
    
    onReceive(numAmount);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                placeholder={`Max: ₹${pendingAmount.toFixed(2)}`}
                step="0.01"
                min="0.01"
                max={pendingAmount}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" /> Receive
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PayoutPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = payoutData.slice(firstItemIndex, lastItemIndex);

  const totalPages = Math.ceil(payoutData.length / itemsPerPage);

  const handleReceiveAmount = (payoutId, amount) => {
    // TODO: Implement the actual receive amount logic here
    console.log(`Received ₹${amount} for payout ${payoutId}`);
    // Update the UI accordingly
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Payout Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payout Transactions</CardTitle>
              <CardDescription>
                Details of all transactions for vendor payouts, taxes, and fees.
              </CardDescription>
            </div>
            <Button>Export Report</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salon Name</TableHead>
                  <TableHead>Contact No</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Admin Receive Amount (₹)</TableHead>
                  <TableHead>Admin Pay Amount (₹)</TableHead>
                  <TableHead>Pending Amount (₹)</TableHead>
                  <TableHead>Total Settlement (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{payout.vendor}</TableCell>
                    <TableCell>{payout.contactNo}</TableCell>
                    <TableCell>{payout.ownerName}</TableCell>
                    <TableCell>₹{payout.adminReceiveAmount.toFixed(2)}</TableCell>
                    <TableCell>₹{payout.adminPayAmount.toFixed(2)}</TableCell>
                    <TableCell>₹{payout.pendingAmount.toFixed(2)}</TableCell>
                    <TableCell className="font-bold">₹{payout.totalSettlement.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        payout.status === "Paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}>
                        {payout.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Transactions</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl">{payout.vendor} - Transaction History</DialogTitle>
                            <div className="grid grid-cols-3 gap-4 pt-4">
                              <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total Received</p>
                                <p className="text-lg font-semibold">₹{payout.adminReceiveAmount.toFixed(2)}</p>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total Paid</p>
                                <p className="text-lg font-semibold">₹{payout.adminPayAmount.toFixed(2)}</p>
                              </div>
                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Pending Amount</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-lg font-semibold">₹{payout.pendingAmount.toFixed(2)}</p>
                                  {payout.pendingAmount > 0 && (
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm"
                                      className="h-8"
                                      onClick={() => {
                                        setSelectedPayout(payout);
                                        setReceiveDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="h-3.5 w-3.5 mr-1" />
                                      Receive
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogHeader>
                          <div className="mt-4">
                            <h3 className="font-medium mb-2">Transaction Details</h3>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                              {payout.transactions.map((txn, index) => (
                                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                  <div>
                                    <p className="font-medium">{txn.description}</p>
                                    <p className="text-sm text-gray-500">{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                  </div>
                                  <div className={`font-medium ${txn.type === 'receive' ? 'text-green-600' : 'text-blue-600'}`}>
                                    {txn.type === 'receive' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {selectedPayout?.id === payout.id && (
                        <ReceiveAmountDialog
                          open={receiveDialogOpen && selectedPayout?.id === payout.id}
                          onOpenChange={(open) => {
                            setReceiveDialogOpen(open);
                            if (!open) setSelectedPayout(null);
                          }}
                          onReceive={(amount) => handleReceiveAmount(payout.id, amount)}
                          pendingAmount={payout.pendingAmount}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            className="mt-4"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={payoutData.length}
          />
        </CardContent>
      </Card>
    </div>
  );
}
