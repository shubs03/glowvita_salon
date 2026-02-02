# Platform Fees and Service Tax Issue - Solution

## Problem Summary
When booking appointments through the web application, `platformFee` and `serviceTax` were being stored as `0` in the database, even though the `finalAmount` included these charges. This was causing a "Forbidden" error when trying to view appointment details in the CRM.

## Root Causes Identified

### 1. CRM Permission Error (FIXED ✅)
**Issue**: The CRM's `AppointmentDetailView` component was trying to fetch tax settings from `/admin/tax-fees`, which requires admin permissions.

**Solution**: Removed the `useGetTaxFeeSettingsQuery` hook from `AppointmentDetailView.tsx` since the tax fee data is already stored in the appointment when created.

**Files Modified**:
- `apps/crm/src/components/AppointmentDetailView.tsx`

### 2. Missing Fees in Multi-Service Lock Request (FIXED ✅)
**Issue**: The `Step3_MultiServiceTimeSlot` component was receiving `platformFee`, `serviceTax`, and `taxRate` as props but NOT passing them to the backend lock request.

**Solution**: Added fee and tax fields to the lock request payload in `Step3_MultiServiceTimeSlot.tsx`.

**Files Modified**:
- `apps/web/src/components/booking/Step3_MultiServiceTimeSlot.tsx`

### 3. Fees Not Being Calculated (NEEDS IMPLEMENTATION ⚠️)
**Issue**: The booking components receive `platformFee` and `serviceTax` as props with default values of `0`, but these values are never being calculated and passed from the parent component.

**Solution Required**: The parent component that renders the booking steps needs to:
1. Fetch tax fee settings from `/api/tax-fees`
2. Calculate fees using the `calculateBookingAmount` utility
3. Pass the calculated fees to the Step3 components

## Implementation Guide

### Step 1: Use the Price Calculation Hook

I've created a new hook `usePriceCalculation` that you can use in your booking flow:

```typescript
import { usePriceCalculation } from '@/hooks/usePriceCalculation';

// In your booking component:
const { priceBreakdown, isCalculating } = usePriceCalculation(
  selectedServices,
  taxFeeSettings,
  offer // optional
);
```

### Step 2: Pass Calculated Fees to Step3 Components

Wherever you render `Step3_MultiServiceTimeSlot` or `Step3_TimeSlot`, pass the calculated fees:

```typescript
<Step3_MultiServiceTimeSlot
  // ... other props
  platformFee={priceBreakdown?.platformFee || 0}
  serviceTax={priceBreakdown?.serviceTax || 0}
  taxRate={priceBreakdown?.taxFeeSettings?.serviceTax || 0}
  couponCode={appliedCoupon?.code || null}
  discountAmount={priceBreakdown?.discountAmount || 0}
/>
```

### Step 3: Fetch Tax Fee Settings

Make sure your parent booking component fetches tax settings:

```typescript
const [taxFeeSettings, setTaxFeeSettings] = useState(null);

useEffect(() => {
  const fetchTaxSettings = async () => {
    try {
      const response = await fetch('/api/tax-fees');
      if (response.ok) {
        const data = await response.json();
        setTaxFeeSettings(data);
      }
    } catch (error) {
      console.error('Error fetching tax settings:', error);
    }
  };
  
  fetchTaxSettings();
}, []);
```

## Files Created
- `apps/web/src/hooks/usePriceCalculation.ts` - New hook for calculating price breakdown

## Files Modified
1. `apps/crm/src/components/AppointmentDetailView.tsx`
   - Removed `useGetTaxFeeSettingsQuery` hook
   - Removed `taxSettings` from useMemo dependency array
   - Fixed taxRate calculation to use appointment data only

2. `apps/web/src/components/booking/Step3_MultiServiceTimeSlot.tsx`
   - Added `platformFee`, `serviceTax`, `taxRate`, `couponCode`, and `discountAmount` to lock request

## Next Steps for You

1. **Find the Parent Component**: Locate the component that renders your booking steps (likely in `apps/web/src/app/book/[salonId]/page.tsx` or similar)

2. **Add Price Calculation**: Import and use the `usePriceCalculation` hook to calculate fees based on selected services and tax settings

3. **Pass Fees as Props**: Ensure the calculated fees are passed to all Step3 components

4. **Test the Flow**: 
   - Book an appointment through the web app
   - Check that `platformFee` and `serviceTax` are no longer `0` in the database
   - Verify that the CRM can open appointment details without errors

## Utility Functions Available

### `calculateBookingAmount` (from `@repo/lib/utils/paymentCalculator`)
```typescript
import { calculateBookingAmount } from '@repo/lib/utils/paymentCalculator';

const breakdown = await calculateBookingAmount(services, offer, taxFeeSettings);
// Returns: {
//   subtotal, discountAmount, amountAfterDiscount,
//   platformFee, serviceTax, vendorServiceTax,
//   totalTax, finalTotal, taxFeeSettings
// }
```

## Testing Checklist

- [ ] Platform fees are calculated correctly based on admin settings
- [ ] Service tax is calculated correctly based on admin settings
- [ ] Fees are included in the lock request
- [ ] Fees are stored in the database when appointment is created
- [ ] CRM can open appointment details without "Forbidden" error
- [ ] Price breakdown displays correctly in booking summary
- [ ] Coupons/discounts are applied correctly

## Additional Notes

- The `calculateBookingAmount` function automatically fetches tax settings if not provided
- It falls back to default values (15% platform fee, 18% service tax) if settings can't be fetched
- The function calculates platform fee on subtotal, and GST on (subtotal + platform fee)
- Discounts are applied to the final total, not to individual components
