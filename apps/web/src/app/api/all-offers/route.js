import { NextResponse } from "next/server";
import AdminOfferModel from '@repo/lib/models/admin/AdminOffers.model.js';
import CRMOfferModel from '@repo/lib/models/Vendor/CRMOffer.model.js';
import connectDB from '@repo/lib/db';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId'); // Optional vendor ID filter
    
    // Get all active admin offers
    const currentDate = new Date();
    const adminOffers = await AdminOfferModel.find({}).lean();
    
    // Process admin offers to update status based on current date
    const activeAdminOffers = adminOffers.filter(offer => {
      let newStatus = "Scheduled";
      if (offer.startDate <= currentDate) {
        if (!offer.expires || offer.expires >= currentDate) {
          newStatus = "Active";
        } else {
          newStatus = "Expired";
        }
      }
      return newStatus === "Active";
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
      // Otherwise get all CRM offers (for all vendors)
      crmOffers = await CRMOfferModel.find({}).lean();
    }

    // Process CRM offers to update status based on current date
    const activeCrmOffers = crmOffers.filter(offer => {
      let newStatus = "Scheduled";
      if (offer.startDate <= currentDate) {
        if (!offer.expires || offer.expires >= currentDate) {
          newStatus = "Active";
        } else {
          newStatus = "Expired";
        }
      }
      return newStatus === "Active";
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