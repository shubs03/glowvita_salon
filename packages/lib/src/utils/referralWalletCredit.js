import mongoose from 'mongoose';
import WalletTransactionModel from '../models/Payment/WalletTransaction.model.js';
import WalletSettingsModel from '../models/admin/WalletSettings.model.js';
import UserModel from '../models/user/User.model.js';
import VendorModel from '../models/Vendor/Vendor.model.js';
import DoctorModel from '../models/Vendor/Docters.model.js';
import SupplierModel from '../models/Vendor/Supplier.model.js';
import { ReferralModel, C2CSettingsModel, V2VSettingsModel, C2VSettingsModel } from '../models/admin/Reffer.model.js';

/**
 * Credit referral bonus to user's wallet
 * @param {String|Object} referralData - Referral object or ID
 * @param {String} triggerEvent - What triggered the bonus (signup, appointment, subscription_purchase)
 * @returns {Object} - Result of the operation
 */
export async function creditReferralBonus(referralData, triggerEvent = 'appointment', useSession = true) {
  // Use a transaction if available but don't strictly require it for dev environments without replica sets
  let session = null;
  if (useSession) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      console.log("[Referral Bonus] Transactions/sessions not supported or failed to start, proceeding without session:", e.message);
      session = null;
    }
  }

  try {
    // 1. Always fetch referral fresh from DB to get a proper mongoose document (supports .save())
    let referral;
    let referralId;
    if (typeof referralData === 'string' || referralData instanceof mongoose.Types.ObjectId) {
      referralId = referralData;
    } else if (referralData && referralData._id) {
      referralId = referralData._id;
    } else {
      referralId = referralData;
    }

    referral = await ReferralModel.findById(referralId).session(session);

    if (!referral) {
      if (session) {
        try { await session.abortTransaction(); } catch (_) {}
        session.endSession();
      }
      return { success: false, message: 'Referral record not found' };
    }

    console.log(`[Referral Bonus] Processing bonus for ${referral.referralId} (${referral.referralType}), event: ${triggerEvent}`);

    if (referral.status === 'Completed' || referral.status === 'Bonus Paid') {
      if (session) {
        try { await session.abortTransaction(); } catch (_) {}
        session.endSession();
      }
      return { success: false, message: 'Bonus already paid' };
    }

    // 2. Get correct settings based on type and region
    let Model;
    switch (referral.referralType) {
      case 'C2C': Model = C2CSettingsModel; break;
      case 'C2V': Model = C2VSettingsModel; break;
      case 'V2V':
      case 'D2D':
      case 'S2S':
        Model = V2VSettingsModel;
        break;
      default: Model = C2CSettingsModel;
    }

    // Find settings: specific region first, then global
    const settings = await Model.findOne({
      $or: [
        { regionId: referral.regionId },
        { regionId: null }
      ]
    }).sort({ regionId: -1 }).session(session);

    if (!settings) {
      if (session) {
        try { await session.abortTransaction(); } catch (_) {}
        session.endSession();
      }
      return { success: false, message: `${referral.referralType} referral settings not found` };
    }

    // 2b. Check creditTime gate — only proceed if the current trigger matches the configured creditTime
    const configuredCreditTime = settings.referrerBonus?.creditTime;
    if (configuredCreditTime && configuredCreditTime !== triggerEvent) {
      // Map common aliases so 'subscription_purchase' matches 'subscription' etc.
      const triggerAliases = {
        'subscription_purchase': ['subscription', 'subscription_purchase', 'plan_purchase'],
        'appointment': ['appointment', 'booking'],
        'signup': ['signup', 'registration', 'on_signup'],
        'order': ['order', 'first_order'],
      };
      const allowed = triggerAliases[triggerEvent] || [triggerEvent];

      // Also handle time-based creditTime values (e.g. '7 days', '1 month', '2 weeks').
      // When an admin sets a duration like '7 days', it means "credit after X days from the
      // triggering event". For V2V/S2S/D2D referrals the triggering event is always a
      // subscription purchase, so we allow any subscription-type trigger to pass through.
      const isTimeBased = /\d+\s*(day|days|week|weeks|month|months|hour|hours)/i.test(
        configuredCreditTime || ''
      );
      const isSubscriptionEvent = [
        'subscription_purchase',
        'plan_purchase',
        'subscription',
      ].includes(triggerEvent);

      if (!allowed.includes(configuredCreditTime) && !(isTimeBased && isSubscriptionEvent)) {
        if (session) {
          try { await session.abortTransaction(); } catch (_) {}
          session.endSession();
        }
        console.log(`[Referral Bonus] Skipping: trigger '${triggerEvent}' does not match configured creditTime '${configuredCreditTime}'`);
        return { success: false, message: `Bonus trigger mismatch: expected '${configuredCreditTime}', got '${triggerEvent}'` };
      }

      if (isTimeBased && isSubscriptionEvent) {
        console.log(`[Referral Bonus] creditTime '${configuredCreditTime}' is a duration — proceeding immediately on subscription event '${triggerEvent}'`);
      }
    }

    // 3. Get referrer and referee models
    const getModel = (type) => {
      switch (type) {
        case 'Vendor': return VendorModel;
        case 'Doctor': return DoctorModel;
        case 'Supplier': return SupplierModel;
        default: return UserModel;
      }
    };

    const ReferrerModel = getModel(referral.referrerType || 'User');
    const RefereeModel = getModel(referral.refereeType || 'User');

    const referrerId = referral.referrer;
    const refereeId = referral.referee;

    let referrer = null;
    let referee = null;

    if (mongoose.Types.ObjectId.isValid(referrerId)) {
      referrer = await ReferrerModel.findById(referrerId).session(session);
    }

    if (mongoose.Types.ObjectId.isValid(refereeId)) {
      referee = await RefereeModel.findById(refereeId).session(session);
    }

    // If still null and professional, try other professional models (robustness)
    if (!referrer && mongoose.Types.ObjectId.isValid(referrerId) && ['Vendor', 'Doctor', 'Supplier'].includes(referral.referrerType)) {
      const others = [VendorModel, DoctorModel, SupplierModel].filter(m => m !== ReferrerModel);
      for (const M of others) {
        referrer = await M.findById(referrerId).session(session);
        if (referrer) break;
      }
    }

    if (!referee && mongoose.Types.ObjectId.isValid(refereeId) && ['Vendor', 'Doctor', 'Supplier'].includes(referral.refereeType)) {
      const others = [VendorModel, DoctorModel, SupplierModel].filter(m => m !== RefereeModel);
      for (const M of others) {
        referee = await M.findById(refereeId).session(session);
        if (referee) break;
      }
    }

    if (!referrer) {
      if (session) {
        try { await session.abortTransaction(); } catch (_) {}
        session.endSession();
      }
      return { success: false, message: `Referrer (${referral.referrerType}) not found` };
    }

    const referrerName = referrer?.businessName || referrer?.shopName || referrer?.name || `${referrer?.firstName || ''} ${referrer?.lastName || ''}`.trim() || 'Referrer';
    const refereeName = referee?.businessName || referee?.shopName || referee?.name || `${referee?.firstName || ''} ${referee?.lastName || ''}`.trim() || 'New User';

    // 4. Calculate amount from settings
    const bonusValue = settings.referrerBonus?.bonusValue || 0;
    const creditAmount = parseFloat(bonusValue);

    if (creditAmount > 0) {
      const balanceBefore = referrer.wallet || 0;
      const balanceAfter = balanceBefore + creditAmount;

      const txId = `WTX_REF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      await WalletTransactionModel.create([{
        userId: referrer._id,
        userType: referral.referrerType || 'User',
        transactionId: txId,
        transactionType: 'credit',
        amount: creditAmount,
        balanceBefore,
        balanceAfter,
        source: 'referral_bonus',
        status: 'completed',
        description: `Referral bonus for referring ${refereeName}`,
        metadata: {
          referralId: referral._id,
          referralCode: referral.referralId,
          refereeId: referral.referee,
          refereeType: referral.refereeType,
          triggerEvent
        }
      }], { session });

      // Use atomic update to avoid validation issues with old profiles
      await ReferrerModel.updateOne(
        { _id: referrer._id },
        {
          $inc: { wallet: creditAmount },
          $set: { updatedAt: new Date() }
        },
        { session }
      );

      console.log(`[Referral Bonus] Successfully credited ₹${creditAmount} to referrer: ${referrerName}`);
    }

    // 5. Credit referee bonus (if enabled in settings)
    const refereeBonusEnabled = settings.refereeBonus?.enabled;
    const refereeBonusValue = parseFloat(settings.refereeBonus?.bonusValue || 0);

    if (refereeBonusEnabled && refereeBonusValue > 0 && referee) {
      const ReeModel = getModel(referral.refereeType || 'User');
      const refereeBalanceBefore = referee.wallet || 0;
      const refereeBalanceAfter = refereeBalanceBefore + refereeBonusValue;

      const refereeTxId = `WTX_REFEEBONUS_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      await WalletTransactionModel.create([{
        userId: referee._id,
        userType: referral.refereeType || 'User',
        transactionId: refereeTxId,
        transactionType: 'credit',
        amount: refereeBonusValue,
        balanceBefore: refereeBalanceBefore,
        balanceAfter: refereeBalanceAfter,
        source: 'referral_bonus',
        status: 'completed',
        description: `Welcome bonus for joining via referral from ${referrerName}`,
        metadata: {
          referralId: referral._id,
          referralCode: referral.referralId,
          referrerId: referral.referrer,
          referrerType: referral.referrerType,
          triggerEvent,
          bonusType: 'referee_bonus'
        }
      }], { session });

      await ReeModel.updateOne(
        { _id: referee._id },
        {
          $inc: { wallet: refereeBonusValue },
          $set: { updatedAt: new Date() }
        },
        { session }
      );

      console.log(`[Referral Bonus] Successfully credited referee bonus ₹${refereeBonusValue} to referee: ${refereeName}`);
    } else if (refereeBonusEnabled && refereeBonusValue > 0 && !referee) {
      console.warn(`[Referral Bonus] Referee bonus enabled but referee record not found for referral ${referral.referralId}`);
    }

    // 6. Update referral status using atomic update (avoids .save() issues)
    await ReferralModel.updateOne(
      { _id: referral._id },
      {
        $set: {
          status: 'Completed',
          bonus: `₹${creditAmount}`,
          updatedAt: new Date()
        }
      },
      { session }
    );

    console.log(`[Referral Bonus] Referral ${referral.referralId} marked as Completed. Referrer bonus: ₹${creditAmount}`);

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return {
      success: true,
      message: 'Bonus credited successfully',
      referrerAmount: creditAmount,
      refereeAmount: (refereeBonusEnabled && refereeBonusValue > 0 && referee) ? refereeBonusValue : 0
    };

  } catch (error) {
    if (session) {
      try {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
      } catch (_) {}
      session.endSession();
    }

    // Check if error is related to replica sets or transaction support
    const isTxError = error.message?.includes('Transaction numbers') ||
                      error.message?.includes('replica set') ||
                      error.message?.includes('Replica Set') ||
                      error.message?.includes('sessions') ||
                      error.message?.includes('session');

    if (isTxError && useSession) {
      console.warn("[Referral Bonus] Transaction failed due to database configuration. Retrying without session/transaction...");
      return creditReferralBonus(referralData, triggerEvent, false);
    }

    console.error('[Referral Bonus] Error:', error);
    return { success: false, message: 'Server error', error: error.message };
  }
}

