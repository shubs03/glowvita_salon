export interface CancelledBookingData {
  vendor: string;
  booking: {
    clientName: string;
    serviceName: string;
    date: Date;
    time: string;
    status: string;
    createdAt: Date;
    mode: string;
  };
}

export interface TotalBookingsData {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  onlineBookings: number;
  offlineBookings: number;
  totalRevenue: number;
  filter: string;
}

export interface CompletedBookingsData {
  totalCompletedBookings: number;
  completedOnlineBookings: number;
  completedOfflineBookings: number;
  revenueFromCompletedBookings: number;
  filter: string;
}

export interface BookingData {
  clientName: string;
  serviceName: string;
  vendorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  mode: string;
  finalAmount: number;
}

export interface VendorStat {
  vendorId: string;
  vendor: string;
  city: string;
  totalBookings: number;
  totalRevenue: number;
  totalPlatformFees: number;
  totalServiceTax: number;
  onlineBookings: number;
  offlineBookings: number;
  onlinePayments: number;
  offlinePayments: number;
}

export interface VendorCancellationStat {
  vendorId: string;
  vendor: string;
  city: string;
  totalCancellations: number;
  onlineCancellations: number;
  offlineCancellations: number;
}

export interface ServiceStat {
  _id: string;
  count: number;
  revenue?: number;
}
