import _db from "@repo/lib/db";
import StaffModel from "@repo/lib/models/staffModel";

await _db();

// Handle CORS preflight
export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Get Public Staff for a specific vendor
export const GET = async (request, { params }) => {
  try {
    const { vendorId } = params;

    if (!vendorId) {
      const response = Response.json(
        { 
          success: false, 
          message: "Vendor ID is required",
          staff: []
        },
        { status: 400 }
      );

      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;
    }

    // Find all active staff members for the vendor with availability information including time slots
    const staffMembers = await StaffModel.find({ 
      vendorId: vendorId, 
      status: 'Active' 
    }).select('fullName position photo mobileNo emailAddress mondayAvailable tuesdayAvailable wednesdayAvailable thursdayAvailable fridayAvailable saturdayAvailable sundayAvailable blockedTimes mondaySlots tuesdaySlots wednesdaySlots thursdaySlots fridaySlots saturdaySlots sundaySlots');

    // Transform staff data for public consumption (hide sensitive info)
    const publicStaffData = staffMembers.map(staff => ({
      id: staff._id,
      name: staff.fullName,
      role: staff.position,
      image: staff.photo || null,
      mondayAvailable: staff.mondayAvailable,
      tuesdayAvailable: staff.tuesdayAvailable,
      wednesdayAvailable: staff.wednesdayAvailable,
      thursdayAvailable: staff.thursdayAvailable,
      fridayAvailable: staff.fridayAvailable,
      saturdayAvailable: staff.saturdayAvailable,
      sundayAvailable: staff.sundayAvailable,
      blockedTimes: staff.blockedTimes || [],
      mondaySlots: staff.mondaySlots || [],
      tuesdaySlots: staff.tuesdaySlots || [],
      wednesdaySlots: staff.wednesdaySlots || [],
      thursdaySlots: staff.thursdaySlots || [],
      fridaySlots: staff.fridaySlots || [],
      saturdaySlots: staff.saturdaySlots || [],
      sundaySlots: staff.sundaySlots || []
      // Hide sensitive information like phone and email for public endpoint
    }));

    const response = Response.json({
      success: true,
      staff: publicStaffData,
      count: publicStaffData.length
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error) {
    console.error('Error fetching public vendor staff:', error);
    const response = Response.json(
      { 
        success: false, 
        message: "Failed to fetch staff members",
        staff: []
      },
      { status: 500 }
    );

    // Add CORS headers to error response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }
};