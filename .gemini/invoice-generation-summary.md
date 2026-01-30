# Centralized Invoice Generation Implementation Summary

## Overview
Implemented a centralized invoice generation system that creates sequential invoice numbers for both Counter Bills and Appointment Bills using a single `Invoice` model.

## Changes Made

### 1. Invoice Model (`packages/lib/src/models/Invoice/Invoice.model.js`)
- **Created new centralized Invoice model** with the following features:
  - Sequential invoice number generation using format: `INV-[last 5 vendor ID]-[YYYYMMDD]-[sequence]`
  - Supports both `COUNTER` and `APPOINTMENT` source types
  - Stores complete invoice data including items, client info, payment details
  - Static method `generateInvoiceNumber(vendorId)` for creating unique invoice numbers
  - Static method `createFromAppointment(appointmentId, vendorId)` for generating invoices from appointments

### 2. Billing Model (`packages/lib/src/models/Vendor/Billing.model.js`)
- **Updated** `generateInvoiceNumber` method to delegate to `InvoiceModel.generateInvoiceNumber`
- This ensures counter bills use the same sequential numbering system

### 3. Appointment Model (`packages/lib/src/models/Appointment/Appointment.model.js`)
- **Added** `invoiceNumber` field (String, indexed) to track the generated invoice number

### 4. Appointment Update API (`apps/crm/src/app/api/crm/appointments/[id]/route.js`)
- **Modified** PUT handler to trigger invoice generation when status changes to 'completed'
- Invoice is generated **before** the appointment update to ensure the response includes the invoice number
- Calls `InvoiceModel.createFromAppointment()` which:
  - Checks if invoice already exists
  - Generates sequential invoice number
  - Creates invoice record
  - Updates appointment with invoice number

### 5. Appointment Status Update API (`apps/crm/src/app/api/crm/appointments/route.js`)
- **Updated** PATCH handler to trigger invoice generation when status changes to 'completed'
- Uses the same centralized `InvoiceModel.createFromAppointment()` method

### 6. AppointmentDetailView Component (`apps/crm/src/components/AppointmentDetailView.tsx`)
- **Added** `invoiceNumber` to the `Appointment` interface
- **Updated** `invoiceData` memo to prefer `appointment.invoiceNumber` from backend
- Falls back to client-side generated invoice number if backend number not available

### 7. Package Exports (`packages/lib/package.json`)
- **Added** export for Invoice model: `"./models/Invoice/Invoice.model": "./src/models/Invoice/Invoice.model.js"`

## Invoice Number Format
- **Format**: `INV-[last 5 vendor ID]-[YYYYMMDD]-[sequence]`
- **Example**: `INV-67890-20260128-01`
- **Sequence**: Resets daily, starts from 01
- **Counter**: Uses `invoice_YYYYMMDD` counter ID for atomic increments

## Data Flow

### For Appointments:
1. Appointment status updated to 'completed' via PUT or PATCH request
2. `InvoiceModel.createFromAppointment()` is called
3. Checks if invoice already exists for this appointment
4. If not, generates sequential invoice number using Counter model
5. Creates invoice record in `invoices` collection with `sourceType: 'APPOINTMENT'`
6. Updates appointment document with the generated `invoiceNumber`
7. Returns the saved invoice

### For Counter Bills:
1. Counter bill created via POST to `/api/crm/billing`
2. `InvoiceModel.generateInvoiceNumber()` is called (via Billing model)
3. Sequential invoice number generated
4. Invoice record created with `sourceType: 'COUNTER'`
5. Billing record and invoice record both saved

## Benefits
1. **Single Sequential System**: All invoices (counter + appointments) share one sequence per day
2. **No Duplicates**: Atomic counter increments prevent duplicate invoice numbers
3. **Centralized Logic**: Invoice generation logic in one place
4. **Backward Compatible**: Existing appointments work with fallback invoice number generation
5. **Audit Trail**: Complete invoice history in dedicated collection
6. **Easy Reporting**: Query invoices by date, vendor, source type, etc.

## Testing Checklist
- [ ] Create counter bill and verify invoice number
- [ ] Complete appointment and verify invoice number is sequential
- [ ] Verify invoice numbers increment correctly across counter and appointments
- [ ] Check that invoice is displayed correctly in AppointmentDetailView
- [ ] Verify invoice number appears in printed/downloaded invoice
- [ ] Test that updating appointment to completed multiple times doesn't create duplicate invoices
- [ ] Verify invoice data is correctly populated from appointment details

## Future Enhancements
- Add invoice PDF generation endpoint
- Implement invoice email functionality
- Add invoice search/filter API
- Create invoice reports dashboard
- Support invoice amendments/corrections
