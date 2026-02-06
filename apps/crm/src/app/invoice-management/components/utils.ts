// Utility functions for Invoice Management

import { Billing, InvoiceData } from './types';

// Format date (show only date without time)
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format currency
export const formatCurrency = (amount: number) => {
  return `₹${amount.toFixed(2)}`;
};

// Prepare invoice data for InvoiceUI component
export const prepareInvoiceData = (billing: Billing): InvoiceData => {
  const invoiceNumber = billing.invoiceNumber;

  const invoiceData: InvoiceData = {
    invoiceNumber: invoiceNumber,
    date: new Date(billing.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    time: new Date(billing.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    client: billing.clientInfo,
    status: billing.paymentStatus,
    items: billing.items,
    subtotal: billing.subtotal,
    originalSubtotal: billing.subtotal,
    discount: billing.items.reduce((total, item) => {
      if (item.discount) {
        if (item.discountType === 'percentage') {
          return total + (item.price * item.quantity * item.discount / 100);
        } else {
          return total + item.discount;
        }
      }
      return total;
    }, 0),
    tax: billing.taxAmount,
    platformFee: billing.platformFee,
    total: billing.totalAmount,
    balance: billing.balance,
    paymentMethod: billing.paymentMethod
  };

  return invoiceData;
};

// Prepare appointment invoice data for AppointmentInvoice component
export const prepareAppointmentInvoiceData = (appointment: any): any => {
  return {
    invoiceNumber: appointment.invoiceNumber || "N/A",
    date: new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    time: appointment.startTime || "",
    client: {
      fullName: appointment.clientName || appointment.client?.fullName || "N/A",
      phone: appointment.clientPhone || appointment.client?.phone || "",
      email: appointment.clientEmail || appointment.client?.email || "",
    },
    status: appointment.status,
    items: [
      ...(appointment.serviceItems || []).map((item: any) => ({
        name: item.serviceName,
        price: item.amount,
        quantity: 1,
        totalPrice: item.amount,
        type: 'service'
      })),
      ...(appointment.addOns || []).map((addon: any) => ({
        name: addon.name,
        price: addon.price,
        quantity: 1,
        totalPrice: addon.price,
        type: 'addon'
      }))
    ],
    subtotal: appointment.amount || appointment.totalAmount,
    originalSubtotal: appointment.totalAmount,
    discount: appointment.discountAmount || 0,
    tax: appointment.serviceTax || 0,
    platformFee: appointment.platformFee || 0,
    total: appointment.finalAmount || appointment.totalAmount,
    balance: appointment.amountRemaining || 0,
    paymentMethod: appointment.paymentMethod || "N/A",
    couponCode: appointment.couponCode
  };
};
