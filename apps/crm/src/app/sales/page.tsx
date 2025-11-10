"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { ShoppingCart, Package, Clock } from "lucide-react";
import { useState } from "react";
import ServicesTab from "./components/ServicesTab";
import ProductsTab from "./components/ProductsTab";

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
}

// Product cart item interface
interface ProductCartItem extends Product {
  quantity: number;
  totalPrice: number;
}

export default function SalesPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  
  // Shared states between tabs
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [serviceCart, setServiceCart] = useState<ServiceCartItem[]>([]);
  const [productCart, setProductCart] = useState<ProductCartItem[]>([]);
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Sales Overview</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Products
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'services' ? (
        <ServicesTab 
          cart={serviceCart}
          setCart={setServiceCart}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />
      ) : (
        <ProductsTab 
          cart={productCart}
          setCart={setProductCart}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />
      )}
    </div>
  );
}