// Migration script to fix vendor status from 'Active' to 'Approved'
// Run this once to fix existing data

import _db from '@repo/lib/db';
import Vendor from '@repo/lib/models/Vendor/Vendor.model';

async function migrateVendorStatus() {
    try {
        await _db();

        // Find all vendors with 'Active' status
        const result = await Vendor.updateMany(
            { status: 'Active' },
            { $set: { status: 'Approved' } }
        );

        console.log(`✅ Migration complete!`);
        console.log(`Updated ${result.modifiedCount} vendor(s)`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateVendorStatus();
