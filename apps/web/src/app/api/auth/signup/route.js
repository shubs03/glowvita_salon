import { NextResponse } from 'next/server';
import dbConnect from '@repo/lib/db';
import User from '@repo/lib/models/user';
import { hashPassword, createJwt } from '@repo/lib/auth';
import { cookies } from 'next/headers';

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

    // Prepare user data
    const userData = {
      firstName,
      lastName,
      emailAddress: email, // Map email to emailAddress
      mobileNo,
      state,
      city,
      pincode,
      refferalCode: referralCode || undefined, // Handle empty string as undefined
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
    if (referralCode) {
      try {
        const referringUser = await User.findOne({ refferalCode: referralCode });
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