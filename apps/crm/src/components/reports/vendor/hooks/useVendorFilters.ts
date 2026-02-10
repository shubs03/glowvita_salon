import { useState } from 'react';

interface FilterState {
  allAppointments: {
    startDate: string;
    endDate: string;
    client: string;
    service: string;
    staff: string;
    status: string;
    bookingType: string;
  };
  salesByService: {
    startDate: string;
    endDate: string;
    client: string;
    service: string;
    staff: string;
    status: string;
    bookingType: string;
  };
  summaryByService: {
    startDate: string;
    endDate: string;
    client: string;
    service: string;
    staff: string;
    status: string;
    bookingType: string;
  };
  completedAppointments: {
    startDate: string;
    endDate: string;
    client: string;
    service: string;
    staff: string;
    bookingType: string;
  };
  cancelledAppointments: {
    startDate: string;
    endDate: string;
    client: string;
    service: string;
    staff: string;
    status: string;
    bookingType: string;
  };
  salesByCustomer: {
    startDate: string;
    endDate: string;
    client: string;
    service: string;
    staff: string;
    status: string;
    bookingType: string;
  };
  productSummary: {
    product: string;
    category: string;
    brand: string;
    status: string;
    isActive: boolean | undefined;
  };
  salesByProduct: {
    product: string;
    category: string;
    brand: string;
    status: string;
    isActive: boolean | undefined;
  };
  settlementSummary: {
    settlementFromDate: string | undefined;
    settlementToDate: string | undefined;
    startDate: string | undefined;
    endDate: string | undefined;
    client: string | undefined;
    service: string | undefined;
    staff: string | undefined;
    status: string | undefined;
    bookingType: string | undefined;
  };
}

export const useVendorFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    allAppointments: {
      startDate: '',
      endDate: '',
      client: '',
      service: '',
      staff: '',
      status: '',
      bookingType: ''
    },
    salesByService: {
      startDate: '',
      endDate: '',
      client: '',
      service: '',
      staff: '',
      status: '',
      bookingType: ''
    },
    summaryByService: {
      startDate: '',
      endDate: '',
      client: '',
      service: '',
      staff: '',
      status: '',
      bookingType: ''
    },
    completedAppointments: {
      startDate: '',
      endDate: '',
      client: '',
      service: '',
      staff: '',
      bookingType: ''
    },
    cancelledAppointments: {
      startDate: '',
      endDate: '',
      client: '',
      service: '',
      staff: '',
      status: '',
      bookingType: ''
    },
    salesByCustomer: {
      startDate: '',
      endDate: '',
      client: '',
      service: '',
      staff: '',
      status: '',
      bookingType: ''
    },
    productSummary: {
      product: '',
      category: '',
      brand: '',
      status: '',
      isActive: undefined
    },
    salesByProduct: {
      product: '',
      category: '',
      brand: '',
      status: '',
      isActive: undefined
    },
    settlementSummary: {
      settlementFromDate: undefined,
      settlementToDate: undefined,
      startDate: undefined,
      endDate: undefined,
      client: undefined,
      service: undefined,
      staff: undefined,
      status: undefined,
      bookingType: undefined
    }
  });

  const updateFilter = <K extends keyof FilterState>(
    reportType: K,
    newFilter: Partial<FilterState[K]>
  ) => {
    setFilters(prev => ({
      ...prev,
      [reportType]: { ...prev[reportType], ...newFilter }
    }));
  };

  return { filters, updateFilter, setFilters };
};
