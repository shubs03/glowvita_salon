import { NextResponse } from 'next/server';
import dbConnect from '@repo/lib/db';
import User from '@repo/lib/models/user';
import { createJwt } from '@repo/lib/auth';
import { hashPassword } from '@repo/lib/hashing';
import { cookies } from 'next/headers';
import { ReferralModel, C2CSettingsModel } from '@repo/lib/models/admin/Reffer';

// Function to generate unique referral code
const generateReferralCode = async (firstName, lastName) => {
  // Generate base code with first 3 letters of first name and last name
  const baseCode = `${firstName.substring(0, 3)}${lastName.substring(0, 3)}`.toUpperCase();

  // Add random 3-digit number
  const randomNum = Math.floor(100 + Math.random() * 900); // Generates number between 100-999
  let referralCode = `${baseCode}${randomNum}`;

  // Check if code exists and generate unique one
  while (await User.findOne({ refferalCode: referralCode })) {
    const newRandomNum = Math.floor(100 + Math.random() * 900);
    referralCode = `${baseCode}${newRandomNum}`;
  }

  return referralCode;
};

export async function POST(req) {
  try {
    await dbConnect();
  } catch (dbError) {
    console.error('Database connection error:', dbError);
    return NextResponse.json({ message: 'Service unavailable. Please try again later.' }, { status: 503 });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ message: 'Invalid request format. Please check your input.' }, { status: 400 });
    }

    const { firstName, lastName, email, mobileNo, location, state, city, pincode, referralCode, password } = body;

    // Required fields validation (referralCode is optional)
    if (!firstName || !lastName || !email || !mobileNo || !state || !city || !pincode || !password) {
      return NextResponse.json({ message: 'All required fields must be filled' }, { status: 400 });
    }

    // Check for existing user with same email
    try {
      const existingUserByEmail = await User.findOne({ emailAddress: email });
      if (existingUserByEmail) {
        return NextResponse.json({ message: 'User already registered with this email address' }, { status: 409 });
      }
    } catch (dbError) {
      console.error('Database error checking email:', dbError);
      return NextResponse.json({ message: 'Service unavailable. Please try again later.' }, { status: 503 });
    }

    // Check for existing user with same mobile number
    try {
      const existingUserByMobile = await User.findOne({ mobileNo });
      if (existingUserByMobile) {
        return NextResponse.json({ message: 'User already registered with this mobile number' }, { status: 409 });
      }
    } catch (dbError) {
      console.error('Database error checking mobile:', dbError);
      return NextResponse.json({ message: 'Service unavailable. Please try again later.' }, { status: 503 });
    }

    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return NextResponse.json({ message: 'Service unavailable. Please try again later.' }, { status: 503 });
    }

    // Generate unique referral code for the new user
    const newUserReferralCode = await generateReferralCode(firstName, lastName);

    // Prepare user data
    const userData = {
      firstName,
      lastName,
      emailAddress: email, // Map email to emailAddress
      mobileNo,
      state,
      city,
      pincode,
      refferalCode: newUserReferralCode, // Assign generated referral code
      password: hashedPassword,
      role: 'USER', // Default role for web signup
    };

    // Add location if provided
    if (location) {
      try {
        // If location is already an object, use it directly
        if (typeof location === 'object' && location.lat !== undefined && location.lng !== undefined) {
          userData.location = {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lng)
          };
        }
        // If location is a string, try to parse it
        else if (typeof location === 'string') {
          const parsedLocation = JSON.parse(location);
          if (parsedLocation.lat !== undefined && parsedLocation.lng !== undefined) {
            userData.location = {
              lat: parseFloat(parsedLocation.lat),
              lng: parseFloat(parsedLocation.lng)
            };
          }
        }
      } catch (parseError) {
        console.error('Error parsing location:', parseError);
        // Don't fail the request if location parsing fails, just skip it
      }
    }

    // Handle referral code - check if it refers to an existing user
    let referringUser = null;
    if (referralCode) {
      try {
        referringUser = await User.findOne({ refferalCode: referralCode });
        if (referringUser) {
          userData.referredBy = referringUser._id;
        }
      } catch (dbError) {
        console.error('Database error checking referral code:', dbError);
        // Continue without referral code if there's a database error
      }
    }

    let user;
    try {
      user = new User(userData);
      await user.save();
    } catch (saveError) {
      console.error('User save error:', saveError);

      // Handle MongoDB duplicate key errors
      if (saveError.code === 11000) {
        const errorMessage = saveError.message;
        if (errorMessage.includes('emailAddress')) {
          return NextResponse.json({ message: 'User already registered with this email address' }, { status: 409 });
        } else if (errorMessage.includes('mobileNo')) {
          return NextResponse.json({ message: 'User already registered with this mobile number' }, { status: 409 });
        } else {
          return NextResponse.json({
            message: 'User already registered with this information'
          }, { status: 409 });
        }
      }

      return NextResponse.json({
        message: 'Internal server error. Please try again later.'
      }, { status: 500 });
    }

    // Create referral entry if user was referred by someone
    if (referringUser && referralCode) {
      try {
        // Get C2C settings to determine bonus amount
        const c2cSettings = await C2CSettingsModel.findOne();
        const bonusAmount = c2cSettings?.referrerBonus?.bonusValue || 100;
        const bonusType = c2cSettings?.referrerBonus?.bonusType || 'amount';
        const bonusString = bonusType === 'amount' ? `₹${bonusAmount}` : `${bonusAmount}%`;

        // Generate unique referral ID
        const referralId = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Create referral record
        await ReferralModel.create({
          referralType: 'C2C',
          referralId: referralId,
          referrer: referringUser._id.toString(),
          referee: user._id.toString(),
          date: new Date(),
          status: 'Pending',
          bonus: bonusString,
        });

        console.log('Referral entry created successfully');
      } catch (referralError) {
        console.error('Error creating referral entry:', referralError);
        // Don't fail the signup if referral creation fails
      }
    }

    let token;
    try {
      token = await createJwt({ userId: user._id.toString(), role: user.role, email: user.emailAddress });
    } catch (tokenError) {
      console.error('Token creation error:', tokenError);
      // Still return success since user was created, just without token
      return NextResponse.json({
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          location: user.location
        }
      }, { status: 201 });
    }

    try {
      cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
    } catch (cookieError) {
      console.error('Cookie setting error:', cookieError);
      // Continue without setting cookie
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Unhandled signup error:', error);

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const errorMessage = error.message;
      if (errorMessage.includes('emailAddress')) {
        return NextResponse.json({ message: 'User already registered with this email address' }, { status: 409 });
      } else if (errorMessage.includes('mobileNo')) {
        return NextResponse.json({ message: 'User already registered with this mobile number' }, { status: 409 });
      } else {
        return NextResponse.json({
          message: 'User already registered with this information'
        }, { status: 409 });
      }
    }

    return NextResponse.json({
      message: 'Internal server error. Please try again later.'
    }, { status: 500 });
  }
}