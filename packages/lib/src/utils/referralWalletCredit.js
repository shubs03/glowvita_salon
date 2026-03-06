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
 * @param {String} triggerEvent - What triggered the bonus (signup, appointment, order)
 * @returns {Object} - Result of the operation
 */
export async function creditReferralBonus(referralData, triggerEvent = 'appointment') {
  // Use a transaction if available but don't strictly require it for dev environments without replica sets
  let session = null;
  try {
    session = await mongoose.startSession();
  } catch (e) {
    console.log("[Referral Bonus] Transactions not supported, proceeding without session");
  }

  if (session) session.startTransaction();

  try {
    // 1. Get referral record
    let referral;
    if (typeof referralData === 'string' || referralData instanceof mongoose.Types.ObjectId) {
        referral = await ReferralModel.findById(referralData).session(session);
    } else {
        referral = referralData;
    }

    if (!referral) {
        await session.abortTransaction();
        return { success: false, message: 'Referral record not found' };
    }

    console.log(`[Referral Bonus] Processing bonus for ${referral.referralId} (${referral.referralType})`);

    if (referral.status === 'Bonus Paid') {
      await session.abortTransaction();
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
      await session.abortTransaction();
      return { success: false, message: `${referral.referralType} referral settings not found` };
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
      await session.abortTransaction();
      return { success: false, message: `Referrer (${referral.referrerType}) not found` };
    }

    const referrerName = referrer?.businessName || referrer?.shopName || referrer?.name || `${referrer?.firstName || ''} ${referrer?.lastName || ''}`.trim() || referral.referrer || 'Referrer';
    const refereeName = referee?.businessName || referee?.shopName || referee?.name || `${referee?.firstName || ''} ${referee?.lastName || ''}`.trim() || referral.referee || 'New User';

    // 4. Calculate amount
    // Use settings value as source of truth
    const bonusValue = settings.referrerBonus?.bonusValue || 0;
    const bonusType = settings.referrerBonus?.bonusType || 'amount';
    
    // For now, only 'amount' is supported for direct wallet credit
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
      
      console.log(`[Referral Bonus] Successfully credited ₹${creditAmount} to ${referrerName}`);
    }

    // 5. Update referral status
    referral.status = 'Bonus Paid';
    referral.bonus = `₹${creditAmount}`;
    await referral.save({ session });

    if (session) {
        await session.commitTransaction();
        session.endSession();
    }

    return { success: true, message: 'Bonus credited successfully', amount: creditAmount };

  } catch (error) {
    if (session && session.inTransaction()) await session.abortTransaction();
    if (session) session.endSession();
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
      status: { $in: ['Pending', 'Completed'] }
    });

    if (!referral) {
      console.log(`[Referral Bonus] No pending/completed C2C referral found for referee: ${userId}`);
      return { success: false, message: 'No eligible referral record found' };
    }

    // Trigger the actual credit
    return await creditReferralBonus(referral, eventType);

  } catch (error) {
    console.error('[Referral Bonus] checkAndCreditReferralBonus error:', error);
    return { success: false, message: 'Error processing referral', error: error.message };
  }
}

/**
 * Check and credit referral bonus for subscription purchase
 * @param {String} userId - ID of the referee (Vendor, Doctor, Supplier)
 * @param {Object} plan - The purchased plan object
 * @returns {Object} - Result
 */
export async function checkAndCreditSubscriptionReferral(userId, plan) {
  try {
    console.log(`[Referral Bonus] Subscription check triggered for user: ${userId}, planType: ${plan.planType}, price: ${plan.price}`);

    // Only credit for regular (paid) plans
    if (plan.planType !== 'regular') {
      console.log(`[Referral Bonus] Skipping bonus for non-regular plan: ${plan.planType}`);
      return { success: false, message: 'Bonus not eligible for non-regular plans' };
    }

    // Find a pending referral where this user is the referee
    const referral = await ReferralModel.findOne({
      referee: userId.toString(),
      status: 'Pending',
      referralType: { $in: ['V2V', 'S2S', 'D2D', 'C2V'] }
    });

    if (!referral) {
      console.log(`[Referral Bonus] No pending subscription-based referral record found for referee: ${userId}`);
      return { success: false, message: 'No eligible referral record found' };
    }

    console.log(`[Referral Bonus] Found matching referral ${referral.referralId}, starting credit process...`);
    
    // Trigger the actual credit
    const result = await creditReferralBonus(referral, 'subscription_purchase');
    console.log(`[Referral Bonus] Final result:`, result);
    return result;

  } catch (error) {
    console.error('[Referral Bonus] checkAndCreditSubscriptionReferral error:', error);
    return { success: false, message: 'Error processing subscription referral', error: error.message };
  }
}


