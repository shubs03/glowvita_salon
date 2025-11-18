import { NextResponse } from "next/server";
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SubscriptionPlanModel from '@repo/lib/models/admin/SubscriptionPlan.model';
import VendorWorkingHours from '@repo/lib/models/Vendor/VendorWorkingHours.model';
import SmsTransaction from '@repo/lib/models/Marketing/SmsPurchaseHistory.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';
import { uploadBase64, deleteFile } from '@repo/lib/utils/upload';

await _db();

// Utility function to convert 12-hour time to 24-hour format for display
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

// Utility function to process base64 image and upload it
// Also deletes the old image if a new one is uploaded
const processBase64Image = async (base64String, fileName, oldImageUrl = null) => {
    if (!base64String) return null;
    
    // Check if it's already a URL (not base64)
    if (base64String.startsWith('http')) {
        return base64String; // Already uploaded, return as is
    }
    
    // Upload the base64 image and return the URL
    const imageUrl = await uploadBase64(base64String, fileName);
    
    // If upload was successful and there's an old image, delete the old one
    if (imageUrl && oldImageUrl && oldImageUrl.startsWith('http')) {
        try {
            // Attempt to delete the old file
            // We don't await this as we don't want to fail the whole operation if deletion fails
            deleteFile(oldImageUrl).catch(err => {
                console.warn('Failed to delete old image:', err);
            });
        } catch (err) {
            console.warn('Error deleting old image:', err);
        }
    }
    
    return imageUrl;
};

