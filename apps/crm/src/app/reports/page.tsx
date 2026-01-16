'use client';

import { useCrmAuth } from '@/hooks/useCrmAuth';
import VendorReports from '@/components/reports/vendor/VendorReports';
import SupplierReports from '@/components/reports/supplier/SupplierReports';
import { Skeleton } from "@repo/ui/skeleton";

export default function ReportsPage() {
  const { role, isLoading } = useCrmAuth();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (role === 'supplier') {
    return <SupplierReports />;
  }

  // Default to vendor reports for vendor, staff, owner, and admin
  return <VendorReports />;
}
