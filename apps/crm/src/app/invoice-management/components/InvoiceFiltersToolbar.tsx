import { Input } from '@repo/ui/input';
import { Search, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Label } from "@repo/ui/label";
import { Button } from "@repo/ui/button";
import { Calendar, Scissors, Package, Receipt } from "lucide-react";
import { ExportButtons } from '@/components/ExportButtons';
import { Billing } from './types';

interface InvoiceFiltersToolbarProps {
  searchTerm: string;
  selectedPaymentMethod: string;
  selectedItemType: 'all' | 'Service' | 'Product';
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onItemTypeChange: (value: 'all' | 'Service' | 'Product') => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearDateFilters: () => void;
  paymentMethods: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  exportData?: Billing[];
}

const InvoiceFiltersToolbar = ({
  searchTerm,
  selectedPaymentMethod,
  selectedItemType,
  startDate,
  endDate,
  onSearchChange,
  onPaymentMethodChange,
  onItemTypeChange,
  onStartDateChange,
  onEndDateChange,
  onClearDateFilters,
  paymentMethods,
  activeTab,
  onTabChange,
  exportData
}: InvoiceFiltersToolbarProps) => {
  const getExportColumns = () => {
    if (activeTab === 'billing') {
      return [
        { header: 'Invoice Number', key: 'invoiceNumber' },
        { header: 'Client Name', key: 'clientInfo.fullName' },
        { header: 'Client Phone', key: 'clientInfo.phone' },
        { header: 'Total Amount', key: 'totalAmount' },
        { header: 'Payment Status', key: 'paymentStatus' },
        { header: 'Payment Method', key: 'paymentMethod' },
        { header: 'Created At', key: 'createdAt' }
      ];
    } else {
      return [
        { header: 'Invoice Number', key: 'invoiceNumber' },
        { header: 'Client Name', key: 'clientName' },
        { header: 'Date', key: 'date' },
        { header: 'Total Amount', key: 'finalAmount' },
        { header: 'Status', key: 'status' },
        { header: 'Payment Method', key: 'paymentMethod' }
      ];
    }
  };

  const getExportTitle = () => {
    if (activeTab === 'billing') return 'Counter Billing Report';
    return 'Appointment Invoices Report';
  };

  return (
    <div className="rounded-lg space-y-4">
      {/* Main Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices, clients..."
            className="pl-10 h-12 rounded-lg border border-border focus:border-primary text-base"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Tab Switcher Button */}
          <div className="flex items-center rounded-md border border-border/20 overflow-hidden w-fit">
            <button
              type="button"
              onClick={() => onTabChange('billing')}
              className={`h-12 px-4 sm:px-6 flex items-center transition-colors ${activeTab === 'billing' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}`}
            >
              <Receipt className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Counter Billing</span>
              <span className="sm:hidden">CB</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('appointments')}
              className={`h-12 px-4 sm:px-6 flex items-center transition-colors ${activeTab === 'appointments' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}`}
            >
              <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Appointments</span>
              <span className="sm:hidden">AP</span>
            </button>
          </div>
          
          <Select value={selectedPaymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-lg border-border hover:border-primary">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border/40">
              <SelectItem value="all">All Payment Methods</SelectItem>
              {paymentMethods.map((method: string) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {activeTab === 'billing' && (
            <Select value={selectedItemType} onValueChange={(value) => onItemTypeChange(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-lg border-border hover:border-primary">
                <SelectValue placeholder="Item Type" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-border/40">
                <SelectItem value="all">All Item Types</SelectItem>
                <SelectItem value="Service">
                  <div className="flex items-center">
                    <Scissors className="w-4 h-4 mr-2 text-blue-600" />
                    Services
                  </div>
                </SelectItem>
                <SelectItem value="Product">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-green-600" />
                    Products
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {exportData && (
            <ExportButtons
              data={exportData}
              filename={`${activeTab}_invoices_export`}
              title={getExportTitle()}
              columns={getExportColumns()}
              className="h-12"
            />
          )}
        </div>
      </div>
      
      {/* Date Range Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="startDate"
              type="date"
              placeholder="Start Date"
              className="pl-10 h-12 rounded-lg border-border"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="endDate"
              type="date"
              placeholder="End Date"
              className="pl-10 h-12 rounded-lg border-border"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>
        
        {(startDate || endDate) && (
          <Button 
            variant="outline" 
            onClick={onClearDateFilters} 
            className="h-12 self-end rounded-lg"
          >
            Clear Dates
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvoiceFiltersToolbar;
