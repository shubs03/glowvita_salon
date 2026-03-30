// Appointment details for settlement
export interface SettlementAppointment {
    _id: string;
    appointmentId: string;
    date: Date | string;
    clientName: string;
    serviceName: string;
    staffName: string;
    totalAmount: number;
    platformFee: number;
    serviceTax: number;
    finalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    mode: 'online' | 'offline';
}

// Settlement data for a vendor
export interface SettlementData {
    id: string;
    vendorId: string;
    vendorName: string;
    contactNo: string;
    ownerName: string;

    // Settlement period
    settlementFromDate: Date | string;
    settlementToDate: Date | string;

    // Financial details
    totalAmount: number;              // Total of all appointment amounts
    platformFeeTotal: number;         // Total platform fees
    serviceTaxTotal: number;          // Total service taxes

    // Pay Online: Admin owes vendor (service amount only, admin keeps fees)
    adminOwesVendor: number;          // Amount admin should pay to vendor

    // Pay at Salon: Vendor owes admin (platform fee + service tax)
    vendorOwesAdmin: number;          // Amount vendor should pay to admin

    // Net settlement (positive = admin owes vendor, negative = vendor owes admin)
    netSettlement: number;

    // Calculated amounts for display
    adminReceivableAmount: number;    // If vendor owes admin (when netSettlement < 0)
    vendorAmount: number;             // If admin owes vendor (when netSettlement > 0)

    // Payment tracking
    amountPaid: number;               // Amount already settled
    amountPending: number;            // Amount still pending
    status: "Paid" | "Pending" | "Partially Paid";

    // Appointments included in this settlement
    appointments: SettlementAppointment[];

    // Payment history
    paymentHistory: PaymentRecord[];
}

// Payment record for tracking vendor payments
export interface PaymentRecord {
    _id?: string;
    amount: number;
    type: "Payment to Vendor" | "Payment to Admin";
    paymentDate: Date | string;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
}

// Legacy types for backward compatibility
export interface Transaction {
    type: 'receive' | 'pay';
    amount: number;
    date: string;
    description: string;
}

export interface PayoutData {
    id: string;
    vendor: string;
    contactNo: string;
    ownerName: string;
    adminReceiveAmount: number;
    adminPayAmount: number;
    pendingAmount: number;
    totalSettlement: number;
    status: "Paid" | "Pending";
    transactions: Transaction[];
}
