"use client";

import { Card, CardContent } from "@repo/ui/card";
import { FileText, DollarSign, Scissors, Package } from 'lucide-react';
import { Billing, BillingItem } from './types';

interface SummaryStatsProps {
  billings: Billing[];
  appointments: any[];
  activeTab: string;
  isSupplier?: boolean;
}

export default function SummaryStats({ billings, appointments, activeTab, isSupplier }: SummaryStatsProps) {
  // Total revenue stays combined for both tabs (except for suppliers who don't have appointments)
  const totalRevenue =
    billings.reduce((sum, billing) => sum + billing.totalAmount, 0) +
    (!isSupplier ? appointments.reduce((sum, app) => sum + (app.finalAmount || app.totalAmount || 0), 0) : 0);

  // Stats change based on active tab
  const totalInvoices = activeTab === 'billing' ? billings.length : appointments.length;

  const servicesSold = activeTab === 'billing'
    ? billings.filter((b: Billing) => b.items.some((i: BillingItem) => i.itemType === 'Service')).length
    : (!isSupplier ? appointments.length : 0);

  const productsSold = activeTab === 'billing'
    ? billings.filter((b: Billing) => b.items.some((i: BillingItem) => i.itemType === 'Product')).length
    : 0;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSupplier ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 mb-6`}>
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-primary">{totalInvoices}</p>
              <p className="text-xs text-primary/70 mt-1">
                {activeTab === 'billing' ? 'Billing records' : 'Appointment records'}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-secondary-foreground">₹{totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">From all transactions</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <DollarSign className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {!isSupplier && (
        <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-foreground mb-1">Services Sold</p>
                <p className="text-2xl font-bold text-secondary-foreground">{servicesSold}</p>
                <p className="text-xs text-secondary-foreground/70 mt-1">
                  {activeTab === 'billing' ? 'In billing records' : 'In appointments'}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full transition-colors">
                <Scissors className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Products Sold</p>
              <p className="text-2xl font-bold text-secondary-foreground">{productsSold}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">
                {activeTab === 'billing' ? 'In billing records' : 'Not applicable'}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Package className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
