import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';
import SmsService from '../../../../../../../packages/lib/src/services/SmsService.js';

/**
 * GET /api/crm/sms-balance
 * Returns the current SMS balance and provider for the authenticated vendor or supplier.
 */
export const GET = authMiddlewareCrm(async (req) => {
  try {
    await _db();

    const userId = req.user?.userId;
    const userType =
      req.user?.userType || (req.user?.role === 'supplier' ? 'supplier' : 'vendor');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    let smsBalance = 0;

    if (userType === 'supplier') {
      const supplier = await SupplierModel.findById(userId).select('smsBalance');
      smsBalance = supplier?.smsBalance ?? 0;
    } else {
      const vendor = await VendorModel.findById(userId).select('smsBalance');
      smsBalance = vendor?.smsBalance ?? 0;
    }

    return NextResponse.json(
      { success: true, data: { smsBalance, provider: SmsService.provider } },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/crm/sms-balance:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching SMS balance' },
      { status: 500 }
    );
  }
}, ['vendor', 'supplier']);
