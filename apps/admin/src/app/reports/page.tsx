"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Eye, FileText } from 'lucide-react';

// Import all table components
import {
  SellingServicesReportTable,
  CancellationReportTable,
  TotalBookingsReportTable,
  CompletedBookingsReportTable,
  ConsolidatedSalesReportTable,
  SalesByProductReportTable,
  SubscriptionReportTable,
  MarketingCampaignReportTable,
  VendorPayoutSettlementReportTable,
  VendorPayoutSettlementReportProductTable,
  VendorPayableReportTable,
  VendorPayableReportProductTable,
  ReferralReportTable,
  SettlementHistoryReportTable,
  PlatformCollectionsReportTable
} from './components/tables';

// Import all dialog components
import {
  SellingServicesReportDialog,
  CancellationReportDialog,
  TotalBookingsReportDialog,
  CompletedBookingsReportDialog,
  ConsolidatedSalesReportDialog,
  SalesByProductReportDialog,
  SubscriptionReportDialog,
  MarketingCampaignReportDialog,
  VendorPayoutSettlementReportDialog,
  VendorPayoutSettlementReportProductDialog,
  VendorPayableReportDialog,
  VendorPayableReportProductDialog,
  ReferralReportDialog,
  SettlementHistoryReportDialog,
  PlatformCollectionsReportDialog
} from './components/dialogs';

// Import shared components and data
import { ReportDetailModal } from './components/common';
import { reportsData } from './components/constants/reportsData';
import type { Report } from './components/types';

export default function ReportsPage() {
  // Dialog state management for all reports
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Individual dialog states
  const [showSellingServices, setShowSellingServices] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [showTotalBookings, setShowTotalBookings] = useState(false);
  const [showCompletedBookings, setShowCompletedBookings] = useState(false);
  const [showConsolidatedSales, setShowConsolidatedSales] = useState(false);
  const [showSalesByProduct, setShowSalesByProduct] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showMarketingCampaign, setShowMarketingCampaign] = useState(false);
  const [showVendorPayoutSettlement, setShowVendorPayoutSettlement] = useState(false);
  const [showVendorPayoutSettlementProduct, setShowVendorPayoutSettlementProduct] = useState(false);
  const [showVendorPayable, setShowVendorPayable] = useState(false);
  const [showVendorPayableProduct, setShowVendorPayableProduct] = useState(false);
  const [showReferralReport, setShowReferralReport] = useState(false);
  const [showSettlementHistory, setShowSettlementHistory] = useState(false);
  const [showPlatformCollections, setShowPlatformCollections] = useState(false);

  // Map report titles to dialog open functions
  const openReportDialog = (reportTitle: string) => {
    switch (reportTitle) {
      case "Sales by Services":
        setShowSellingServices(true);
        break;
      case "Cancellations":
        setShowCancellation(true);
        break;
      case "Total Bookings":
        setShowTotalBookings(true);
        break;
      case "Completed Bookings":
        setShowCompletedBookings(true);
        break;
      case "Sales Report":
        setShowConsolidatedSales(true);
        break;
      case "Sales by Product":
        setShowSalesByProduct(true);
        break;
      case "Subscription Report":
        setShowSubscription(true);
        break;
      case "Marketing Campaign Report":
        setShowMarketingCampaign(true);
        break;
      case "Vendor Payout Settlement Report-service":
        setShowVendorPayoutSettlement(true);
        break;
      case "Vendor Payout Settlement Report - Product":
        setShowVendorPayoutSettlementProduct(true);
        break;
      case "Vendor Payable to Admin Report-service":
        setShowVendorPayable(true);
        break;
      case "Vendor Payable to Admin Report - Product":
        setShowVendorPayableProduct(true);
        break;
      case "Referral Report":
        setShowReferralReport(true);
        break;
      case "Settlement Payment History":
        setShowSettlementHistory(true);
        break;
      case "Platform Collections":
        setShowPlatformCollections(true);
        break;
      default:
        break;
    }
  };

  const handleInfoClick = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and export detailed reports across all categories
        </p>
      </div>

      {/* Reports Grid */}
      <div className="space-y-8">
        {reportsData.map((categoryData) => (
          <div key={categoryData.category}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {categoryData.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryData.reports.map((report) => (
                <Card key={report.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {report.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openReportDialog(report.title)}
                        className="flex-1"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                      <Button
                        onClick={() => handleInfoClick(report)}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* All Dialog Components */}
      <SellingServicesReportDialog
        isOpen={showSellingServices}
        onClose={() => setShowSellingServices(false)}
      />
      <CancellationReportDialog
        isOpen={showCancellation}
        onClose={() => setShowCancellation(false)}
      />
      <TotalBookingsReportDialog
        isOpen={showTotalBookings}
        onClose={() => setShowTotalBookings(false)}
      />
      <CompletedBookingsReportDialog
        isOpen={showCompletedBookings}
        onClose={() => setShowCompletedBookings(false)}
      />
      <ConsolidatedSalesReportDialog
        isOpen={showConsolidatedSales}
        onClose={() => setShowConsolidatedSales(false)}
      />
      <SalesByProductReportDialog
        isOpen={showSalesByProduct}
        onClose={() => setShowSalesByProduct(false)}
      />
      <SubscriptionReportDialog
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
      />
      <MarketingCampaignReportDialog
        isOpen={showMarketingCampaign}
        onClose={() => setShowMarketingCampaign(false)}
      />
      <VendorPayoutSettlementReportDialog
        isOpen={showVendorPayoutSettlement}
        onClose={() => setShowVendorPayoutSettlement(false)}
      />
      <VendorPayoutSettlementReportProductDialog
        isOpen={showVendorPayoutSettlementProduct}
        onClose={() => setShowVendorPayoutSettlementProduct(false)}
      />
      <VendorPayableReportDialog
        isOpen={showVendorPayable}
        onClose={() => setShowVendorPayable(false)}
      />
      <VendorPayableReportProductDialog
        isOpen={showVendorPayableProduct}
        onClose={() => setShowVendorPayableProduct(false)}
      />
      <ReferralReportDialog
        isOpen={showReferralReport}
        onClose={() => setShowReferralReport(false)}
      />
      <SettlementHistoryReportDialog
        isOpen={showSettlementHistory}
        onClose={() => setShowSettlementHistory(false)}
      />
      <PlatformCollectionsReportDialog
        isOpen={showPlatformCollections}
        onClose={() => setShowPlatformCollections(false)}
      />

      {/* Report Detail Modal */}
      <ReportDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        report={selectedReport}
      />
    </div>
  );
}