/**
 * Check if user's first booking/order is completed and credit referral bonus
 * @param {String} userId - ID of the referee
 * @param {String} eventType - Type of event ('appointment' or 'signup')
 * @returns {Object} - Result
 */
export async function checkAndCreditReferralBonus(userId, eventType = 'appointment') {
  try {
    console.log(`[Referral Bonus] Checking bonus for user: ${userId}, event: ${eventType}`);

    // Find a pending referral where this user is the referee
    // We search across all types (C2C, V2V, etc.)
    const referral = await ReferralModel.findOne({
      referee: userId.toString(),
      status: 'Pending'
    });

    if (!referral) {
      console.log(`[Referral Bonus] No pending referral found for referee: ${userId}`);
      return { success: false, message: 'No eligible referral record found' };
    }

    // Trigger the actual credit
    return await creditReferralBonus(referral._id, eventType);

  } catch (error) {
    console.error('[Referral Bonus] checkAndCreditReferralBonus error:', error);
    return { success: false, message: 'Error processing referral', error: error.message };
  }
}

/**
 * Check and credit referral bonus for subscription purchase/renewal/change.
 * Only credits on the FIRST paid plan activation (status must still be Pending).
 * @param {String} userId - ID of the referee (Vendor, Doctor, Supplier)
 * @param {Object} plan - The purchased plan object
 * @returns {Object} - Result
 */
