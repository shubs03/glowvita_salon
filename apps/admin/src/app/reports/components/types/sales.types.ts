export interface SellingServiceData {
  service: string;
  vendor: string;
  city: string;
  totalServiceAmount: string;
  rawTotalServiceAmount: number;
  itemsSold: number;
  platformFee: string | null;
  rawPlatformFee: number;
  serviceTax: string | null;
  rawServiceTax: number;
}

export interface SalesByBrandData {
  brandName: string;
  totalQuantitySold: number;
  totalRevenue: string;
}

export interface SalesByCategoryData {
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: string;
}
