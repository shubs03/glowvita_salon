import { NextResponse } from 'next/server';
import VendorWorkingHours from '@repo/lib/models/vendor/VendorWorkingHours.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';

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
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        console.log("req.user:", req.user);

        console.log("Fetching working hours for vendor:", vendorId);

        // Find or create working hours for the vendor
        let workingHours = await VendorWorkingHours.findOne({ vendor: vendorId });

        if (!workingHours) {
            // Create default working hours if none exist
            workingHours = await VendorWorkingHours.create({ vendor: vendorId });
        }

        // Transform working hours for frontend consumption
        const transformedData = {
            ...workingHours.toObject(),
            workingHoursArray: []
        };

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
            const dayData = workingHours.workingHours[dayKey];
            if (dayData) {
                const openTime = dayData.isOpen && dayData.hours && dayData.hours.length > 0 
                    ? convertTo24HourFormat(dayData.hours[0].openTime) : '';
                const closeTime = dayData.isOpen && dayData.hours && dayData.hours.length > 0 
                    ? convertTo24HourFormat(dayData.hours[0].closeTime) : '';
                
                transformedData.workingHoursArray.push({
                    day: daysMap[dayKey] || dayKey,
                    open: openTime,
                    close: closeTime,
                    isOpen: dayData.isOpen || false
                });
            } else {
                // Add default entry if day data doesn't exist
                transformedData.workingHoursArray.push({
                    day: daysMap[dayKey] || dayKey,
                    open: '',
                    close: '',
                    isOpen: false
                });
            }
        });

        return NextResponse.json(transformedData, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching working hours", error: error.message }, { status: 500 });
    }
}, ['vendor']);

// Update working hours
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const updateData = await req.json();

        // Validate the update data
        if (!updateData.workingHours) {
            return NextResponse.json({ message: "Working hours data is required" }, { status: 400 });
        }

        // Transform working hours - convert 24-hour format to 12-hour format for storage
        const transformedWorkingHours = {};
        
        Object.keys(updateData.workingHours).forEach(day => {
            const dayData = updateData.workingHours[day];
            transformedWorkingHours[day] = {
                isOpen: dayData.isOpen,
                hours: dayData.isOpen && dayData.hours && dayData.hours.length > 0 
                    ? dayData.hours.map(timeSlot => ({
                        openTime: convertTo12HourFormat(timeSlot.openTime),
                        closeTime: convertTo12HourFormat(timeSlot.closeTime)
                    }))
                    : []
            };
        });

        // Update or create working hours
        const updatedHours = await VendorWorkingHours.findOneAndUpdate(
            { vendor: vendorId },
            { 
                $set: { 
                    workingHours: transformedWorkingHours,
                    timezone: updateData.timezone || 'Asia/Kolkata'
                } 
            },
            { 
                new: true,
                upsert: true,
                runValidators: true 
            }
        );

        return NextResponse.json({ 
            message: "Working hours updated successfully", 
            data: updatedHours 
        }, { status: 200 });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return NextResponse.json({ 
                message: "Validation error", 
                error: error.message 
            }, { status: 400 });
        }
        return NextResponse.json({ 
            message: "Error updating working hours", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);

// Add special hours
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const { date, isOpen, hours, description } = await req.json();

        // Validate the special hours data
        if (!date || !hours || !Array.isArray(hours)) {
            return NextResponse.json({ 
                message: "Date and hours array are required" 
            }, { status: 400 });
        }

        const specialHour = {
            date: new Date(date),
            isOpen: isOpen !== undefined ? isOpen : true,
            hours: hours.map(h => ({
                openTime: h.openTime,
                closeTime: h.closeTime
            })),
            description: description || ''
        };

        // Add to special hours array
        const updatedHours = await VendorWorkingHours.findOneAndUpdate(
            { vendor: vendorId },
            { 
                $push: { 
                    specialHours: specialHour 
                } 
            },
            { 
                new: true,
                upsert: true 
            }
        );

        return NextResponse.json({ 
            message: "Special hours added successfully", 
            data: updatedHours 
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ 
            message: "Error adding special hours", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);

// Remove special hours
export const DELETE = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id;
        const url = new URL(req.url);
        const specialHourId = url.searchParams.get('id');

        if (!specialHourId) {
            return NextResponse.json({ 
                message: "Special hour ID is required" 
            }, { status: 400 });
        }

        const updatedHours = await VendorWorkingHours.findOneAndUpdate(
            { vendor: vendorId },
            { 
                $pull: { 
                    specialHours: { _id: specialHourId } 
                } 
            },
            { new: true }
        );

        if (!updatedHours) {
            return NextResponse.json({ 
                message: "Working hours not found" 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            message: "Special hours removed successfully", 
            data: updatedHours 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            message: "Error removing special hours", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);