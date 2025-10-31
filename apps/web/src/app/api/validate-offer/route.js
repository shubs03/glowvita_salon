import { NextResponse } from "next/server";
import AdminOfferModel from '@repo/lib/models/admin/AdminOffers';
import CRMOfferModel from '@repo/lib/models/Vendor/CRMOffer.model';
import connectDB from '@repo/lib/db';

export async function POST(request) {
  try {
    await connectDB();
    
    const { offerCode, vendorId } = await request.json();
    
    if (!offerCode) {
      return NextResponse.json(
        { success: false, message: 'Offer code is required' },
        { status: 400 }
      );
    }

    // Check if models are available
    if (!AdminOfferModel || !CRMOfferModel) {
      return NextResponse.json(
        { success: false, message: 'Offer models not available' },
        { status: 500 }
      );
    }

    // First, check for admin-level offers
    let offer = await AdminOfferModel.findOne({ 
      code: offerCode.toUpperCase().trim() 
    });

    if (offer) {
      console.log('Found admin offer:', offer);
      // Check if the admin offer is applicable
      // For admin offers, we need to check if it's currently active
      const currentDate = new Date();
      const isDateValid = (!offer.startDate || new Date(offer.startDate) <= currentDate) && 
                         (!offer.expires || new Date(offer.expires) >= currentDate);
      
      if (isDateValid) {
        return NextResponse.json({
          success: true,
          data: {
            _id: offer._id,
            code: offer.code,
            type: offer.type,
            value: offer.value,
            status: offer.status,
            startDate: offer.startDate,
            expires: offer.expires,
            isVendorOffer: false
          }
        });
      }
    }

    // If no valid admin offer found, check for vendor-specific offers
    if (vendorId) {
      offer = await CRMOfferModel.findOne({ 
        code: offerCode.toUpperCase().trim(),
        businessType: 'vendor',
        businessId: vendorId
      });

      if (offer) {
        console.log('Found vendor offer:', offer);
        // Check if the vendor offer is applicable
        // For vendor offers, we need to check if it's currently active
        const currentDate = new Date();
        const isDateValid = (!offer.startDate || new Date(offer.startDate) <= currentDate) && 
                           (!offer.expires || new Date(offer.expires) >= currentDate);
        
        if (isDateValid) {
          return NextResponse.json({
            success: true,
            data: {
              _id: offer._id,
              code: offer.code,
              type: offer.type,
              value: offer.value,
              status: offer.status,
              startDate: offer.startDate,
              expires: offer.expires,
              isVendorOffer: true
            }
          });
        }
      }
    }

    return NextResponse.json(
      { success: false, message: 'Invalid or expired offer code' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error validating offer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to validate offer' },
      { status: 500 }
    );
  }
}