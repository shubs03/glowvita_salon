import { NextResponse } from 'next/server';
import dbConnect from '@repo/lib/db';
import { withSubscriptionCheck } from '@/middlewareCrm';

export const POST = withSubscriptionCheck(async (req) => {
    try {
        await dbConnect();
        const { token } = await req.json();
        const userId = req.user.userId;
        const role = req.user.role;

        if (!token) {
            return NextResponse.json({ message: "Token is required" }, { status: 400 });
        }

        let Model;
        if (role === 'vendor') {
            const { default: VendorModel } = await import('@repo/lib/models/Vendor/Vendor.model');
            Model = VendorModel;
        } else if (role === 'doctor') {
            const { default: DoctorModel } = await import('@repo/lib/models/Vendor/Docters.model');
            Model = DoctorModel;
        } else if (role === 'supplier') {
            const { default: SupplierModel } = await import('@repo/lib/models/Vendor/Supplier.model');
            Model = SupplierModel;
        } else if (role === 'staff') {
            const { default: StaffModel } = await import('@repo/lib/models/Vendor/Staff.model');
            Model = StaffModel;
        }

        if (!Model) {
            return NextResponse.json({ message: "Invalid role for token registration" }, { status: 400 });
        }

        // Register or reassign token
        const DeviceToken = (await import('@repo/lib/models/DeviceToken.model')).default;
        await DeviceToken.findOneAndUpdate(
            { token: token },
            {
                userId,
                userType: role,
                isActive: true
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: "Token registered successfully" }, { status: 200 });
    } catch (error) {
        console.error("Token Registration Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}, ["vendor", "doctor", "supplier", "staff"]);
