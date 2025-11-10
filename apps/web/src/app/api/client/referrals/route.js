import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import { verifyJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';
import UserModel from '@repo/lib/models/user/User.model';
import { ReferralModel } from '@repo/lib/models/admin/Reffer';

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
      referralType: 'C2C' // Client to Client referrals
    }).lean();

    // Get referee details for each referral
    const referralHistory = await Promise.all(
      referrals.map(async (referral) => {
        const referee = await UserModel.findById(referral.referee).select('firstName lastName').lean();
        return {
          id: referral._id,
          friend: referee ? `${referee.firstName} ${referee.lastName}` : 'Unknown',
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
        const bonusValue = parseFloat(r.bonus.replace('₹', '').replace(',', ''));
        return sum + (isNaN(bonusValue) ? 0 : bonusValue);
      }, 0);

    const successfulReferrals = referrals.filter(r => r.status === 'Completed' || r.status === 'Bonus Paid').length;
    const totalReferrals = referrals.length;

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