// GET - Fetch vendor profile
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user.userId;
        
        const vendor = await VendorModel.findById(vendorId)
            .select('-password -__v')
            .populate('subscription.plan')
            .lean();

        if (!vendor) {
            return NextResponse.json({ 
                success: false,
                message: "Vendor not found" 
            }, { status: 404 });
        }

        // Get the active SMS package information
        let activePackageSmsCount = 0;
        const activePackages = await SmsTransaction.find({ 
          userId: vendorId,
          userType: 'vendor',
          status: 'active',
          expiryDate: { $gte: new Date() }
        }).sort({ purchaseDate: -1 });
        
        if (activePackages.length > 0) {
          // Use the most recent active package
          activePackageSmsCount = activePackages[0].smsCount;
        }

        // Add the active package SMS count to the response (this represents the current balance)
        vendor.currentSmsBalance = activePackageSmsCount;  // SMS count from active package

        // Fetch working hours for the vendor
        try {
            const workingHours = await VendorWorkingHours.findOne({ vendor: vendorId })
                .select('workingHours timezone');
            
            // Transform working hours from the object structure to array structure for frontend
            if (workingHours && workingHours.workingHours) {
                const workingHoursArray = [];
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

                // Process days in the correct order
                daysOrder.forEach(dayKey => {
                    const dayData = workingHours.workingHours[dayKey];
                    if (dayData && typeof dayData === 'object') {
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
                    }
                });

                vendor.openingHours = workingHoursArray;
                vendor.timezone = workingHours.timezone;
            } else {
                // Default working hours if none found
                vendor.openingHours = [
                    { day: 'Monday', open: '09:00', close: '18:00', isOpen: true },
                    { day: 'Tuesday', open: '09:00', close: '18:00', isOpen: true },
                    { day: 'Wednesday', open: '09:00', close: '18:00', isOpen: true },
                    { day: 'Thursday', open: '09:00', close: '18:00', isOpen: true },
                    { day: 'Friday', open: '09:00', close: '18:00', isOpen: true },
                    { day: 'Saturday', open: '10:00', close: '15:00', isOpen: true },
                    { day: 'Sunday', open: '', close: '', isOpen: false }
                ];
            }
        } catch (workingHoursError) {
            console.error('Error fetching working hours:', workingHoursError);
            // Set default working hours if there's an error
            vendor.openingHours = [
                { day: 'Monday', open: '09:00', close: '18:00', isOpen: true },
                { day: 'Tuesday', open: '09:00', close: '18:00', isOpen: true },
                { day: 'Wednesday', open: '09:00', close: '18:00', isOpen: true },
                { day: 'Thursday', open: '09:00', close: '18:00', isOpen: true },
                { day: 'Friday', open: '09:00', close: '18:00', isOpen: true },
                { day: 'Saturday', open: '10:00', close: '15:00', isOpen: true },
                { day: 'Sunday', open: '', close: '', isOpen: false }
            ];
        }

        return NextResponse.json({ 
            success: true,
            data: vendor
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching vendor profile:', error);
        return NextResponse.json({ 
            success: false,
            message: "Failed to fetch vendor profile", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);

// PUT - Update vendor profile
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user.userId;
        const body = await req.json();

        // Find the vendor with populated subscription data
        const vendor = await VendorModel.findById(vendorId).populate('subscription.plan');
        if (!vendor) {
            return NextResponse.json({ 
                success: false,
                message: "Vendor not found" 
            }, { status: 404 });
        }

        // Debug: Log vendor subscription data to understand the issue
        console.log('Vendor subscription data:', JSON.stringify(vendor.subscription, null, 2));
        console.log('Vendor ID:', vendorId);

        // Remove _id from body if present to prevent accidental updates
        delete body._id;

        // Update allowed fields only
        const allowedFields = [
            'firstName', 'lastName', 'businessName', 'email', 'phone',
            'state', 'city', 'pincode', 'address', 'category', 'subCategories',
            'website', 'description', 'profileImage', 'gallery', 'bankDetails', 'documents'
        ];

        // Keep existing subscription data unless specifically provided in the update
        if (body.subscription) {
             Object.keys(body.subscription).forEach(key => {
                if (['plan', 'status', 'startDate', 'endDate', 'history'].includes(key)) {
                    vendor.subscription[key] = body.subscription[key];
                }
            });
        }

        // Update other fields
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                // Handle profile image upload
                if (field === 'profileImage') {
                    // If profileImage is a base64 string, upload it and store the URL
                    if (body[field] && !body[field].startsWith('http')) {
                        const imageUrl = await processBase64Image(body[field], `vendor-${vendorId}-profile`, vendor.profileImage);
                        if (imageUrl) {
                            vendor.profileImage = imageUrl;
                        }
                    } else {
                        // If it's already a URL or null, keep it as is
                        vendor.profileImage = body[field];
                    }
                }
                // Handle gallery images upload
                else if (field === 'gallery' && Array.isArray(body[field])) {
                    const galleryUrls = [];
                    for (let i = 0; i < body[field].length; i++) {
                        const image = body[field][i];
                        // If image is a base64 string, upload it and store the URL
                        if (image && !image.startsWith('http')) {
                            // Get the old image URL for this position if it exists
                            const oldImageUrl = vendor.gallery && vendor.gallery[i] ? vendor.gallery[i] : null;
                            const imageUrl = await processBase64Image(image, `vendor-${vendorId}-gallery-${i}`, oldImageUrl);
                            if (imageUrl) {
                                galleryUrls.push(imageUrl);
                            }
                        } else {
                            // If it's already a URL or null, keep it as is
                            galleryUrls.push(image);
                        }
                    }
                    vendor.gallery = galleryUrls;
                }
                // Handle nested objects like bankDetails and documents
                else if (field === 'bankDetails' && typeof body[field] === 'object') {
                    Object.keys(body[field]).forEach(key => {
                        if (['bankName', 'accountNumber', 'ifscCode', 'accountHolder'].includes(key)) {
                            vendor.bankDetails[key] = body[field][key];
                        }
                    });
                } else if (field === 'documents' && typeof body[field] === 'object') {
                    // For documents, we'll handle the specific document types
                    // Process each document field if it contains base64 data
                    const documentFields = ['aadharCard', 'udyogAadhar', 'udhayamCert', 'shopLicense', 'panCard'];
                    for (const docField of documentFields) {
                        if (body[field][docField] !== undefined) {
                            // If document is a base64 string, upload it and store the URL
                            if (body[field][docField] && !body[field][docField].startsWith('http')) {
                                const docUrl = await processBase64Image(body[field][docField], `vendor-${vendorId}-${docField}`, vendor.documents[docField]);
                                if (docUrl) {
                                    vendor.documents[docField] = docUrl;
                                    // Reset document status to pending when a new document is uploaded
                                    const statusField = `${docField}Status`;
                                    vendor.documents[statusField] = 'pending';
                                    // Clear rejection reasons when a new document is uploaded
                                    const rejectionReasonField = `${docField}RejectionReason`;
                                    vendor.documents[rejectionReasonField] = null;
                                    const adminRejectionReasonField = `${docField}AdminRejectionReason`;
                                    vendor.documents[adminRejectionReasonField] = null;
                                }
                            } else {
                                // If it's already a URL or null, keep it as is
                                vendor.documents[docField] = body[field][docField];
                            }
                        }
                    }
                } else if (field !== 'profileImage' && field !== 'gallery') {
                    // Handle all other fields normally
                    vendor[field] = body[field];
                }
            }
        }

        // Update location if provided
        if (body.location && typeof body.location === 'object') {
            if (body.location.lat !== undefined) vendor.location.lat = body.location.lat;
            if (body.location.lng !== undefined) vendor.location.lng = body.location.lng;
        }

        // Set updatedAt timestamp
        vendor.updatedAt = new Date();

        // Handle subscription validation issues gracefully
        if (!vendor.subscription || !vendor.subscription.plan || !vendor.subscription.endDate) {
            console.log('Vendor has incomplete subscription data, using validateBeforeSave: false');
            
            // For vendors with incomplete subscription data, save without validation
            // and let the admin/system handle subscription setup separately
            try {
                const updatedVendor = await vendor.save({ validateBeforeSave: false });
                
                const vendorResponse = updatedVendor.toObject();
                delete vendorResponse.password;
                delete vendorResponse.__v;

                return NextResponse.json({ 
                    success: true,
                    message: "Vendor profile updated successfully. Note: Please contact support to complete your subscription setup.",
                    data: vendorResponse
                }, { status: 200 });
            } catch (saveError) {
                console.error('Error saving vendor without validation:', saveError);
                return NextResponse.json({ 
                    success: false,
                    message: "Failed to update vendor profile", 
                    error: saveError.message 
                }, { status: 500 });
            }
        }

        try {
            const updatedVendor = await vendor.save();
            
            // Return updated vendor without sensitive fields
            const vendorResponse = updatedVendor.toObject();
            delete vendorResponse.password;
            delete vendorResponse.__v;

            return NextResponse.json({ 
                success: true,
                message: "Vendor profile updated successfully",
                data: vendorResponse
            }, { status: 200 });
        } catch (saveError) {
            console.error('Mongoose validation error:', saveError);
            
            // Check if it's a subscription validation error
            if (saveError.name === 'ValidationError') {
                // If subscription fields are missing, provide more helpful error
                if (saveError.errors?.['subscription.plan'] || saveError.errors?.['subscription.endDate']) {
                    return NextResponse.json({ 
                        success: false,
                        message: "Vendor subscription data is incomplete. Please contact support to set up your subscription.",
                        error: "Missing required subscription fields"
                    }, { status: 400 });
                }
            }
            
            // Re-throw other validation errors
            throw saveError;
        }
    } catch (error) {
        console.error('Error updating vendor profile:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                success: false,
                message: `Vendor with this ${field} already exists` 
            }, { status: 409 });
        }
        
        return NextResponse.json({ 
            success: false,
            message: "Failed to update vendor profile", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);