import { NextResponse } from 'next/server';
import VendorWorkingHours from '@repo/lib/models/VendorWorkingHours';
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

        // Prioritize workingHours over workingHoursArray since workingHours has the correct data
        if (baseData.workingHours && typeof baseData.workingHours === 'object' && !Array.isArray(baseData.workingHours)) {
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
                    // Check if hours array exists and has data
                    let openTime = '';
                    let closeTime = '';
                    
                    if (dayData.hours && dayData.hours.length > 0) {
                        openTime = convertTo24HourFormat(dayData.hours[0].openTime) || '';
                        closeTime = convertTo24HourFormat(dayData.hours[0].closeTime) || '';
                    }
                    
                    workingHoursArray.push({
                        day: daysMap[dayKey] || dayKey,
                        open: openTime,
                        close: closeTime,
                        isOpen: dayData.isOpen !== undefined ? dayData.isOpen : false
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
        } else if (Array.isArray(baseData.workingHoursArray) && baseData.workingHoursArray.length > 0) {
            // Data is already in the correct format - use it directly
            workingHoursArray = baseData.workingHoursArray;
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

        // Create the final response with both workingHours and workingHoursArray for compatibility
        const transformedData = {
            ...baseData,
            workingHours: workingHoursArray, // Use the properly transformed data
            workingHoursArray: workingHoursArray // Keep for backward compatibility
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