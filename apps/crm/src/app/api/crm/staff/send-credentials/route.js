import { NextResponse } from 'next/server';
import StaffModel from '@repo/lib/models/Vendor/Staff.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';
import crypto from 'crypto';
import { sendEmail } from '@repo/lib/emailService';

await _db();

export const POST = authMiddlewareCrm(async (req) => {
    try {
        const ownerId = req.user.userId;
        const userRole = req.user.role;
        const { staffId } = await req.json();

        if (!staffId) {
            return NextResponse.json({ message: "Staff ID is required" }, { status: 400 });
        }

        // Fetch Owner (Vendor or Doctor) details
        let ownerData;
        if (userRole === 'doctor') {
            const DoctorModel = (await import('@repo/lib/models/Vendor/Docters.model')).default;
            ownerData = await DoctorModel.findById(ownerId);
        } else {
            const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
            ownerData = await VendorModel.findById(ownerId);
        }

        if (!ownerData) {
            return NextResponse.json({ message: "Owner information not found" }, { status: 404 });
        }

        const businessName = ownerData.businessName || ownerData.fullName || 'Your Salon';
        const ownerEmail = ownerData.emailAddress;


        // Check if schema has tempPassword, if not add it dynamically (fixes caching issues)
        if (!StaffModel.schema.paths.tempPassword) {
            StaffModel.schema.add({
                tempPassword: { type: String, select: false }
            });
        }

        // Find the staff member and include tempPassword (which is usually hidden)
        const staff = await StaffModel.findOne({ _id: staffId, vendorId: ownerId }).select('+tempPassword');

        if (!staff) {
            return NextResponse.json({ message: "Staff not found or access denied" }, { status: 404 });
        }

        const hasTempPassword = !!staff.tempPassword;
        // removed the hard failure on missing tempPassword to allow sending reset links to existing staff


        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 86400000; // 24 hours expiry for initial setup link

        // Save token to staff
        staff.resetPasswordToken = resetToken;
        staff.resetPasswordExpires = resetTokenExpiry;
        await staff.save({ validateBeforeSave: false });

        // Generate reset URL
        // In CRM, the reset password page is at /reset-password
        const baseUrl = process.env.NEXT_PUBLIC_CRM_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${staff.emailAddress}`;

        // Send email
        const emailContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to ${businessName}</h1>
                </div>
                <div style="padding: 30px; color: #374151; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>${staff.fullName}</strong>,</p>
                    <p>You have been registered as a staff member at <strong>${businessName}</strong>. Your account has been created successfully.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
                        <p style="margin: 0 0 5px 0;"><strong>Email:</strong> ${staff.emailAddress}</p>
                        ${hasTempPassword ? `
                        <p style="margin: 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #fff; padding: 2px 5px; border: 1px solid #d1d5db;">${staff.tempPassword}</span></p>
                        ` : `
                        <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Note:</strong> No temporary password available. Please use the reset button below to set your own password.</p>
                        `}
                    </div>
                    
                    <p>${hasTempPassword ? 'To ensure your account\'s security, we recommend you change your password immediately using the link below:' : 'Please click the button below to set your password and access your account:'}</p>

                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${hasTempPassword ? 'Reset Your Password' : 'Set Your Password'}</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #4f46e5; word-break: break-all;">${resetUrl}</p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} GlowVita. All rights reserved.</p>
                </div>
            </div>
        `;

        const emailResult = await sendEmail({
            to: staff.emailAddress,
            from: `"${businessName}" <${ownerEmail}>`,
            replyTo: ownerEmail,
            subject: `Your ${businessName} Staff Account Credentials`,
            html: emailContent
        });

        if (emailResult.success) {
            return NextResponse.json({ success: true, message: "Credentials email sent successfully" });
        } else {
            console.error('Failed to send credentials email:', emailResult.error);
            return NextResponse.json({ success: false, message: "Failed to send email", error: emailResult.error }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in send-credentials:', error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}, ['vendor', 'doctor']);