export async function checkAndCreditSubscriptionReferral(userId, plan) {
  try {
    const userIdStr = userId?.toString();
    console.log(`[Referral Bonus] Subscription check triggered for user: ${userIdStr}, planType: ${plan?.planType}, price: ${plan?.price}`);

    // Only credit for regular (paid) plans: planType is 'regular' or price > 0
    const isRegularPlan = plan?.planType === 'regular' || (plan?.price !== undefined && plan?.price > 0);
    if (!isRegularPlan) {
      console.log(`[Referral Bonus] Skipping bonus for non-regular plan: ${plan?.planType || 'unknown'}`);
      return { success: false, message: 'Bonus not eligible for non-regular plans' };
    }

    // Find a pending V2V/S2S/D2D/C2V referral where this user is the referee
    // Use $or to match both string and ObjectId representations robustly
    const referral = await ReferralModel.findOne({
      $or: [
        { referee: userIdStr },
        { referee: new mongoose.Types.ObjectId(userIdStr) }
      ],
      status: 'Pending',
      referralType: { $in: ['V2V', 'S2S', 'D2D', 'C2V'] }
    });

    if (!referral) {
      console.log(`[Referral Bonus] No pending subscription-based referral record found for referee: ${userIdStr}`);
      return { success: false, message: 'No eligible referral record found' };
    }

    console.log(`[Referral Bonus] Found matching referral ${referral.referralId} for referee ${userIdStr}, starting credit process...`);

    // Pass the referral _id so creditReferralBonus fetches a fresh mongoose document
    const result = await creditReferralBonus(referral._id.toString(), 'subscription_purchase');
    console.log(`[Referral Bonus] Final result:`, result);
    return result;

  } catch (error) {
    console.error('[Referral Bonus] checkAndCreditSubscriptionReferral error:', error);
    return { success: false, message: 'Error processing subscription referral', error: error.message };
  }
}
