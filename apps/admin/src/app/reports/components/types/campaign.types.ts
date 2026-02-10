export interface SubscriptionData {
  purchaseDate: string;
  vendor: string;
  type: string;
  city: string;
  subscription: string;
  startDate: string;
  endDate: string;
  price: number;
  planStatus: string;
  paymentMode: string;
}

export interface CampaignData {
  vendor: string;
  type: string;
  city: string;
  packageName: string;
  smsCount: number;
  price: number;
  purchaseDate: string;
  expiryDate: string;
  ticketRaised: number;
  status: string;
}
