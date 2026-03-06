import _db from "@repo/lib/db";
import WalletTransactionModel from "@repo/lib/models/Payment/WalletTransaction.model";
import WalletWithdrawalModel from "@repo/lib/models/Payment/WalletWithdrawal.model";
import UserModel from "@repo/lib/models/user/User.model";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import DoctorModel from "@repo/lib/models/Vendor/Docters.model";
import SupplierModel from "@repo/lib/models/Vendor/Supplier.model";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

await _db();

const getModelByUserType = (type) => {
    switch (type) {
        case 'Vendor': return VendorModel;
        case 'Doctor': return DoctorModel;
        case 'Supplier': return SupplierModel;
        case 'User': return UserModel;
        default: return null;
    }
};

export const POST = authMiddlewareAdmin(async (req) => {
    try {
        let updatedTransactions = 0;
        let updatedWithdrawals = 0;

        // 1. Migrate Transactions
        const txns = await WalletTransactionModel.find({ regionId: { $exists: false } });
        for (const txn of txns) {
            const Model = getModelByUserType(txn.userType);
            if (Model) {
                const user = await Model.findById(txn.userId);
                if (user && user.regionId) {
                    txn.regionId = user.regionId;
                    await txn.save();
                    updatedTransactions++;
                }
            }
        }

        // 2. Migrate Withdrawals
        const withdrawals = await WalletWithdrawalModel.find({ regionId: { $exists: false } });
        for (const w of withdrawals) {
            const Model = getModelByUserType(w.userType);
            if (Model) {
                const user = await Model.findById(w.userId);
                if (user && user.regionId) {
                    w.regionId = user.regionId;
                    await w.save();
                    updatedWithdrawals++;
                }
            }
        }

        return Response.json({
            success: true,
            message: "Migration completed",
            details: {
                updatedTransactions,
                updatedWithdrawals
            }
        });
    } catch (error) {
        console.error("Migration Error:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}, ["SUPER_ADMIN"]);
