import { NextResponse } from 'next/server';
import dbConnect from '@repo/lib/db';
import Review from '@repo/lib/models/Review/Review.model';
import Doctor from '@repo/lib/models/Vendor/Docters.model';

// Connect to database
await dbConnect();

// GET - Fetch all approved doctor reviews for public display
export async function GET(req) {
  try {
    // Fetch all approved doctor reviews
    const reviews = await Review.find({ 
      entityType: 'doctor',
      isApproved: true 
    })
    .sort({ createdAt: -1 })
    .limit(100) // Limit to 100 most recent reviews
    .lean();
    
    // Get all unique doctor IDs
    const doctorIds = [...new Set(reviews.map(review => review.entityId))];
    
    // Fetch doctor names
    const doctors = await Doctor.find({
      _id: { $in: doctorIds }
    }).select('name _id');
    
    // Create a map of doctor IDs to names
    const doctorMap = {};
    doctors.forEach(doctor => {
      doctorMap[doctor._id.toString()] = doctor.name;
    });
    
    // Transform reviews for the frontend
    const transformedReviews = reviews.map((review) => {
      const doctorName = doctorMap[review.entityId.toString()] || 'Doctor';
      
      return {
        id: review._id.toString(),
        quote: review.comment,
        name: review.userName || 'Anonymous',
        role: doctorName,
        date: review.createdAt,
        rating: review.rating,
        doctorId: review.entityId.toString()
      };
    });
    
    // Group reviews by doctor
    const reviewsByDoctor = {};
    transformedReviews.forEach(review => {
      if (!reviewsByDoctor[review.doctorId]) {
        reviewsByDoctor[review.doctorId] = [];
      }
      reviewsByDoctor[review.doctorId].push(review);
    });
    
    // Create a rotating order of reviews - one from each doctor
    const orderedReviews = [];
    const doctorIdsArray = Object.keys(reviewsByDoctor);
    const maxReviewsPerDoctor = Math.max(...Object.values(reviewsByDoctor).map(reviews => reviews.length));
    
    // Interleave reviews from different doctors
    for (let i = 0; i < maxReviewsPerDoctor; i++) {
      for (const doctorId of doctorIdsArray) {
        if (reviewsByDoctor[doctorId][i]) {
          orderedReviews.push(reviewsByDoctor[doctorId][i]);
        }
      }
    }
    
    // Limit to 50 reviews for display
    const finalReviews = orderedReviews.slice(0, 50);
    
    return NextResponse.json(
      { 
        success: true, 
        reviews: finalReviews
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}