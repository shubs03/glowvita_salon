
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@repo/ui/card";
import { ExportButtons } from "@/components/ExportButtons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { glowvitaApi } from '@repo/store/api';
import { useAppDispatch } from '@repo/store/hooks';
import { toast } from 'sonner';
import { Plus } from "lucide-react";

// Import new components
import SettlementsStatsCards from "./components/SettlementsStatsCards";
import SettlementsFiltersToolbar from "./components/SettlementsFiltersToolbar";
import SettlementsTableNew from "./components/SettlementsTableNew";
import SettlementsPaginationControls from "./components/SettlementsPaginationControls";
import SettlementsDetailCard from "./components/SettlementsDetailCard";
import SettlementsPaymentModal from "./components/SettlementsPaymentModal";

// Import the original PayoutData interface
import { PayoutData } from "./components/SettlementsTable";

export default function SettlementsPage() {
  const dispatch = useAppDispatch();

  // RTK Query hooks for settlements
  // TODO: Implement the actual settlements API in the store
  // For now, using a mock implementation
  const settlementsData: PayoutData[] = [{
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
  },{
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
  }]; // Placeholder - will be replaced with actual API call
  const isLoading = false; // Placeholder - will be replaced with actual loading state

  // RTK Query mutations
  // Placeholder implementations - will be replaced with actual mutations
  const collectPayment = (data: any) => Promise.resolve();

  const settlements: PayoutData[] = Array.isArray(settlementsData) ? settlementsData : [];

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<PayoutData | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"view">("view");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Filter and paginate settlements
  const filteredSettlements = useMemo(() => {
    return settlements.filter(
      (settlement) =>
        (settlement.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          settlement.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" ||
          settlement.status === statusFilter)
    );
  }, [settlements, searchTerm, statusFilter]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredSettlements.slice(
    firstItemIndex,
    lastItemIndex
  );
  const totalPages = Math.ceil(filteredSettlements.length / itemsPerPage);

  // Modal handlers
  const handleOpenModal = (
    type: "view",
    settlement?: PayoutData
  ) => {
    setModalType(type);
    setSelectedSettlement(settlement || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSettlement(null);
  };

  const handleOpenPaymentModal = (settlement: PayoutData) => {
    setSelectedSettlement(settlement);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedSettlement(null);
  };

  // Payment collection handler
  const handleCollectPayment = async (payoutId: string, amount: number) => {
    const toastId = toast.loading("Processing payment...");
    setIsProcessingPayment(true);
    
    try {
      // Call backend to record payment
      await collectPayment({
        payoutId: payoutId,
        amount: amount,
      });

      toast.success("Payment received successfully", {
        description: `₹${amount.toFixed(2)} received`,
      });

      handleClosePaymentModal();
      // refetch data to update UI
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment", {
        description: error?.message || "Please try again.",
      });
    } finally {
      toast.dismiss(toastId);
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Settlements
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Manage your settlements and track vendor payments
              </p>
            </div>
          </div>
        </div>

        {/* Settlements Stats Cards */}
        <SettlementsStatsCards payouts={settlements} />

        {/* Filters Toolbar */}
        <SettlementsFiltersToolbar
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          exportData={filteredSettlements}
          exportColumns={[
            { header: 'Vendor', key: 'vendor' },
            { header: 'Contact', key: 'contactNo' },
            { header: 'Owner', key: 'ownerName' },
            { 
              header: 'Receive Amount', 
              key: 'adminReceiveAmount',
              transform: (val) => `₹${Number(val).toFixed(2)}`
            },
            { 
              header: 'Pay Amount', 
              key: 'adminPayAmount',
              transform: (val) => `₹${Number(val).toFixed(2)}`
            },
            { 
              header: 'Pending Amount', 
              key: 'pendingAmount',
              transform: (val) => `₹${Number(val).toFixed(2)}`
            },
            { 
              header: 'Total Settlement', 
              key: 'totalSettlement',
              transform: (val) => `₹${Number(val).toFixed(2)}`
            },
            { header: 'Status', key: 'status' }
          ]}
          exportFilename="settlements_export"
          exportTitle="Settlements Report"
        />

        {/* Settlements Table */}
        <div className="flex-1 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              <SettlementsTableNew
                payouts={settlements}
                isLoading={isLoading}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                currentItems={currentItems}
                onOpenModal={handleOpenModal}
              />
            </CardContent>
          </Card>
        </div>

        {/* Pagination Controls */}
        <SettlementsPaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredSettlements.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
        />

        {/* Settlement Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full h-[70vh] max-h-[70vh] p-0 overflow-hidden flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
              <DialogTitle className="text-lg sm:text-xl">
                Settlement Details
              </DialogTitle>
              <DialogDescription>
                View detailed information about this settlement
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6 -mt-1 no-scrollbar">
              {selectedSettlement && (
                <div className="pr-1">
                  <SettlementsDetailCard
                    payout={selectedSettlement}
                    onReceivePayment={handleOpenPaymentModal}
                    onClose={handleCloseModal}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Collection Modal */}
        <SettlementsPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          onCollectPayment={handleCollectPayment}
          selectedPayout={selectedSettlement}
          isProcessing={isProcessingPayment}
        />
      </div>
    </div>
  );
}
