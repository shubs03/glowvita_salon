import mongoose from 'mongoose';
import WalletTransactionModel from '../models/Payment/WalletTransaction.model.js';
import WalletSettingsModel from '../models/admin/WalletSettings.model.js';
import UserModel from '../models/user/User.model.js';
import { ReferralModel, C2CSettingsModel } from '../models/admin/Reffer.model.js';

/**
 * Credit referral bonus to user's wallet
 * @param {String} referrerId - ID of the referrer (who will receive bonus)
 * @param {String} refereeId - ID of the referee (new user)
 * @param {String} referralId - ID of the referral record
 * @param {String} triggerEvent - What triggered the bonus (signup, first_booking, first_order)
 * @returns {Object} - Result of the operation
 */
export async function creditReferralBonus(referrerId, refereeId, referralId, triggerEvent = 'first_booking') {
  console.log(`[Referral Bonus] Starting creditReferralBonus - referrer: ${referrerId}, referee: ${refereeId}, referral: ${referralId}`);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get C2C referral settings
    const settings = await C2CSettingsModel.findOne().session(session);

    if (!settings) {
      await session.abortTransaction();
      console.error('[Referral Bonus] C2C referral settings not found');
      // Debug: list all settings
      const allSettings = await C2CSettingsModel.find({});
      console.log(`[Referral Bonus] Debug: Total settings docs found: ${allSettings.length}`);
      return { success: false, message: 'Referral settings not configured' };
    }

    console.log(`[Referral Bonus] C2C Settings found - Referrer bonus: ${settings.referrerBonus?.bonusValue}, Referee bonus enabled: ${settings.refereeBonus?.enabled}`);

    // 2. Get referral record
    const referral = await ReferralModel.findById(referralId).session(session);

    if (!referral) {
      await session.abortTransaction();
      console.log(`[Referral Bonus] Referral record not found inside transaction with ID: ${referralId}`);
      // Debug: Check if it exists outside transaction
      try {
        const testRef = await ReferralModel.findById(referralId);
        console.log(`[Referral Bonus] Debug: Referral exists outside transaction? ${!!testRef}`);
      } catch (e) { console.error(e); }
      return { success: false, message: 'Referral record not found' };
    }

    console.log(`[Referral Bonus] Found referral in transaction: ${referral._id}, status: ${referral.status}`);

    // Check if bonus already paid
    if (referral.status === 'Bonus Paid') {
      await session.abortTransaction();
      console.log(`[Referral Bonus] Bonus already paid for referral ${referralId}`);
      return { success: false, message: 'Bonus already paid for this referral' };
    }

    // Allow processing if status is 'Pending' or 'Completed'
    if (!['Pending', 'Completed'].includes(referral.status)) {
      await session.abortTransaction();
      console.log(`[Referral Bonus] Invalid referral status: ${referral.status}`);
      return { success: false, message: `Invalid referral status: ${referral.status}` };
    }

    // 3. Get referrer and referee details
    console.log(`[Referral Bonus] Fetching users - referrerId: ${referrerId}, refereeId: ${refereeId}`);
    const [referrer, referee] = await Promise.all([
      UserModel.findById(referrerId).session(session),
      UserModel.findById(refereeId).session(session)
    ]);

    if (!referrer) {
      await session.abortTransaction();
      console.log(`[Referral Bonus] Referrer not found: ${referrerId}`);
      return { success: false, message: 'Referrer not found' };
    }

    if (!referee) {
      await session.abortTransaction();
      console.log(`[Referral Bonus] Referee not found: ${refereeId}`);
      return { success: false, message: 'Referee not found' };
    }

    console.log(`[Referral Bonus] Found users - referrer: ${referrer._id}, referee: ${referee._id}`);

    const results = {
      referrerCredited: false,
      refereeCredited: false,
      referrerAmount: 0,
      refereeAmount: 0
    };

    // 4. Credit referrer's wallet
    const referrerBonusAmount = parseFloat(settings.referrerBonus.bonusValue) || 0;
    console.log(`[Referral Bonus] Referrer bonus amount: ${referrerBonusAmount}, Referrer current wallet: ${referrer.wallet}`);

    if (referrerBonusAmount > 0) {
      const newReferrerBalance = (referrer.wallet || 0) + referrerBonusAmount;
      console.log(`[Referral Bonus] Crediting referrer ${referrerId}: ${referrer.wallet} -> ${newReferrerBalance}`);

      // Generate transaction ID
      const referrerTxId = `WTX_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      // Create wallet transaction for referrer
      const referrerTransaction = await WalletTransactionModel.create([{
        userId: referrer._id,
        transactionId: referrerTxId,
        transactionType: 'credit',
        amount: referrerBonusAmount,
        balanceBefore: referrer.wallet || 0,
        balanceAfter: newReferrerBalance,
        source: 'referral_bonus',
        status: 'completed',
        description: `Referral bonus for referring ${referee.firstName} ${referee.lastName}`,
        metadata: {
          referralId: referral._id.toString(),
          refereeId: referee._id.toString(),
          refereeName: `${referee.firstName} ${referee.lastName}`,
          triggerEvent,
          bonusType: settings.referrerBonus.bonusType
        }
      }], { session });

      console.log(`[Referral Bonus] Created wallet transaction: ${referrerTxId}`);

      // Update referrer's wallet balance
      referrer.wallet = newReferrerBalance;
      await referrer.save({ session });

      results.referrerCredited = true;
      results.referrerAmount = referrerBonusAmount;

      console.log(`[Referral Bonus] Referrer wallet updated: User ${referrerId}, New Balance: ₹${referrer.wallet}`);
    } else {
      console.log(`[Referral Bonus] Skipping referrer credit - bonus amount is 0 or invalid`);
    }

    // 5. Credit referee's wallet (if enabled)
    console.log(`[Referral Bonus] Referee bonus enabled: ${settings.refereeBonus?.enabled}`);
    if (settings.refereeBonus?.enabled) {
      const refereeBonusAmount = parseFloat(settings.refereeBonus.bonusValue) || 0;
      console.log(`[Referral Bonus] Referee bonus amount: ${refereeBonusAmount}, Referee current wallet: ${referee.wallet}`);

      if (refereeBonusAmount > 0) {
        const newRefereeBalance = (referee.wallet || 0) + refereeBonusAmount;
        console.log(`[Referral Bonus] Crediting referee ${refereeId}: ${referee.wallet} -> ${newRefereeBalance}`);

        // Generate transaction ID
        const refereeTxId = `WTX_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // Create wallet transaction for referee
        const refereeTransaction = await WalletTransactionModel.create([{
          userId: referee._id,
          transactionId: refereeTxId,
          transactionType: 'credit',
          amount: refereeBonusAmount,
          balanceBefore: referee.wallet || 0,
          balanceAfter: newRefereeBalance,
          source: 'referral_bonus',
          status: 'completed',
          description: `Welcome bonus for joining via referral`,
          metadata: {
            referralId: referral._id.toString(),
            referrerId: referrer._id.toString(),
            referrerName: `${referrer.firstName} ${referee.lastName}`,
            triggerEvent,
            bonusType: settings.refereeBonus.bonusType
          }
        }], { session });

        console.log(`[Referral Bonus] Created wallet transaction for referee: ${refereeTxId}`);

        // Update referee's wallet balance
        referee.wallet = newRefereeBalance;
        await referee.save({ session });

        results.refereeCredited = true;
        results.refereeAmount = refereeBonusAmount;

        console.log(`[Referral Bonus] Referee wallet updated: User ${refereeId}, New Balance: ₹${referee.wallet}`);
      } else {
        console.log(`[Referral Bonus] Skipping referee credit - bonus amount is 0 or invalid`);
      }
    } else {
      console.log(`[Referral Bonus] Referee bonus is not enabled in settings`);
    }

    // 6. Update referral status to 'Bonus Paid'
    referral.status = 'Bonus Paid';
    referral.bonus = `₹${referrerBonusAmount}`;
    await referral.save({ session });
    console.log(`[Referral Bonus] Updated referral ${referralId} status to 'Bonus Paid'`);

    // Commit transaction
    await session.commitTransaction();
    console.log(`[Referral Bonus] Transaction committed successfully for referral ${referralId}`);

    return {
      success: true,
      message: 'Referral bonus credited successfully',
      data: results
    };

  } catch (error) {
    await session.abortTransaction();
    console.error('[Referral Bonus] Error crediting referral bonus:', error);
    return {
      success: false,
      message: 'Failed to credit referral bonus',
      error: error.message
    };
  } finally {
    session.endSession();
  }
}

