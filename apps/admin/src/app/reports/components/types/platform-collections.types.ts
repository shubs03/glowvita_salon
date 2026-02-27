export interface PlatformCollectionItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    itemTotal: number;
    gstRate: number;
    gstAmount: number;
    platformFeeRate: number;
    platformFeeAmount: number;
    totalWithFees: number;
}

export interface PlatformCollectionOrder {
    orderId: string;
    orderDate: string;
    orderStatus: string;
    vendorName: string;
    supplierName: string;
    items: PlatformCollectionItem[];
    subtotal: number;
    gstTotal: number;
    platformFeeTotal: number;
    orderTotal: number;
    totalCollected: number;
}

export interface PlatformCollectionsReportData {
    orders: PlatformCollectionOrder[];
    summary: {
        totalOrders: number;
        totalRevenue: number;
        totalGSTCollected: number;
        totalPlatformFeesCollected: number;
        averageOrderValue: number;
    };
}
