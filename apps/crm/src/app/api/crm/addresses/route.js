import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch vendor's saved addresses
export const GET = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId;
    const vendor = await VendorModel.findById(vendorId).select('savedAddresses address city state pincode landmark location');
    
    if (!vendor) {
      return NextResponse.json({
        success: false,
        message: 'Vendor not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      address: vendor.address || null,
      city: vendor.city || null,
      state: vendor.state || null,
      pincode: vendor.pincode || null,
      landmark: vendor.landmark || null,
      coordinates: vendor.location || null,
      savedAddresses: vendor.savedAddresses || []
    });
  } catch (error) {
    console.error('Error fetching CRM addresses:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}, ['vendor']);

// POST - Add new address to vendor's saved addresses
export const POST = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId;
    const body = await req.json();
    const { fullName, mobileNo, address, city, state, pincode, landmark, lat, lng, label, isPrimary } = body;

    // Validate required fields
    if (!city || !state || !pincode || !fullName || !mobileNo) {
      return NextResponse.json(
        { success: false, message: 'Missing required address fields' },
        { status: 400 }
      );
    }

    const newAddress = {
      fullName,
      mobileNo,
      address: address || '',
      city,
      state,
      pincode,
      landmark: landmark || '',
      location: { lat: Number(lat || 0), lng: Number(lng || 0) },
      label: label || 'Home',
      isPrimary: isPrimary || false,
      createdAt: new Date()
    };

    const vendor = await VendorModel.findById(vendorId);

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: 'Vendor not found' },
        { status: 404 }
      );
    }

    if (isPrimary) {
      vendor.savedAddresses = (vendor.savedAddresses || []).map((saved) => ({
        ...saved.toObject(),
        isPrimary: false
      }));
    }

    vendor.savedAddresses.push(newAddress);
    await vendor.save();

    return NextResponse.json({
      success: true,
      message: 'Address added successfully',
      savedAddresses: vendor.savedAddresses
    });
  } catch (error) {
    console.error('Error adding CRM address:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}, ['vendor']);
