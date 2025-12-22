"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SalonFilterContextType {
  selectedCategories: string[];
  selectedServices: string[];
  setSelectedCategories: (categories: string[]) => void;
  setSelectedServices: (services: string[]) => void;
  clearFilters: () => void;
  // New functions to manage individual selections
  addCategory: (categoryId: string) => void;
  removeCategory: (categoryId: string) => void;
  addService: (serviceId: string) => void;
  removeService: (serviceId: string) => void;
}

// Create a default context value to avoid errors during SSR
const defaultContextValue: SalonFilterContextType = {
  selectedCategories: [],
  selectedServices: [],
  setSelectedCategories: () => {},
  setSelectedServices: () => {},
  clearFilters: () => {},
  addCategory: () => {},
  removeCategory: () => {},
  addService: () => {},
  removeService: () => {},
};

const SalonFilterContext = createContext<SalonFilterContextType>(defaultContextValue);

export function SalonFilterProvider({ children }: { children: ReactNode }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedServices([]);
  };

  const addCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories(prev => [...prev, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories(prev => prev.filter(id => id !== categoryId));
  };

  const addService = (serviceId: string) => {
    if (!selectedServices.includes(serviceId)) {
      setSelectedServices(prev => [...prev, serviceId]);
    }
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(id => id !== serviceId));
  };

  return (
    <SalonFilterContext.Provider
      value={{
        selectedCategories,
        selectedServices,
        setSelectedCategories,
        setSelectedServices,
        clearFilters,
        addCategory,
        removeCategory,
        addService,
        removeService
      }}
    >
      {children}
    </SalonFilterContext.Provider>
  );
}

export function useSalonFilter() {
  return useContext(SalonFilterContext);
}