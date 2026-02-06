import { useState } from 'react';

interface ProductFilterState {
  product: string;
  category: string;
  brand: string;
  status: string;
  isActive: string;
  region: string;
}

interface SupplierFiltersState {
  productSummary: ProductFilterState;
  salesByProduct: ProductFilterState;
}

export const useSupplierFilters = () => {
  const [filters, setFilters] = useState<SupplierFiltersState>({
    productSummary: {
      product: '',
      category: '',
      brand: '',
      status: '',
      isActive: '',
      region: ''
    },
    salesByProduct: {
      product: '',
      category: '',
      brand: '',
      status: '',
      isActive: '',
      region: ''
    }
  });

  const updateFilter = (reportType: keyof SupplierFiltersState, newFilter: Partial<ProductFilterState>) => {
    setFilters(prev => ({
      ...prev,
      [reportType]: { ...prev[reportType], ...newFilter }
    }));
  };

  return { filters, updateFilter };
};
