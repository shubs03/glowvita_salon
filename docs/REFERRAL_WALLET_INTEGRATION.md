# Referral-Wallet Integration Guide

## Overview
This document describes the automatic referral bonus crediting system that integrates referrals with the wallet functionality. When a referred user makes their first purchase (order, appointment, consultation, or wedding package), both the referrer and referee (if enabled) automatically receive wallet credits.

## System Architecture

### Core Components

1. **Referral Utility Functions** (`packages/lib/src/utils/referralWalletCredit.js`)
   - `creditReferralBonus()`: Credits wallet balance to referrer and referee
   - `checkAndCreditReferralBonus()`: Checks if user was referred and triggers bonus

2. **Database Models**
   - `ReferralModel`: Tracks referral relationships and status
   - `WalletTransaction`: Records all wallet transactions
   - `User`: Stores wallet balance and referral relationships
   - `C2CSettingsModel`: Configurable referral bonus amounts

3. **Integration Points** (Auto-trigger on first transaction)
   - Order Creation: `/api/client/orders` (POST)
   - Appointment Booking: `/api/appointments` (POST)
   - Consultation Booking: `/api/consultations` (POST)
   - Wedding Package Booking: `/api/scheduling/wedding-package` (POST)

## How It Works

### 1. User Signup with Referral Code
When a user signs up with a referral code:
```javascript
// In /api/auth/signup
- Validates referral code exists
- Sets User.referredBy = referrerId
- Creates ReferralModel record with status='Pending'
```

**Referral Record Fields:**
```javascript
{
  referralType: 'C2C',
  referralId: 'REF1234567890123',
  referrer: '507f1f77bcf86cd799439011', // User who shared code
  referee: '507f191e810c19729de860ea', // New user who signed up
  status: 'Pending', // Changes: Pending → Completed → Bonus Paid
  bonus: '₹100', // From C2CSettings
  date: '2024-01-15T10:30:00Z'
}
```

### 2. First Transaction Trigger
When the referred user completes their first:
- Product order
- Service appointment
- Doctor consultation
- Wedding package booking

The system automatically:
```javascript
await checkAndCreditReferralBonus(userId, eventType);
```

### 3. Referral Status Progression

**Pending** → User signed up with referral code
- Referral record created
- No wallet credit yet
- Waiting for first transaction

**Completed** → User made first transaction
- Referral marked complete
- Wallet credits queued

**Bonus Paid** → Wallet credited successfully
- Referrer wallet: +₹100 (configurable)
- Referee wallet: +₹50 (if enabled in settings)
- WalletTransaction records created

### 4. Wallet Transaction Records

**For Referrer:**
```javascript
{
  userId: referrerId,
  type: 'credit',
  source: 'referral_bonus',
  amount: 100,
  status: 'completed',
  metadata: {
    referralId: 'REF1234567890123',
    refereeId: '507f191e810c19729de860ea',
    refereeName: 'John Doe',
    triggerEvent: 'order' // or 'appointment', 'consultation', 'wedding_package'
  },
  description: 'Referral bonus for referring John Doe'
}
```

**For Referee (if enabled):**
```javascript
{
  userId: refereeId,
  type: 'credit',
  source: 'referral_bonus',
  amount: 50,
  status: 'completed',
  metadata: {
    referralId: 'REF1234567890123',
    referrerId: '507f1f77bcf86cd799439011',
    referrerName: 'Jane Smith',
    triggerEvent: 'order'
  },
  description: 'Welcome bonus for being referred by Jane Smith'
}
```

## Configuration

### C2C Settings (Configurable via Admin)
```javascript
{
  referralEnabled: true,
  
  referrerBonus: {
    enabled: true,
    bonusType: 'amount', // or 'percentage'
    bonusValue: 100, // ₹100 or 10%
  },
  
  refereeBonus: {
    enabled: true,
    bonusType: 'amount',
    bonusValue: 50, // ₹50 or 5%
  }
}
```

## Integration Implementation

### Example: Orders Route
```javascript
import { checkAndCreditReferralBonus } from '@repo/lib/utils/referralWalletCredit';

export async function POST(req) {
  // ... order creation logic ...
  
  await newOrder.save();

  // Check and credit referral bonus
  try {
    await checkAndCreditReferralBonus(payload.userId, 'order');
  } catch (referralError) {
    // Don't fail the order if referral crediting fails
    console.error('Error crediting referral bonus:', referralError);
  }

  // ... continue with order processing ...
}
```

### Event Types
- `'order'` - Product order completion
- `'appointment'` - Service appointment booking
- `'consultation'` - Doctor consultation booking
- `'wedding_package'` - Wedding package booking

## Atomic Transactions

The system uses MongoDB transactions to ensure data integrity:

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Update ReferralModel status
  // 2. Credit referrer wallet
  // 3. Create WalletTransaction for referrer
  // 4. Credit referee wallet (if enabled)
  // 5. Create WalletTransaction for referee
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

**Why Atomic?**
- Prevents partial credits if system fails
- Ensures referral status updates only if credits succeed
- Maintains data consistency across models

## Error Handling

### Non-Blocking Design
Referral bonus crediting never blocks the main transaction:
```javascript
try {
  await checkAndCreditReferralBonus(userId, 'order');
} catch (referralError) {
  console.error('Error crediting referral bonus:', referralError);
  // Order/appointment still succeeds
}
```

### Idempotency
The system prevents duplicate credits:
- Checks if referral status is already 'Bonus Paid'
- Only triggers on first transaction
- Skips if user wasn't referred

