export interface VendorPayoutData {
  date: string;
  sourceType: string;
  entityName: string;
  servicePlatformFee: number;
  productPlatformFee: number;
  serviceTax: number;
  productTax: number;
  subscriptionAmount: number;
  smsCharges: number;
  totalReceived: number;
}

export interface VendorPayableData {
  date: string;
  payeeType: string;
  payeeName: string;
  serviceGrossAmount: number;
  productGrossAmount: number;
  platformFee: number;
  gst: number;
  amountPaid: number;
  status: string;
}

export interface VendorPayoutSettlementData {
  "Source Type": string;
  "Entity Name": string;
  "Service Gross Amount": number;
  "Service Platform Fee": number;
  "Service Tax (₹)": number;
  "Service Total Amount": number;
  "Total": number;
  city: string;
  vendorId: string;
  appointmentCount: number;
  completedAppointments: number;
  "Actually Paid"?: number;
  "Pending Amount"?: number;
}

export interface VendorPayoutSettlementProductData {
  "Source Type": string;
  "Entity Name": string;
  "Product Gross Amount": number;
  "Product Platform Fee": number;
  "Product Tax (₹)": number;
  "Product Total Amount": number;
  "Total": number;
  city?: string;
  vendorId?: string;
  orderCount?: number;
  deliveredOrders?: number;
  "Actually Paid"?: number;
  "Pending Amount"?: number;
}

export interface VendorPayableProductData {
  "Payee Type": string;
  "Payee Name": string;
  "product Gross Amount": number;
  "product Platform Fee": number;
  "product Tax/gst": number;
  "Total": number;
  city?: string;
  orderCount?: number;
  deliveredOrders?: number;
  "Actually Collected"?: number;
  "Pending Amount"?: number;
}

export interface VendorPayableSettlementData {
  "Payee Type": string;
  "Payee Name": string;
  "Service Gross Amount": number;
  "Service Platform Fee": number;
  "Service Tax (₹)": number;
  "Total": number;
  city: string;
  vendorId: string;
  appointmentCount: number;
  completedAppointments: number;
  "Actually Collected"?: number;
  "Pending Amount"?: number;
}
