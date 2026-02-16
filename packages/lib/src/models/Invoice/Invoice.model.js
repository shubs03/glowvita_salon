import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        index: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    sourceType: {
        type: String,
        enum: ["COUNTER", "APPOINTMENT"],
        required: true
    },
    billingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Billing",
        required: function () { return this.sourceType === "COUNTER"; }
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: function () { return this.sourceType === "APPOINTMENT"; }
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: false // May be missing initially or for different reasons
    },
    clientInfo: {
        fullName: String,
        email: String,
        phone: String,
        address: String
    },
    items: [{
        name: String,
        itemType: {
            type: String,
            enum: ['Service', 'Product', 'Addon']
        },
        price: Number,
        quantity: Number,
        totalPrice: Number,
        staffName: String
    }],
    subtotal: {
        type: Number,
        required: true
    },
    taxRate: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    platformFee: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Partial', 'Cancelled', 'completed', 'pending'], // Handle case variations
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for finding invoice by source ID
invoiceSchema.index({ billingId: 1 }, { sparse: true });
invoiceSchema.index({ appointmentId: 1 }, { sparse: true });

// Static method to generate unique invoice numbers
invoiceSchema.statics.generateInvoiceNumber = async function (vendorId) {
    const { default: CounterModel } = await import('../Counter.model.js');

    // 1. Ensure vendorId is a clean string
    const salonId = vendorId.toString();
    const counterId = `invoice_v2_${salonId}`; // Using v2 key to force a fresh start from 01 for all salons

    const year = new Date().getFullYear();

    // 2. Get initials from Vendor (businessName) or Supplier (shopName)
    let vendorCode = salonId.slice(-5).toUpperCase();
    try {
        // Ensure both models are registered
        const VendorModel = mongoose.models.Vendor || (await import('../Vendor/Vendor.model.js')).default;
        const SupplierModel = mongoose.models.Supplier || (await import('../Vendor/Supplier.model.js')).default;

        // Fetch both in parallel to see which one matches this vendorId
        const [vendorData, supplierData] = await Promise.all([
            VendorModel.findById(vendorId).select('businessName').lean(),
            SupplierModel.findById(vendorId).select('shopName').lean()
        ]);

        const name = vendorData?.businessName || supplierData?.shopName;

        if (name && name.trim()) {
            const cleanName = name.trim();
            const words = cleanName.split(/\s+/).filter(word => word.length > 0);

            if (words.length > 1) {
                // Multi-word: take initials (e.g., "Manish Enterprises" -> "ME")
                vendorCode = words
                    .map(word => word[0])
                    .join('')
                    .toUpperCase();
            } else if (words.length === 1) {
                // Single word: take first 3 letters (e.g., "Manish" -> "MAN")
                vendorCode = words[0].substring(0, 3).toUpperCase();
            }

            // Limit to 5 characters max just in case
            if (vendorCode.length > 5) {
                vendorCode = vendorCode.substring(0, 5);
            }
        }
    } catch (error) {
        console.error("Error generating invoice initials:", error);
    }

    // 3. Increment the sequence for this SPECIFIC salon
    const counter = await CounterModel.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // 4. Pad sequence (01, 02, ... 99, 100...)
    const sequence = String(counter.seq).padStart(2, '0');

    // Final Format: [CODE]-[YEAR]-[SEQUENCE] (e.g., GS-2026-01)
    return `${vendorCode}-${year}-${sequence}`;
};

