export interface SettlementHistoryData {
    id: string;
    date: string;
    vendorName: string;
    city: string;
    type: 'Payment to Vendor' | 'Payment to Admin';
    method: string;
    amount: number;
    transactionId: string;
    notes: string;
}

export interface SettlementHistoryReportResponse {
    success: boolean;
    data: SettlementHistoryData[];
    aggregatedTotals: {
        totalPaidToVendor: number;
        totalPaidToAdmin: number;
    };
    vendorNames: string[];
}
