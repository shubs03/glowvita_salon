import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import CRMOfferModel from '@repo/lib/models/Vendor/CRMOffer.model';
import connectDB from '@repo/lib/db';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { success: false, message: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Find offers for the specific vendor
    const offers = await CRMOfferModel.find({
      businessType: 'vendor',
      businessId: businessId
    });

    // Import VendorServicesModel if not imported at top to fetch service names
    const VendorServicesModel = (await import('@repo/lib/models/Vendor/VendorServices.model')).default;
    
    // Also fetch VendorServices to map service IDs to names
    const vendorServicesDoc = await VendorServicesModel.findOne({ vendor: businessId });
    const serviceMap = {};
    if (vendorServicesDoc && vendorServicesDoc.services) {
      vendorServicesDoc.services.forEach(service => {
        serviceMap[service._id.toString()] = service.name;
      });
    }

    const currentDate = new Date();

    // Update status for each offer based on current date and filter for active offers
    const activeOffers = [];
    for (let offer of offers) {
      let newStatus = "Scheduled";
      if (offer.startDate <= currentDate) {
        if (!offer.expires || offer.expires >= currentDate) {
          newStatus = "Active";
        } else {
          newStatus = "Expired";
        }
      }

      // Only include active offers for public display
      if (newStatus === "Active") {
        activeOffers.push({
          _id: offer._id,
          code: offer.code,
          type: offer.type,
          value: offer.value,
          status: newStatus,
          startDate: offer.startDate,
          expires: offer.expires,
          applicableServices: offer.applicableServices,
          applicableServiceNames: offer.applicableServices ? offer.applicableServices.map(id => serviceMap[id.toString()]).filter(Boolean) : [],
          applicableServiceCategories: offer.applicableServiceCategories,
          createdAt: offer.createdAt
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: activeOffers,
      count: activeOffers.length
    });

  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}