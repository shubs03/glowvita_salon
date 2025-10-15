import _db from "@repo/lib/db";
import StaffModel from "@repo/lib/models/staffModel";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import mongoose from "mongoose";

await _db();

// Handle CORS preflight
export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Get Public Staff for a specific vendor and service
export const GET = async (request, { params }) => {
  try {
    const { vendorId, serviceId } = params;

    console.log("Staff by service API called with:", { vendorId, serviceId });

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

    if (!serviceId) {
      const response = Response.json(
        { 
          success: false, 
          message: "Service ID is required",
          staff: []
        },
        { status: 400 }
      );

      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;
    }

    // Find the vendor services document
    const vendorServices = await VendorServicesModel.findOne({ vendor: vendorId });
    
    if (!vendorServices) {
      const response = Response.json(
        { 
          success: false, 
          message: "No services found for this vendor",
          staff: []
        },
        { status: 404 }
      );

      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;
    }

    // Find the specific service
    // Use id() method to find the service by its _id
    let service = vendorServices.services.id(serviceId);
    
    if (!service) {
      // Try to find by service name if ID lookup fails
      const serviceByName = vendorServices.services.find(s => s._id.toString() === serviceId || s.name === serviceId);
      if (!serviceByName) {
        console.log("Service not found with ID or name:", serviceId);
        const response = Response.json(
          { 
            success: false, 
            message: "Service not found",
            staff: []
          },
          { status: 404 }
        );

        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return response;
      }
      // Use the found service
      service = serviceByName;
    }

    console.log("Service found:", service.name);
    console.log("Service staff array:", service.staff);

    // Get staff members who provide this service
    let staffQuery = { 
      vendorId: vendorId, 
      status: 'Active' 
    };

    // If the service has a staff array, filter by it
    if (service.staff && service.staff.length > 0) {
      // Check if staff array contains IDs or names
      const hasObjectIds = service.staff.some(item => mongoose.Types.ObjectId.isValid(item));
      
      if (hasObjectIds) {
        // Staff array contains ObjectIds
        console.log("Filtering staff by ObjectIds");
        staffQuery = {
          ...staffQuery,
          _id: { $in: service.staff.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id)) }
        };
      } else {
        // Staff array contains names
        console.log("Filtering staff by names");
        staffQuery = {
          ...staffQuery,
          fullName: { $in: service.staff }
        };
      }
    } else {
      console.log("No staff array in service, returning all active staff");
    }

    console.log("Staff query:", staffQuery);

    // Find all active staff members for the vendor who provide the specific service
    // with availability information including time slots
    let staffMembers = await StaffModel.find(staffQuery).select(
      'fullName position photo mobileNo emailAddress mondayAvailable tuesdayAvailable wednesdayAvailable thursdayAvailable fridayAvailable saturdayAvailable sundayAvailable blockedTimes mondaySlots tuesdaySlots wednesdaySlots thursdaySlots fridaySlots saturdaySlots sundaySlots'
    );

    console.log("Found staff members:", staffMembers.length, staffMembers.map(s => s.fullName));

    // If no staff found with the specific query, try a broader search
    if (staffMembers.length === 0 && service.staff && service.staff.length > 0) {
      console.log("No staff found with specific query, trying alternative approach");
      
      // Try matching by name with a more flexible approach
      const nameQueries = service.staff.map(name => ({
        vendorId: vendorId,
        status: 'Active',
        fullName: { $regex: new RegExp(name, 'i') } // Case insensitive match
      }));
      
      if (nameQueries.length > 0) {
        const orQuery = { $or: nameQueries };
        console.log("Trying alternative name query:", orQuery);
        const alternativeStaff = await StaffModel.find(orQuery).select(
          'fullName position photo mobileNo emailAddress mondayAvailable tuesdayAvailable wednesdayAvailable thursdayAvailable fridayAvailable saturdayAvailable sundayAvailable blockedTimes mondaySlots tuesdaySlots wednesdaySlots thursdaySlots fridaySlots saturdaySlots sundaySlots'
        );
        console.log("Found alternative staff members:", alternativeStaff.length, alternativeStaff.map(s => s.fullName));
        staffMembers = alternativeStaff;
      }
    }

    // Transform staff data for public consumption (hide sensitive info)
    const publicStaffData = staffMembers.map((staff) => ({
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

    console.log("Returning public staff data:", publicStaffData);

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
    console.error('Error fetching public vendor staff by service:', error);
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