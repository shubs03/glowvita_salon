import { NextResponse } from 'next/server';
import DoctorWorkingHours from '@repo/lib/models/Vendor/DoctorWorkingHours.model';
import _db from '@repo/lib/db';

await _db();

const convertTo12HourFormat = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour12 = parseInt(hours);
    const ampm = hour12 >= 12 ? 'PM' : 'AM';
    const displayHour = hour12 === 0 ? 12 : hour12 > 12 ? hour12 - 12 : hour12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes}${ampm}`;
};

const convertTo24HourFormat = (time12) => {
    if (!time12) return '';
    const timePattern = /^(\d{1,2}):(\d{2})(AM|PM)$/i;
    const match = time12.match(timePattern);
    if (!match) return time12;
    let [, hours, minutes, ampm] = match;
    hours = parseInt(hours);
    if (ampm.toUpperCase() === 'AM') {
        if (hours === 12) hours = 0;
    } else {
        if (hours !== 12) hours += 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

export const GET = async (req) => {
    try {
        // Support both authenticated user (CRM) and public access via query param
        const url = new URL(req.url);
        const queryDoctorId = url.searchParams.get('doctorId');
        
        // Use query param if provided and not undefined/null, otherwise use authenticated user
        const doctorId = (queryDoctorId && queryDoctorId !== 'undefined' && queryDoctorId !== 'null') 
            ? queryDoctorId 
            : (req.user && req.user.userId);
        
        if (!doctorId) {
            return NextResponse.json({ message: "Doctor ID is required." }, { status: 400 });
        }

        let workingHours = await DoctorWorkingHours.findOne({ doctor: doctorId });
        if (!workingHours) {
            workingHours = await DoctorWorkingHours.create({ doctor: doctorId });
        }
        const transformedData = {
            ...workingHours.toObject(),
            workingHoursArray: []
        };
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
};

export const PUT = async (req) => {
    try {
        const doctorId = req.user.userId;
        const updateData = await req.json();
        if (!updateData.workingHours) {
            return NextResponse.json({ message: "Working hours data is required" }, { status: 400 });
        }
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
        const updatedHours = await DoctorWorkingHours.findOneAndUpdate(
            { doctor: doctorId },
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
};

export const POST = async (req) => {
    try {
        const doctorId = req.user.userId;
        const { date, isOpen, hours, description } = await req.json();
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
        const updatedHours = await DoctorWorkingHours.findOneAndUpdate(
            { doctor: doctorId },
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
};

export const DELETE = async (req) => {
    try {
        const doctorId = req.user.userId;
        const url = new URL(req.url);
        const specialHourId = url.searchParams.get('id');
        if (!specialHourId) {
            return NextResponse.json({ 
                message: "Special hour ID is required" 
            }, { status: 400 });
        }
        const updatedHours = await DoctorWorkingHours.findOneAndUpdate(
            { doctor: doctorId },
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
};
