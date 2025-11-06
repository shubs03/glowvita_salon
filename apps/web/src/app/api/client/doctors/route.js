import _db from "@repo/lib/db";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";

await _db();

// GET all approved doctors (public endpoint for web app)
export const GET = async (req) => {
  try {
    // Only return approved doctors with active subscriptions for public viewing
    const doctors = await DoctorModel.find({ 
      status: 'Approved',
      'subscription.status': 'Active'
    }).select("-password -assistantContact -landline"); // Hide sensitive information
    
    return Response.json(doctors, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return Response.json(
      { message: "Error fetching doctors", error: error.message },
      { status: 500 }
    );
  }
};
