import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import _db from "@repo/lib/db";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import { ReferralModel, V2VSettingsModel } from "@repo/lib/models/admin/Reffer.model";
import SubscriptionPlan from "@repo/lib/models/admin/SubscriptionPlan.model";

// Initialize database connection
const initDb = async () => {
    try {
        await _db();
    } catch (error) {
        console.error("Database connection error:", error);
        throw new Error("Failed to connect to database");
    }
};

// Helper to generate unique referral code for suppliers
const generateReferralCode = async (shopName) => {
    let referralCode;
    let isUnique = false;

    while (!isUnique) {
        const namePrefix = (shopName || "SUP").substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const randomNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        referralCode = `${namePrefix}${randomNumbers}`;

        // Check if this code already exists for any supplier
        const existingSupplier = await SupplierModel.findOne({ referralCode });
        isUnique = !existingSupplier;
    }

    return referralCode;
};

// Helper to validate supplier data
const validateSupplierData = (data) => {
    const { firstName, lastName, email, mobile, shopName, password } = data;
    if (!firstName || !lastName || !email || !mobile || !shopName || !password) {
        return "Missing required fields";
    }
    if (!/^\d{10}$/.test(mobile)) {
        return "Mobile number must be 10 digits";
    }
    if (password.length < 8) {
        return "Password must be at least 8 characters";
    }
    return null;
};

// POST a new supplier registration via CRM
export async function POST(req) {
    try {
        await initDb();
        const body = await req.json();
        const { password, referredByCode, location, ...supplierData } = body;

        const validationError = validateSupplierData({ password, ...supplierData });
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        // Check if email or mobile already exists
        const existingSupplier = await SupplierModel.findOne({
            $or: [
                { email: supplierData.email },
                { mobile: supplierData.mobile }
            ]
        });

        if (existingSupplier) {
            return NextResponse.json({ error: "Supplier with this email or mobile already exists" }, { status: 409 });
        }

        // Parse location if it's a string
        let finalLocation = null;
        if (location) {
            try {
                finalLocation = typeof location === 'string' ? JSON.parse(location) : location;
            } catch (e) {
                console.error("Failed to parse location:", e);
            }
        }

        // Auto-assign region based on city/state/location
        let regionId = null;
        try {
            const { assignRegion } = await import("@repo/lib/utils/assignRegion.js");
            regionId = await assignRegion(supplierData.city, supplierData.state, finalLocation || { lat: 0, lng: 0 });
        } catch (err) {
            console.warn("Region assignment failed:", err.message);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find default plan
        const trialPlan = await SubscriptionPlan.findOne({ name: 'Trial Plan' });
        const subscriptionEndDate = new Date();
        if (trialPlan) {
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + (trialPlan.duration || 30));
        } else {
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        }

        const newSupplier = await SupplierModel.create({
            ...supplierData,
            password: hashedPassword,
            location: finalLocation ? { type: 'Point', coordinates: [finalLocation.lng, finalLocation.lat] } : undefined,
            referralCode: await generateReferralCode(supplierData.shopName),
            regionId,
            status: 'Pending', // Suppliers might need approval
            subscription: {
                plan: trialPlan?._id,
                status: 'Active',
                endDate: subscriptionEndDate,
                history: [],
            }
        });

        // Handle referral if code provided
        if (referredByCode) {
            try {
                const referringSupplier = await SupplierModel.findOne({ referralCode: referredByCode.trim().toUpperCase() });
                if (referringSupplier) {
                    const v2vSettings = await V2VSettingsModel.findOne({});
                    const bonusValue = v2vSettings?.referrerBonus?.bonusValue || 0;
                    const referralType = 'S2S'; // Supplier to Supplier
                    const count = await ReferralModel.countDocuments({ referralType });
                    const referralId = `${referralType}-${String(count + 1).padStart(3, '0')}`;

                    await ReferralModel.create({
                        referralId,
                        referralType,
                        referrer: referringSupplier.shopName || referringSupplier.firstName,
                        referee: newSupplier.shopName || newSupplier.firstName,
                        date: new Date(),
                        status: 'Completed',
                        bonus: String(bonusValue),
                    });
                }
            } catch (err) {
                console.error("Referral creation failed:", err);
            }
        }

        const result = newSupplier.toObject();
        delete result.password;

        return NextResponse.json({
            success: true,
            message: "Supplier registered successfully",
            data: result
        }, { status: 201 });

    } catch (error) {
        console.error("Error registering supplier:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message
        }, { status: 500 });
    }
}
