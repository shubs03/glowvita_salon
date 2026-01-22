import { NextResponse } from "next/server";
import CRMOfferModel from '@repo/lib/models/Vendor/CRMOffer.model';
import connectDB from '@repo/lib/db';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');   // e.g. ?limit=10

    const currentDate = new Date();

    const query = {
      businessType: 'vendor',
      startDate: { $lte: currentDate },
      $or: [
        { expires: null },
        { expires: { $gte: currentDate } }
      ],
    };

    const activeOffers = await CRMOfferModel.find(query)
      .select(
        '_id code type value startDate expires ' +
        'applicableServices applicableServiceCategories ' +
        'offerImage businessId createdAt'
      )
      .populate({
        path: 'businessId',
        select: 'businessName slug logoImage city area',   // ← very important!
        match: { isActive: true, isApproved: true }         // only show from live vendors
      })
      .sort({ createdAt: -1 })   // newest first – or change to: { redeemed: -1 } for popular
      .limit(limit)
      .lean();                   // faster + plain JS objects

    // Filter out offers where business didn't populate (inactive vendors)
    const validOffers = activeOffers.filter(offer => offer.businessId != null);

    // Optional: enrich / format for frontend
    const formatted = validOffers.map(offer => ({
      id: offer._id.toString(),
      code: offer.code,
      type: offer.type,
      value: offer.value,
      offerImage: offer.offerImage,
      vendor: {
        id: offer.businessId?._id?.toString(),
        name: offer.businessId?.businessName || 'Vendor',
        slug: offer.businessId?.slug,
        logo: offer.businessId?.logoImage,
        location: offer.businessId?.city || offer.businessId?.area || '',
      },
      validUntil: offer.expires ? offer.expires.toISOString() : null,
      applicableTo: offer.applicableServices.length > 0 ? 'selected services' : 'all services',
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length
    });

  } catch (error) {
    console.error('Error fetching featured offers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}