/**
 * Check if user's first booking/order is completed and credit referral bonus
 * @param {String} userId - ID of the user who made the booking/order
 * @param {String} eventType - Type of event ('booking' or 'order')
 * @returns {Object} - Result of the operation
 */
export async function checkAndCreditReferralBonus(userId, eventType = 'booking') {
  try {
    console.log(`[Referral Bonus] ===== STARTING CHECK AND CREDIT FLOW =====`);
    console.log(`[Referral Bonus] Input userId: ${userId}, eventType: ${eventType}`);

    // Find if this user was referred by someone
    const user = await UserModel.findById(userId);

    if (!user || !user.referredBy) {
      console.log(`[Referral Bonus] User ${userId} was not referred by anyone`);
      return { success: false, message: 'User not referred by anyone' };
    }

    console.log(`[Referral Bonus] User ${userId} was referred by: ${user.referredBy}`);

    // Find the referral record - also check for 'Bonus Paid' to avoid double crediting
    // Note: referrer and referee are stored as STRINGS in the Referral model
    const userIdString = userId.toString();
    console.log(`[Referral Bonus] Searching for referral with referee (string): ${userIdString}, type: C2C`);

    // Try finding with string comparison (referrer/referee are stored as strings)
    let referral = await ReferralModel.findOne({
      referee: userIdString,
      referralType: 'C2C',
      status: { $in: ['Pending', 'Completed'] }
    });

    console.log(`[Referral Bonus] Referral found with status filter:`, referral ? { id: referral._id, status: referral.status, referee: referral.referee } : 'None');

    // Debugging: Log what we are looking for vs what might be there
    if (!referral) {
      console.log(`[Referral Bonus] DEBUG SEARCH: Looking for referee "${userIdString}" (Type: ${typeof userIdString})`);
      const allRefs = await ReferralModel.find({ referee: userIdString }).select('status referralType referee');
      console.log(`[Referral Bonus] DEBUG SEARCH: Found ${allRefs.length} referrals for this user ignoring status/type:`, allRefs);
    }

    // Also check if referral exists with any status for debugging
    const anyReferral = await ReferralModel.findOne({
      referee: userIdString,
      referralType: 'C2C'
    });
    console.log(`[Referral Bonus] Any referral found for user ${userIdString}:`, anyReferral ? { id: anyReferral._id, status: anyReferral.status, referee: anyReferral.referee, referrer: anyReferral.referrer } : 'None');

    // If no referral found with status filter, try with ObjectId format (in case of data inconsistency)
    if (!referral && anyReferral) {
      console.log(`[Referral Bonus] Found referral but status was not in ['Pending', 'Completed']: ${anyReferral.status}`);
      if (anyReferral.status === 'Bonus Paid') {
        console.log(`[Referral Bonus] Referral already paid, returning early`);
        return { success: false, message: 'Bonus already paid' };
      }
      // If status is 'Pending' or 'Completed', use the anyReferral
      if (anyReferral.status === 'Pending' || anyReferral.status === 'Completed') {
        referral = anyReferral;
        console.log(`[Referral Bonus] Using referral from any status query`);
      }
    }

    // If still no referral found, try with ObjectId format
    if (!referral && !anyReferral) {
      console.log(`[Referral Bonus] Trying alternative lookup methods for user ${userIdString}`);

      // Try finding with the raw userId (in case it's stored differently)
      referral = await ReferralModel.findOne({
        referee: userId,
        referralType: 'C2C',
        status: { $in: ['Pending', 'Completed'] }
      });

      if (referral) {
        console.log(`[Referral Bonus] Found referral using raw userId: ${referral._id}`);
      }
    }

    if (!referral) {
      console.log(`[Referral Bonus] No eligible referral record found for user ${userId}`);
      return { success: false, message: 'Referral record not found or bonus already paid' };
    }

    console.log(`[Referral Bonus] ===== FOUND REFERRAL RECORD =====`);
    console.log(`[Referral Bonus] Referral ID: ${referral._id}`);
    console.log(`[Referral Bonus] Referral Type: ${referral.referralType}`);
    console.log(`[Referral Bonus] Referral Status: ${referral.status}`);
    console.log(`[Referral Bonus] Referrer: ${referral.referrer}`);
    console.log(`[Referral Bonus] Referee: ${referral.referee}`);
    console.log(`[Referral Bonus] User referredBy: ${user.referredBy.toString()}`);

    // Check if bonus already paid
    if (referral.status === 'Bonus Paid') {
      console.log(`[Referral Bonus] Bonus already paid for referral ${referral._id}`);
      return { success: false, message: 'Bonus already paid' };
    }

    // For the direct flow, immediately credit the bonus and update status to Bonus Paid
    console.log(`[Referral Bonus] ===== CALLING CREDIT FUNCTION =====`);
    console.log(`[Referral Bonus] Calling creditReferralBonus for referral ${referral._id}`);
    console.log(`[Referral Bonus] referrerId: ${user.referredBy.toString()}, refereeId: ${userId}, triggerEvent: ${eventType}`);

    const result = await creditReferralBonus(
      user.referredBy.toString(),
      userId,
      referral._id.toString(),
      eventType
    );

    console.log(`[Referral Bonus] ===== CREDIT RESULT =====`);
    console.log(`[Referral Bonus] creditReferralBonus result:`, result);

    if (result.success) {
      // Verify the referral status was updated
      const updatedReferral = await ReferralModel.findById(referral._id);
      console.log(`[Referral Bonus] After credit, referral status is: ${updatedReferral.status}`);

      if (updatedReferral.status === 'Bonus Paid') {
        console.log(`[Referral Bonus] ✅ SUCCESS: Referral status updated to Bonus Paid`);
      } else {
        console.warn(`[Referral Bonus] ⚠️ WARNING: Expected status 'Bonus Paid' but got '${updatedReferral.status}'`);
      }
    }

    console.log(`[Referral Bonus] ===== ENDING CHECK AND CREDIT FLOW =====`);
    return result;

  } catch (error) {
    console.error('[Referral Bonus] Error checking and crediting referral bonus:', error);
    return {
      success: false,
      message: 'Failed to process referral bonus',
      error: error.message
    };
  }
}


