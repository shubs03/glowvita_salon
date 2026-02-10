export interface ReferralData {
  referralId: string;
  referralType: 'C2C' | 'C2V' | 'V2V';
  referrerName: string;
  referrerType: 'Client' | 'Vendor' | 'Doctor' | 'Supplier';
  refereeName: string;
  refereeType: 'Client' | 'Vendor' | 'Doctor' | 'Supplier';
  date: string;
  status: string;
  bonus: string;
  bonusAmount: number;
}

export interface ReferralSummary {
  totalReferrals: number;
  totalBonusAmount: number;
  activeReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  c2cCount: number;
  c2vCount: number;
  v2vCount: number;
}

export interface ReferralReportResponse {
  referrals: ReferralData[];
  summary: ReferralSummary;
  vendors?: string[];
  cities?: string[];
  statuses?: string[];
}
