import { NextResponse } from 'next/server';
import _db from '@repo/lib/db';
import InvoiceModel from '@repo/lib/models/Invoice/Invoice.model';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';

export async function GET() {
    try {
        await _db();
        const invoices = await InvoiceModel.find({ sourceType: 'APPOINTMENT' });
        let updatedCount = 0;

        for (const invoice of invoices) {
            if (!invoice.appointmentId) continue;

            const appt = await AppointmentModel.findById(invoice.appointmentId);
            if (appt && appt.isWeddingService && appt.weddingPackageDetails && appt.weddingPackageDetails.packageName) {
                let changed = false;
                let hasPackageItem = false;
                const packageName = appt.weddingPackageDetails.packageName;

                // Check if package item already exists
                invoice.items.forEach(item => {
                    if (item.name === packageName && item.price === (appt.amount || 0)) {
                        hasPackageItem = true;
                    }
                });

                if (!hasPackageItem) {
                    // Add the package item
                    invoice.items.unshift({
                        name: packageName,
                        itemType: 'Service',
                        price: appt.amount || 0,
                        quantity: 1,
                        totalPrice: appt.amount || 0,
                        staffName: appt.staffName || ''
                    });
                    changed = true;
                }

                // Fix existing service names
                invoice.items.forEach(item => {
                    if (item.name !== packageName && !item.name.startsWith(packageName) && item.price === 0) {
                        item.name = `${packageName} - ${item.name}`;
                        changed = true;
                    }
                });

                if (changed) {
                    invoice.markModified('items');
                    await invoice.save();
                    updatedCount++;
                }
            }
        }

        return NextResponse.json({ success: true, message: `Fixed ${updatedCount} invoices.` });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
