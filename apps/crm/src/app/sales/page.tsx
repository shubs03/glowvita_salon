"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { ShoppingCart, Package, Clock } from "lucide-react";
import { useState } from "react";
import ServicesTab from "./components/ServicesTab";
import ProductsTab from "./components/ProductsTab";
import { useCrmAuth } from "@/hooks/useCrmAuth";

// Client interface
interface Client {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  birthdayDate: string;
  gender: 'Male' | 'Female' | 'Other';
  country: string;
  occupation: string;
  profilePicture?: string;
  address: string;
  preferences?: string;
  lastVisit: string;
  totalBookings: number;
  totalSpent: number;
  status: 'Active' | 'Inactive' | 'New';
  createdAt?: string;
  updatedAt?: string;
}

// Service interface
interface Service {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
  categoryName: string;
  price: number;
  duration: number;
  description: string;
  status: string;
}

// Product interface
interface Product {
  _id: string;
  productImage: string;
  productName: string;
  price: number;
  salePrice: number;
  category: string;
  categoryDescription?: string;
  stock: number;
  isActive: boolean;
  description?: string;
  status: 'pending' | 'approved' | 'disapproved';
}

// Service cart item interface
interface ServiceCartItem extends Service {
  quantity: number;
  totalPrice: number;
  addOns?: any[];
  staffMember?: {
    id: string;
    name: string;
  };
}

// Product cart item interface
interface ProductCartItem extends Product {
  quantity: number;
  totalPrice: number;
  addOns?: any[];
}

export default function SalesPage() {
  const { user, role } = useCrmAuth();
  const userRole = role || user?.role;

  // Determine initial active tab based on user role
  // Suppliers only have products, so default to products tab
  const initialTab = userRole === 'supplier' ? 'products' : 'services';

  // Tab state
  const [activeTab, setActiveTab] = useState<'services' | 'products'>(initialTab as any);

  // Shared states between tabs
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [serviceCart, setServiceCart] = useState<ServiceCartItem[]>([]);
  const [productCart, setProductCart] = useState<ProductCartItem[]>([]);

  // Force re-render when selectedClient changes
  const selectedClientId = selectedClient?._id;


  // Determine which tabs to show based on user role
  const showServicesTab = userRole !== 'supplier';
  const showProductsTab = true; // Both vendors and suppliers can have products

  // If supplier, only show products tab
  const availableTabs = [];
  if (showServicesTab) availableTabs.push('services');
  if (showProductsTab) availableTabs.push('products');

  // If current tab is not available, switch to the first available tab
  if (!availableTabs.includes(activeTab) && availableTabs.length > 0) {
    setActiveTab(availableTabs[0] as any);
  }

  // Debug logging to check role
  console.log('Sales Page - User Role:', userRole);
  console.log('Sales Page - Show Services Tab:', showServicesTab);
  console.log('Sales Page - Show Products Tab:', showProductsTab);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section matching marketplace design */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Sales Overview
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Manage your sales and process customer transactions
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Show for vendors (multiple tabs) and suppliers (single Products tab) */}
        <div className="mb-6">
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              {showServicesTab && (
                <button
                  onClick={() => setActiveTab('services')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'services'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                    }`}
                >
                  Services
                </button>
              )}
              {showProductsTab && (
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'products'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                    }`}
                >
                  Products
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'services' && showServicesTab ? (
            <ServicesTab
              cart={serviceCart}
              setCart={setServiceCart}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
            />
          ) : activeTab === 'products' && showProductsTab ? (
            <ProductsTab
              cart={productCart}
              setCart={setProductCart}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
            />
          ) : (
            <div>No content available</div>
          )}
        </div>
      </div>
    </div>
  );
}