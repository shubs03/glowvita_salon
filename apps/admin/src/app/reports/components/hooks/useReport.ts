import { useState, useMemo, useRef } from 'react';
import { FilterParams } from '../types';

export const useReport = <T,>(initialItemsPerPage: number = 5) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const filterAndPaginateData = (data: T[], searchFields: (item: T) => string[]) => {
    // Filter data based on search term
    const filteredData = useMemo(() => {
      if (!searchTerm) return data;
      
      return data.filter(item => 
        searchFields(item).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }, [data, searchTerm]);

    // Pagination logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      filteredData,
      paginatedData,
      totalItems,
      totalPages,
      startIndex,
      endIndex
    };
  };

  return {
    // State
    filters,
    isFilterModalOpen,
    currentPage,
    itemsPerPage,
    searchTerm,
    tableRef,
    // Setters
    setFilters,
    setIsFilterModalOpen,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    // Functions
    handleFilterChange,
    filterAndPaginateData
  };
};
