import { NextResponse } from "next/server";
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
    // Rule 1: Global offers (regionId: null) → show to everyone, but respect disabledRegions
    // Rule 2: Regional offers (regionId set) → ONLY show to users of that exact region
    // Rule 3: If NO regionId known → only return global offers
    const adminOffersQuery = regionId
      ? {
          $or: [
            { regionId: null },                     // global offers (filtered later by disabledRegions)
            { regionId: regionId.toString() }       // exact-match regional offers only
          ]
        }
      : { regionId: null }; // no region = global offers only

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

      // Status check
      const now = new Date();
      const started = offer.startDate <= now;
      const notExpired = !offer.expires || offer.expires >= now;
      return started && notExpired;
    }).map(offer => ({
      ...offer,
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