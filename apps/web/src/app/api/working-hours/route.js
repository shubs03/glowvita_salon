import { NextResponse } from 'next/server';
import VendorWorkingHours from '@repo/lib/models/vendor/VendorWorkingHours.model';
import _db from '@repo/lib/db';

// Utility function to convert 24-hour time to 12-hour format

await _db();

// Utility function to convert 24-hour time to 12-hour format
const convertTo12HourFormat = (time24) => {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    const hour12 = parseInt(hours);
    const ampm = hour12 >= 12 ? 'PM' : 'AM';
    const displayHour = hour12 === 0 ? 12 : hour12 > 12 ? hour12 - 12 : hour12;
    
    return `${displayHour.toString().padStart(2, '0')}:${minutes}${ampm}`;
};

// Utility function to convert 12-hour time to 24-hour format
const convertTo24HourFormat = (time12) => {
    if (!time12) return '';
    
    const timePattern = /^(\d{1,2}):(\d{2})(AM|PM)$/i;
    const match = time12.match(timePattern);
    
    if (!match) return time12; // Return as-is if it doesn't match expected format
    
    let [, hours, minutes, ampm] = match;
    hours = parseInt(hours);
    
    if (ampm.toUpperCase() === 'AM') {
        if (hours === 12) hours = 0;
    } else {
        if (hours !== 12) hours += 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// GET working hours for the vendor
export const GET = async (req) => {
    try {
        // Extract vendorId from query parameters
        const { searchParams } = new URL(req.url);
        const vendorId = searchParams.get('vendorId');
        
        if (!vendorId) {
            return NextResponse.json(
                { success: false, message: "Vendor ID is required" },
                { status: 400 }
            );
        }

        console.log("Fetching working hours for vendor:", vendorId);

        // Find or create working hours for the vendor
        let workingHours = await VendorWorkingHours.findOne({ vendor: vendorId });

        if (!workingHours) {
            // Create default working hours if none exist
            workingHours = await VendorWorkingHours.create({ vendor: vendorId });
        }

        // Transform working hours for frontend consumption
        let workingHoursArray = [];
        
        // Get the base data first to check what structure we have
        const baseData = workingHours.toObject();

        // Check if there's already a workingHours array with proper data
        if (Array.isArray(baseData.workingHours) && baseData.workingHours.length > 0 && baseData.workingHours[0].hasOwnProperty('day')) {
            // Data is already in the correct format - use it directly
            workingHoursArray = baseData.workingHours;
        } else if (baseData.workingHours && typeof baseData.workingHours === 'object' && !Array.isArray(baseData.workingHours)) {
            // Convert object structure to array format for frontend
            const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const daysMap = {
                'monday': 'Monday',
                'tuesday': 'Tuesday', 
                'wednesday': 'Wednesday',
                'thursday': 'Thursday',
                'friday': 'Friday',
                'saturday': 'Saturday',
                'sunday': 'Sunday'
            };

            daysOrder.forEach(dayKey => {
                const dayData = baseData.workingHours[dayKey];
                if (dayData) {
                    const openTime = dayData.isOpen && dayData.hours && dayData.hours.length > 0 
                        ? convertTo24HourFormat(dayData.hours[0].openTime) : '';
                    const closeTime = dayData.isOpen && dayData.hours && dayData.hours.length > 0 
                        ? convertTo24HourFormat(dayData.hours[0].closeTime) : '';
                    
                    workingHoursArray.push({
                        day: daysMap[dayKey] || dayKey,
                        open: openTime,
                        close: closeTime,
                        isOpen: dayData.isOpen || false
                    });
                } else {
                    // Add default entry if day data doesn't exist
                    workingHoursArray.push({
                        day: daysMap[dayKey] || dayKey,
                        open: '',
                        close: '',
                        isOpen: false
                    });
                }
            });
        } else {
            // No working hours data - create default array
            const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            daysOrder.forEach(day => {
                workingHoursArray.push({
                    day: day,
                    open: '',
                    close: '',
                    isOpen: false
                });
            });
        }

        // Create the final response with the correct workingHoursArray
        // Remove any existing workingHoursArray from the base data to prevent conflicts
        delete baseData.workingHoursArray;
        
        const transformedData = {
            ...baseData,
            workingHoursArray: workingHoursArray  // Our correctly populated array
        };

        return NextResponse.json({
            success: true,
            data: transformedData
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching working hours:", error);
        return NextResponse.json({ 
            success: false,
            message: "Error fetching working hours", 
            error: error.message 
        }, { status: 500 });
    }
};