### Error Scenarios Handled
1. **User not referred** → Silently skips (no error)
2. **Bonus already paid** → Skips to prevent duplicate
3. **Referral settings disabled** → Skips crediting
4. **Database transaction fails** → Rollback, log error
5. **Invalid referral record** → Logs error, continues

## Testing Scenarios

### Test Case 1: Normal Flow
1. User A signs up (gets referral code: ABC123)
2. User B signs up with code ABC123
   - ReferralModel created (status: 'Pending')
3. User B places first order
   - User A wallet: +₹100
   - User B wallet: +₹50
   - ReferralModel status → 'Bonus Paid'
4. User B places second order
   - No additional referral bonus (already paid)

### Test Case 2: Multiple Referred Users
1. User A refers 5 users
2. Each referred user completes first transaction
3. User A receives 5 × ₹100 = ₹500 total

### Test Case 3: Referee Bonus Disabled
1. Admin disables `refereeBonus.enabled`
2. User B (referee) completes first order
3. Only User A gets ₹100 (User B gets nothing)

### Test Case 4: No Referral
1. User C signs up without referral code
2. User C completes order
3. No referral bonus credited (expected behavior)

## Monitoring & Analytics

### Track Referral Performance
```javascript
// Get total referral bonuses paid
WalletTransaction.aggregate([
  { $match: { source: 'referral_bonus' } },
  { $group: { _id: null, total: { $sum: '$amount' } } }
])

// Get referrals by status
ReferralModel.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
])

// Top referrers
ReferralModel.aggregate([
  { $match: { status: 'Bonus Paid' } },
  { $group: { _id: '$referrer', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

### Admin Dashboard Metrics
- Total referrals (Pending/Completed/Bonus Paid)
- Total bonus amount credited
- Top referrers leaderboard
- Conversion rate (signups → first transaction)

## Security Considerations

### Fraud Prevention
1. **One-time bonus**: Only paid on first transaction
2. **Status tracking**: ReferralModel prevents duplicate payouts
3. **Atomic transactions**: No partial credits possible
4. **Audit trail**: All transactions logged in WalletTransaction

### Rate Limiting (Future Enhancement)
- Limit referral signups per IP
- Detect suspicious patterns
- Flag accounts with abnormal referral activity

## API Reference

### `checkAndCreditReferralBonus(userId, eventType)`
Checks if user was referred and credits bonus on first transaction.

**Parameters:**
- `userId` (String): MongoDB ObjectId of the user who completed transaction
- `eventType` (String): Type of transaction ('order', 'appointment', 'consultation', 'wedding_package')

**Returns:** 
- `Promise<Object>`: Result object with bonus details
- `null`: If no bonus credited (not referred or already paid)

**Throws:**
- Database errors (should be caught by caller)

**Example:**
```javascript
const result = await checkAndCreditReferralBonus('507f191e810c19729de860ea', 'order');
// Returns: { referrerBonus: 100, refereeBonus: 50, referralId: 'REF123' }
```

### `creditReferralBonus(referrerId, refereeId, referralId, triggerEvent)`
Directly credits wallet balance to referrer and referee.

**Parameters:**
- `referrerId` (String): MongoDB ObjectId of referrer
- `refereeId` (String): MongoDB ObjectId of referee
- `referralId` (String): Unique referral ID
- `triggerEvent` (String): Event that triggered the bonus

**Returns:** `Promise<Object>` with transaction details

## Future Enhancements

### Planned Features
1. **Tiered Rewards**
   - First referral: ₹100
   - 5 referrals: +₹500 bonus
   - 10 referrals: +₹1500 bonus

2. **Referral Expiry**
   - Bonus only if first transaction within 30 days

3. **Conditional Bonuses**
   - Minimum order amount (e.g., ₹500+)
   - Specific service categories

4. **Social Sharing**
   - WhatsApp/Facebook share buttons
   - Track share channel effectiveness

5. **Referral Dashboard**
   - User-facing page to track referrals
   - Share link generator
   - Earnings history

## Troubleshooting

### Common Issues

**Issue:** Bonus not credited after first order
- **Check:** ReferralModel exists with status='Pending'
- **Check:** User.referredBy field is set
- **Check:** C2CSettings.referralEnabled = true
- **Check:** Console logs for errors

**Issue:** Duplicate bonuses credited
- **Check:** ReferralModel.status should be 'Bonus Paid' after first credit
- **Solution:** System is idempotent, shouldn't happen

**Issue:** Wallet balance not updating
- **Check:** WalletTransaction record created
- **Check:** User.wallet field updated
- **Check:** MongoDB transaction committed successfully

### Debug Logging
```javascript
// Enable debug logs in referralWalletCredit.js
console.log('Checking referral for user:', userId);
console.log('Referral found:', referral);
console.log('C2C Settings:', c2cSettings);
console.log('Crediting amounts:', { referrerBonus, refereeBonus });
```

## Conclusion

The referral-wallet integration provides a fully automated, scalable system for rewarding users who refer others. By integrating at key transaction points and using atomic database operations, the system ensures reliable, secure, and traceable referral bonus payments without requiring manual admin intervention.

**Key Benefits:**
- ✅ Fully automated (no admin approval needed)
- ✅ Scales to 100+ customers effortlessly
- ✅ Atomic transactions prevent data inconsistency
- ✅ Non-blocking design doesn't affect core transactions
- ✅ Idempotent (prevents duplicate bonuses)
- ✅ Complete audit trail in WalletTransaction
- ✅ Configurable bonus amounts via admin settings
