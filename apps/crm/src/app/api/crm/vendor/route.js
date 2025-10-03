
import { NextResponse } from "next/server";
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SubscriptionPlanModel from '@repo/lib/models/admin/SubscriptionPlan.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

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
        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                // Handle nested objects like bankDetails and documents
                if (field === 'bankDetails' && typeof body[field] === 'object') {
                    Object.keys(body[field]).forEach(key => {
                        if (['bankName', 'accountNumber', 'ifscCode', 'accountHolder'].includes(key)) {
                            vendor.bankDetails[key] = body[field][key];
                        }
                    });
                } else if (field === 'documents' && typeof body[field] === 'object') {
                    // For documents, we'll handle the specific document types
                    if (body[field].aadharCard !== undefined) {
                        vendor.documents.aadharCard = body[field].aadharCard;
                    }
                    if (body[field].udyogAadhar !== undefined) {
                        vendor.documents.udyogAadhar = body[field].udyogAadhar;
                    }
                    if (body[field].udhayamCert !== undefined) {
                        vendor.documents.udhayamCert = body[field].udhayamCert;
                    }
                    if (body[field].shopLicense !== undefined) {
                        vendor.documents.shopLicense = body[field].shopLicense;
                    }
                    if (body[field].panCard !== undefined) {
                        vendor.documents.panCard = body[field].panCard;
                    }
                } else {
                    vendor[field] = body[field];
                }
            }
        });

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