// Static method to create/get invoice from appointment
invoiceSchema.statics.createFromAppointment = async function (appointmentId, vendorId) {
    const existingInvoice = await this.findOne({ appointmentId, vendorId });
    const AppointmentModel = (await import('../Appointment/Appointment.model.js')).default;

    if (existingInvoice) {
        // If invoice exists but appointment somehow doesn't have the number, sync it
        await AppointmentModel.findByIdAndUpdate(appointmentId, { invoiceNumber: existingInvoice.invoiceNumber });
        return existingInvoice;
    }

    // Fetch appointment and ensure we have the raw client ID
    const appt = await AppointmentModel.findById(appointmentId)
        .populate('staff')
        .populate('serviceItems.service')
        .populate('serviceItems.staff')
        .lean(); // Use lean to get raw data and avoid virtuals/population issues

    if (!appt) throw new Error("Appointment not found");

    const invoiceNumber = await this.generateInvoiceNumber(vendorId);

    // Prepare client details with fallbacks from appointment root
    let clientDetails = {
        id: appt.client || null,
        name: appt.clientName || 'Walk-in Client',
        email: appt.clientEmail || '',
        phone: appt.clientPhone || ''
    };

    // If we have a client ID, try to fetch full details
    if (appt.client) {
        try {
            // Determine client ID (handle if already an object)
            const clientId = appt.client._id || appt.client;

            if (appt.mode === 'online') {
                const { default: UserModel } = await import('../user/User.model.js');
                const user = await UserModel.findById(clientId).select('firstName lastName emailAddress mobileNo').lean();
                if (user) {
                    clientDetails = {
                        id: user._id,
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || clientDetails.name,
                        email: user.emailAddress || '',
                        phone: user.mobileNo || ''
                    };
                }
            } else {
                // Default to offline/Client model
                const { default: ClientModel } = await import('../Vendor/Client.model.js');
                const client = await ClientModel.findById(clientId).select('fullName email phone').lean();
                if (client) {
                    clientDetails = {
                        id: client._id,
                        name: client.fullName || clientDetails.name,
                        email: client.email || '',
                        phone: client.phone || ''
                    };
                }
            }
        } catch (err) {
            console.error(`[InvoiceModel] Error fetching client details for appointment ${appointmentId}:`, err);
            // Fallback is already initialized in clientDetails
        }
    }

    // Double check if name is still 'Walk-in Client' but we have clientName
    if (clientDetails.name === 'Walk-in Client' && appt.clientName) {
        clientDetails.name = appt.clientName;
    }

    // Prepare items from appointment
    const items = [];
    if (appt.serviceItems && appt.serviceItems.length > 0) {
        appt.serviceItems.forEach(si => {
            items.push({
                name: si.serviceName,
                itemType: 'Service',
                price: si.amount,
                quantity: 1,
                totalPrice: si.amount,
                staffName: si.staffName
            });

            if (si.addOns && si.addOns.length > 0) {
                si.addOns.forEach(addon => {
                    items.push({
                        name: `+ ${addon.name}`,
                        itemType: 'Addon',
                        price: addon.price,
                        quantity: 1,
                        totalPrice: addon.price,
                        staffName: si.staffName
                    });
                });
            }
        });
    } else {
        // Fallback for older appointments without serviceItems
        items.push({
            name: appt.serviceName,
            itemType: 'Service',
            price: appt.amount,
            quantity: 1,
            totalPrice: appt.amount,
            staffName: appt.staffName
        });

        if (appt.addOns && appt.addOns.length > 0) {
            appt.addOns.forEach(addon => {
                items.push({
                    name: `+ ${addon.name}`,
                    itemType: 'Addon',
                    price: addon.price,
                    quantity: 1,
                    totalPrice: addon.price,
                    staffName: appt.staffName
                });
            });
        }
    }

    const invoice = new this({
        vendorId,
        invoiceNumber,
        sourceType: 'APPOINTMENT',
        appointmentId,
        clientId: (clientDetails.id?._id || clientDetails.id),
        clientInfo: {
            fullName: clientDetails.name,
            email: clientDetails.email,
            phone: clientDetails.phone,
            address: ''
        },
        items,
        subtotal: (appt.amount || 0) + (appt.addOnsAmount || 0),
        taxRate: appt.taxRate || 0,
        taxAmount: (appt.serviceTax || appt.tax || 0),
        discountAmount: (appt.discountAmount || appt.discount || 0),
        platformFee: appt.platformFee || 0,
        totalAmount: appt.finalAmount || appt.totalAmount || appt.amount || 0,
        amountPaid: appt.amountPaid || 0,
        balance: appt.amountRemaining || 0,
        paymentMethod: appt.paymentMethod || 'Pending',
        paymentStatus: appt.paymentStatus || 'Pending'
    });

    const savedInvoice = await invoice.save();

    // Update the appointment with the invoice number if not already present
    await AppointmentModel.findByIdAndUpdate(appointmentId, { invoiceNumber });

    return savedInvoice;
};

const InvoiceModel = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;
