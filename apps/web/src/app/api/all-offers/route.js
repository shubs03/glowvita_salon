import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import AdminOfferModel from '@repo/lib/models/admin/AdminOffers.model.js';
import CRMOfferModel from '@repo/lib/models/Vendor/CRMOffer.model.js';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model.js';
import connectDB from '@repo/lib/db';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId'); // Optional vendor ID filter
    let regionId = searchParams.get('regionId'); // Region ID filter

    // Normalize regionId (handle 'undefined' or 'null' strings from frontend)
    if (regionId === 'undefined' || regionId === 'null') {
      regionId = null;
    }

    // If regionId not provided but vendorId is, derive regionId from vendor
    if (!regionId && vendorId) {
      try {
        const vendor = await VendorModel.findById(vendorId).select('regionId').lean();
        if (vendor?.regionId) {
          regionId = vendor.regionId.toString();
        }
      } catch (e) {
        console.warn('[all-offers] Could not look up vendor region:', e.message);
      }
    }

    // Build query for admin offers
    // If regionId is provided, show global + exact regional match
    // If regionId is NOT provided, show all admin offers (allowing guest users to see everything)
    const adminOffersQuery = regionId
      ? {
        $or: [
          { regionId: null },                     // global offers (filtered later by disabledRegions)
          { regionId: regionId.toString() }       // exact-match regional offers only
        ]
      }
      : {}; // no region = show all offers to guest

    const adminOffers = await AdminOfferModel.find(adminOffersQuery).lean();

    // Filter offers by status and disabledRegions
    const activeAdminOffers = adminOffers.filter(offer => {
      // For global offers: skip if disabled for this specific region
      if (!offer.regionId && regionId) {
        const disabledList = (offer.disabledRegions || []).map(r => r.toString());
        if (disabledList.includes(regionId.toString())) {
          return false;
        }
      }

      // Status/Date check
      const now = new Date();
      const started = !offer.startDate || new Date(offer.startDate) <= now;
      const notExpired = !offer.expires || new Date(offer.expires) >= now;

      // Also respect internal 'isActive' flag
      const isNotManuallyDisabled = offer.isActive !== false;

      return started && notExpired && isNotManuallyDisabled;
    }).map(offer => ({
      ...offer,
      type: (offer.type === 'fixed-amount' ? 'fixed' : offer.type),
      status: 'Active',
      isVendorOffer: false,
      businessType: 'admin',
      businessId: null,
    }));

    // Get all active CRM offers (vendor-specific offers)
    let crmOffers = [];
    if (vendorId) {
      // If vendorId is provided, get only offers for that vendor
      crmOffers = await CRMOfferModel.find({
        businessType: 'vendor',
        businessId: vendorId
      }).lean();
    } else {
      // Otherwise get CRM offers for the region
      let crmQuery = {};
      if (regionId) {
        crmQuery = { regionId };
      }
      crmOffers = await CRMOfferModel.find(crmQuery).lean();
    }

    // Process CRM offers to update status based on current date
    const activeCrmOffers = crmOffers.filter(offer => {
      const now = new Date();
      const started = offer.startDate <= now;
      const notExpired = !offer.expires || offer.expires >= now;
      return started && notExpired;
    }).map(offer => ({
      ...offer,
      status: 'Active', // Ensure frontend sees it as active
      isVendorOffer: true,
      businessType: offer.businessType,
      businessId: offer.businessId,
    }));

    // Combine both sets of active offers
    const allActiveOffers = [...activeAdminOffers, ...activeCrmOffers];

    return NextResponse.json(
      {
        success: true,
        data: allActiveOffers,
        count: allActiveOffers.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching all offers:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching offers',
        error: error.message
      },
      { status: 500 }
    );
  }
}