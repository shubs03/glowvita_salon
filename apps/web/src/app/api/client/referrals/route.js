import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import UserModel from '@repo/lib/models/user/User.model';
import { ReferralModel } from '@repo/lib/models/admin/Reffer';
import { checkAndCreditReferralBonus } from '@repo/lib/utils/referralWalletCredit';

await _db();

// Helper function to get user ID from JWT token
const getUserId = async (req) => {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return null;
    }
    
    const payload = await verifyJwt(token);
    return payload?.userId;
  } catch (error) {
    return null;
  }
};

// Function to generate unique referral code
const generateReferralCode = async (firstName, lastName) => {
  // Generate base code with first 3 letters of first name and last name
  const baseCode = `${firstName.substring(0, 3)}${lastName.substring(0, 3)}`.toUpperCase();
  
  // Add random 3-digit number
  const randomNum = Math.floor(100 + Math.random() * 900); // Generates number between 100-999
  let referralCode = `${baseCode}${randomNum}`;
  
  // Check if code exists and generate unique one
  while (await UserModel.findOne({ refferalCode: referralCode })) {
    const newRandomNum = Math.floor(100 + Math.random() * 900);
    referralCode = `${baseCode}${newRandomNum}`;
  }
  
  return referralCode;
};

// GET: Fetch user's referral data (referral code, stats, history)
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    // Get user details
    let user = await UserModel.findById(userId).select('refferalCode firstName lastName');
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Generate referral code if user doesn't have one
    if (!user.refferalCode) {
      try {
        const newReferralCode = await generateReferralCode(user.firstName, user.lastName);
        user.refferalCode = newReferralCode;
        await user.save();
        console.log(`Generated referral code ${newReferralCode} for user ${userId}`);
      } catch (error) {
        console.error('Error generating referral code:', error);
        // Continue without referral code if generation fails
      }
    }

    // Get referrals where this user is the referrer
    const referrals = await ReferralModel.find({ 
      referrer: userId,
      referralType: { $in: ['C2C', 'C2V'] } 
    }).lean();

    // Get referee details for each referral
    const referralHistory = await Promise.all(
      referrals.map(async (referral) => {
        let friendName = 'Unknown';
        
        if (referral.referralType === 'C2C') {
          const referee = await UserModel.findById(referral.referee).select('firstName lastName').lean();
          friendName = referee ? `${referee.firstName} ${referee.lastName}` : 'Unknown User';
        } else if (referral.referralType === 'C2V') {
          // Import Vendor model if needed (might be already imported or via @repo/lib)
          const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
          const referee = await VendorModel.findById(referral.referee).select('businessName firstName lastName').lean();
          friendName = referee ? (referee.businessName || `${referee.firstName} ${referee.lastName}`) : 'Unknown Partner';
        }

        return {
          id: referral._id,
          friend: friendName,
          type: referral.referralType === 'C2C' ? 'Client' : 'Partner',
          date: referral.date || referral.createdAt,
          status: referral.status,
          reward: referral.bonus
        };
      })
    );

    // Calculate stats
    const totalEarnings = referrals
      .filter(r => r.status === 'Completed' || r.status === 'Bonus Paid')
      .reduce((sum, r) => {
        // Handle both numeric and string bonuses (e.g., "₹100")
        const bonusValue = typeof r.bonus === 'string' 
          ? parseFloat(r.bonus.replace(/[^\d.]/g, '')) 
          : Number(r.bonus);
        return sum + (isNaN(bonusValue) ? 0 : bonusValue);
      }, 0);

    const successfulReferrals = referrals.filter(r => r.status === 'Completed' || r.status === 'Bonus Paid').length;
    const totalReferrals = referrals.length;

    // Fetch referral settings based on user region
    const { C2CSettingsModel, C2VSettingsModel } = await import('@repo/lib/models/admin/Reffer');
    
    const c2cSettings = await C2CSettingsModel.findOne({
      $or: [{ regionId: user.regionId }, { regionId: null }],
      status: 'Active'
    }).sort({ regionId: -1 });

    const c2vSettings = await C2VSettingsModel.findOne({
      $or: [{ regionId: user.regionId }, { regionId: null }],
      status: 'Active'
    }).sort({ regionId: -1 });

    return NextResponse.json({ 
      success: true, 
      data: {
        referralCode: user.refferalCode || 'NOTAVAILABLE',
        userName: `${user.firstName} ${user.lastName}`,
        stats: {
          totalEarnings,
          successfulReferrals,
          totalReferrals
        },
        settings: {
          c2c: c2cSettings ? {
            referrerBonus: c2cSettings.referrerBonus.bonusValue,
            refereeBonus: c2cSettings.refereeBonus?.enabled ? c2cSettings.refereeBonus.bonusValue : 0
          } : null,
          c2v: c2vSettings ? {
            referrerBonus: c2vSettings.referrerBonus.bonusValue,
            refereeBonus: c2vSettings.refereeBonus?.enabled ? c2vSettings.refereeBonus.bonusValue : 0
          } : null
        },
        referralHistory: referralHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch referrals', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST: Manual claim is disabled since C2C referral bonuses are credited automatically on appointment completion.
export async function POST(req) {
  return NextResponse.json({ 
    success: false, 
    message: 'Manual claiming is disabled. Referral bonuses are credited automatically upon appointment completion.' 
  }, { status: 405 });
}
