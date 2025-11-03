export interface PriceBreakdown {
  subtotal: number;
  discountAmount: number;
  amountAfterDiscount: number;
  platformFee: number;
  serviceTax: number; // This is GST
  vendorServiceTax: number;
  totalTax: number;
  finalTotal: number;
  taxFeeSettings: any;
}

export function calculateBookingAmount(
  services: any[],
  offer?: any,
  taxFeeSettings?: any
): Promise<PriceBreakdown>;

export function calculateServicePriceWithTax(service: any): number;

export default {
  calculateBookingAmount,
  calculateServicePriceWithTax
};