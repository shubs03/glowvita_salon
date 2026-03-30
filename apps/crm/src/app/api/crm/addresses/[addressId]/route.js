import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// DELETE - Remove a specific saved address
export const DELETE = authMiddlewareCrm(async (req, { params }) => {
  try {
    const vendorId = req.user.userId;
    const { addressId } = params;

    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
    }

    vendor.savedAddresses = (vendor.savedAddresses || []).filter(
      (addr) => addr._id.toString() !== addressId
    );

    await vendor.save();

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
      savedAddresses: vendor.savedAddresses
    });
  } catch (error) {
    console.error('Error deleting CRM address:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}, ['vendor']);

// PUT - Update a specific saved address
export const PUT = authMiddlewareCrm(async (req, { params }) => {
  try {
    const vendorId = req.user.userId;
    const { addressId } = params;
    const body = await req.json();
    const { fullName, mobileNo, address, city, state, pincode, landmark, lat, lng, isPrimary } = body;

    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
    }

    const addressIndex = vendor.savedAddresses?.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1 || addressIndex === undefined) {
      return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });
    }

    if (isPrimary) {
      vendor.savedAddresses = (vendor.savedAddresses || []).map((saved, idx) => ({
        ...saved.toObject(),
        isPrimary: idx === addressIndex
      }));
    }

    const currentAddr = vendor.savedAddresses[addressIndex].toObject();
    const updatedAddr = {
      ...currentAddr,
      fullName: fullName || currentAddr.fullName,
      mobileNo: mobileNo || currentAddr.mobileNo,
      address: address || currentAddr.address,
      city: city || currentAddr.city,
      state: state || currentAddr.state,
      pincode: pincode || currentAddr.pincode,
      landmark: landmark || currentAddr.landmark,
      location: (lat !== undefined && lng !== undefined) ? { lat: Number(lat), lng: Number(lng) } : currentAddr.location,
      isPrimary: isPrimary ?? currentAddr.isPrimary,
      updatedAt: new Date()
    };

    vendor.savedAddresses[addressIndex] = updatedAddr;
    await vendor.save();

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      savedAddresses: vendor.savedAddresses
    });
  } catch (error) {
    console.error('Error updating CRM address:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}, ['vendor']);
