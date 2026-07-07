import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import AppointmentModel from "../../../../../../../../packages/lib/src/models/Appointment/Appointment.model";
import PaymentCollectionModel from "../../../../../../../../packages/lib/src/models/Payment/PaymentCollection.model";
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';
import { sendEmail } from "../../../../../../../../packages/lib/src/emailService";
import { getCompletionTemplate, getInvoiceTemplate } from "../../../../../../../../packages/lib/src/emailTemplates";
import UserModel from "../../../../../../../../packages/lib/src/models/user/User.model";
import VendorModelLib from "../../../../../../../../packages/lib/src/models/Vendor/Vendor.model";
import ClientModel from "../../../../../../../../packages/lib/src/models/Vendor/Client.model";
import pdf from 'html-pdf';
import fs from 'fs';
import path from 'path';

await _db();

// Helper for file logging
const logToFile = (message) => {
  try {
    const logPath = path.join(process.cwd(), 'debug_email_log.txt');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  } catch (e) {
    // ignore logging errors
  }
};

// POST route to collect payment for an appointment
export const POST = authMiddlewareCrm(async (req) => {
  try {
    const vendorId = req.user.userId || req.user._id;
    const body = await req.json();


    const {
      appointmentId,
      amount,
      paymentMethod,
      notes,
      transactionId,
      paymentDate
    } = body;


    // Normalize client-sent date if provided
    const paymentAt = paymentDate ? new Date(paymentDate) : new Date();
    if (isNaN(paymentAt.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid paymentDate format' },
        { status: 400 }
      );
    }

    // Validate amount is a number
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount: must be a positive number' },
        { status: 400 }
      );
    }

    // Validate paymentMethod is a string
    if (typeof paymentMethod !== 'string' || paymentMethod.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment method: must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!appointmentId || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: appointmentId, amount, and paymentMethod are required' },
        { status: 400 }
      );
    }

    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid appointment ID' },
        { status: 400 }
      );
    }



    const appointment = await AppointmentModel.findOne({
      _id: appointmentId,
      vendorId: vendorId
    }).populate('service', 'name duration price');

    if (appointment) {

    } else {
      return NextResponse.json(
        { success: false, message: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate payment details
    const totalAmount = appointment.finalAmount || appointment.totalAmount || 0;
    // Use the new amountPaid field from the appointment, fallback to payment.paid for backward compatibility
    const currentPaid = appointment.amountPaid || appointment.payment?.paid || 0;
    const remainingBalance = Math.max(0, totalAmount - currentPaid);

    // Validate that payment does not exceed remaining balance
    if (amount > remainingBalance + 0.01) { // Allow small float precision difference
      return NextResponse.json(
        {
          success: false,
          message: `Payment amount (₹${amount.toFixed(2)}) exceeds remaining balance (₹${remainingBalance.toFixed(2)})`
        },
        { status: 400 }
      );
    }

    const newPaidAmount = currentPaid + amount;
    const remainingAmount = Math.max(0, totalAmount - newPaidAmount);


    // Determine payment status
    let paymentStatus = 'pending';
    let appointmentPaymentStatus = 'pending'; // For appointment model enum
    let appointmentStatus = appointment.status; // Default to current status

    if (newPaidAmount >= totalAmount) {
      paymentStatus = 'completed';
      appointmentPaymentStatus = 'completed';
      // When fully paid, mark appointment as completed
      appointmentStatus = 'completed';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'partial';
      // For partial payments, use 'partial' for appointment payment status as supported by the model
      appointmentPaymentStatus = 'partial';
      // UPDATED: Set appointment status to partially-completed
      appointmentStatus = 'partially-completed';
    }


    let serviceDetails = [];
    if (appointment.isMultiService && appointment.serviceItems && appointment.serviceItems.length > 0) {
      serviceDetails = appointment.serviceItems.map(item => ({
        serviceId: item.service,
        serviceName: item.serviceName,
        staffId: item.staff,
        staffName: item.staffName,
        startTime: item.startTime,
        endTime: item.endTime,
        duration: item.duration,
        amount: item.amount
      }));
    } else {
      serviceDetails = [{
        serviceId: appointment.service,
        serviceName: appointment.serviceName,
        staffId: appointment.staff,
        staffName: appointment.staffName,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        amount: appointment.amount
      }];
    }

    // Check if there's already a payment collection record for this appointment
    const existingPaymentCollection = await PaymentCollectionModel.findOne({
      appointmentId: appointmentId,
      vendorId: vendorId
    });

    let savedPaymentCollection;

    if (existingPaymentCollection) {
      // Update existing payment collection record

      // Update the existing payment collection with new payment details
      const updatedPaymentCollection = await PaymentCollectionModel.findByIdAndUpdate(
        existingPaymentCollection._id,
        {
          $set: {
            paymentType: paymentMethod,
            paymentStatus: paymentStatus,
            // Update amounts to reflect cumulative payments
            amountPaid: newPaidAmount,
            remainingAmount: remainingAmount,
            totalAmount: totalAmount, // Add this line to ensure totalAmount is updated
            serviceTax: appointment.serviceTax || 0,
            platformFee: appointment.platformFee || 0,
            couponCode: appointment.payment?.offer?.code || existingPaymentCollection.couponCode,
            offerType: appointment.payment?.offer ? 'vendor' : existingPaymentCollection.offerType,
            updatedAt: new Date()
          },
          $push: {
            paymentHistory: {
              amount: amount,
              paymentMethod: paymentMethod,
              paymentDate: paymentAt,
              notes: notes || '',
              transactionId: transactionId || null
            }
          }
        },
        { new: true }
      );

      savedPaymentCollection = updatedPaymentCollection;
    } else {
      // Create new payment collection record


      const paymentCollection = new PaymentCollectionModel({
        vendorId: vendorId,
        appointmentId: appointmentId,
        clientId: appointment.client || null,
        serviceDetails: serviceDetails,
        mode: appointment.mode || 'offline',
        subtotal: appointment.amount,
        discount: appointment.discountAmount || appointment.discount || 0,
        totalAmount: totalAmount,
        couponCode: appointment.payment?.offer?.code || null,
        offerType: appointment.payment?.offer ? 'vendor' : null, // Simplified for now
        paymentType: paymentMethod,
        paymentStatus: paymentStatus,
        amountPaid: newPaidAmount,
        remainingAmount: remainingAmount,
        serviceTax: appointment.serviceTax || 0,
        platformFee: appointment.platformFee || 0,
        notes: notes || '',
        transactionId: transactionId || null,
        paymentDate: paymentAt
      });

      // Save payment collection record
      try {
        savedPaymentCollection = await paymentCollection.save();
      } catch (saveError) {
        console.error('Failed to save payment collection:', saveError);
        return NextResponse.json(
          { success: false, message: 'Failed to save payment collection', error: saveError.message },
          { status: 500 }
        );
      }
    }

    // Update appointment payment status using findByIdAndUpdate to avoid validation issues


    // Log the actual update operation


    try {
      // Use findByIdAndUpdate with runValidators: false to avoid validation issues
      const updateQuery = {
        $set: {
          paymentStatus: appointmentPaymentStatus,
          status: appointmentStatus,
          amountPaid: newPaidAmount,
          amountRemaining: remainingAmount
        },
        $push: {
          paymentHistory: {
            amount: amount,
            paymentMethod: paymentMethod,
            paymentDate: paymentAt,
            notes: notes || '',
            transactionId: transactionId || null
          }
        }
      };

      // If we're updating an existing payment collection, we should also update the payment history
      // to reference the existing payment collection ID
      if (existingPaymentCollection) {
        // The paymentCollectionId is already being set correctly above
      }

      // Add the paymentCollectionId to the payment history
      if (savedPaymentCollection && savedPaymentCollection._id) {
        updateQuery.$push.paymentHistory.paymentCollectionId = savedPaymentCollection._id;
      }


      // TRIGGER CENTRALIZED INVOICE GENERATION if appointment is reaching completed status
      if (appointmentStatus === 'completed' || appointmentStatus === 'completed without payment') {
        try {
          const { default: InvoiceModel } = await import('@repo/lib/models/Invoice/Invoice.model');
          const invoice = await InvoiceModel.createFromAppointment(appointmentId, vendorId);
          if (invoice) {
            updateQuery.$set.invoiceNumber = invoice.invoiceNumber;
          }
        } catch (invoiceError) {
          console.error("Error in centralized invoice generation during payment:", invoiceError);
        }
      }

      // First, let's check if the appointment exists and log its current state
      const currentAppointment = await AppointmentModel.findById(appointmentId);


      // Apply updates to the current appointment document
      if (updateQuery.$set) {
        Object.keys(updateQuery.$set).forEach(key => {
          currentAppointment[key] = updateQuery.$set[key];
        });
      }
      if (updateQuery.$push && updateQuery.$push.paymentHistory) {
        currentAppointment.paymentHistory.push(updateQuery.$push.paymentHistory);
      }

      // Save the document to trigger pre-save hooks (commission calculation, etc.)
      const updatedAppointment = await currentAppointment.save({ validateBeforeSave: false });

      // Re-populate needed fields for the response
      await updatedAppointment.populate([
        { path: 'service', select: 'name duration price' },
        { path: 'staff', select: 'name email phone' }
      ]);



      // SYNC STAFF COMMISSION — runs independently of invoice logic
      if (appointmentStatus === 'completed' || appointmentStatus === 'completed without payment') {
        try {
          const { syncStaffCommission } = await import('@repo/lib/modules/accounting/StaffAccounting');
          const syncResult = await syncStaffCommission(appointmentId);
        } catch (commError) {
          console.error("[Collect Payment] Error syncing staff commission:", commError);
        }
      }

      // If the update failed for some reason, use the original appointment
      const finalAppointment = updatedAppointment || appointment;

      // Verify the update was successful
      if (updatedAppointment) {


        // Check if the values match what we expected
        if (updatedAppointment.amountPaid !== newPaidAmount || updatedAppointment.amountRemaining !== remainingAmount) {
          console.warn('WARNING: Appointment update may not have persisted correctly!');
        }
      } else {
        console.error('FAILED TO UPDATE APPOINTMENT: Appointment not found or update failed');
      }


      if (appointmentStatus === 'completed' && appointment.status !== 'completed') {
        try {
          const vendor = await VendorModelLib.findById(vendorId).select('businessName address phone city state pincode');
          const businessName = vendor?.businessName || 'GlowVita Salon';
          const businessAddress = `${vendor?.address || ''}, ${vendor?.city || ''}, ${vendor?.state || ''}, ${vendor?.pincode || ''}`.trim().replace(/^,|,$/g, '');
          const businessPhone = vendor?.phone || '';

          let clientEmail = appointment.clientEmail;
          let clientName = appointment.clientName;
          let clientPhone = '';

          // RESOLVE CLIENT INFO MANUALLY
          // Since we removed auto-populate, appointment.client is the raw ID string or ObjectId
          const clientId = appointment.client;



          if (!clientEmail && clientId) {

            // 1. Try Client Collection (Vendor-specific clients)
            try {
              const clientDoc = await ClientModel.findById(clientId);
              if (clientDoc) {
                clientEmail = clientDoc.email;
                if (!clientName) clientName = clientDoc.fullName;
                clientPhone = clientDoc.phone;
              }
            } catch (err) {
              console.error('Error lookup in ClientModel:', err.message);
            }

            // 2. If not found, Try User Collection (Online bookings)
            if (!clientEmail) {
              try {
                const userDoc = await UserModel.findById(clientId);
                if (userDoc) {
                  clientEmail = userDoc.emailAddress || userDoc.email;
                  if (!clientName) clientName = `${userDoc.firstName} ${userDoc.lastName}`;
                  clientPhone = userDoc.mobileNo || userDoc.phone;
                }
              } catch (err) {
                console.error('Error lookup in UserModel:', err.message);
              }
            }
          }


          if (clientEmail) {
            logToFile(`Attempting to send email to: ${clientEmail}`);

            let invoiceHtml;
            let invoice;
            try {
              logToFile('Generating invoice template...');

              // Fetch the saved invoice to get formal items and other details
              const { default: InvoiceModel } = await import('@repo/lib/models/Invoice/Invoice.model');
              invoice = await InvoiceModel.findOne({ appointmentId: appointment._id });

              if (invoice) {
                invoiceHtml = getInvoiceTemplate({
                  clientName,
                  clientPhone,
                  businessName,
                  businessAddress,
                  businessPhone,
                  date: new Date(invoice.createdAt).toLocaleDateString(),
                  items: invoice.items,
                  subtotal: invoice.subtotal,
                  tax: invoice.taxAmount,
                  taxRate: invoice.taxRate,
                  platformFee: invoice.platformFee,
                  discount: invoice.discountAmount,
                  couponCode: finalAppointment.payment?.offer?.code || "",
                  totalAmount: invoice.totalAmount,
                  paymentStatus: invoice.paymentStatus,
                  invoiceNumber: invoice.invoiceNumber,
                  paymentMethod: invoice.paymentMethod
                });
                logToFile('Invoice template generated successfully from formal invoice.');
              } else {
                // Fallback (though invoice should exist here)
                invoiceHtml = getInvoiceTemplate({
                  clientName,
                  clientPhone,
                  businessName,
                  businessAddress,
                  businessPhone,
                  date: new Date(appointment.date).toLocaleDateString(),
                  items: [{
                    name: appointment.serviceName,
                    price: appointment.amount,
                    quantity: 1,
                    totalPrice: appointment.amount
                  }],
                  subtotal: appointment.amount,
                  tax: appointment.serviceTax || appointment.tax || 0,
                  taxRate: 0,
                  platformFee: appointment.platformFee || 0,
                  discount: appointment.discountAmount || appointment.discount || 0,
                  totalAmount: totalAmount,
                  paymentStatus: 'completed',
                  invoiceNumber: updatedAppointment.invoiceNumber || appointment._id.toString(),
                  paymentMethod: paymentMethod
                });
                logToFile('Invoice template generated from appointment fallback.');
              }
            } catch (tplError) {
              console.error('Error generating invoice template:', tplError);
              logToFile(`Error generating invoice template: ${tplError.message}`);
              invoiceHtml = null;
            }

            // Generate PDF Buffer with Timeout
            let pdfBuffer;
            if (invoiceHtml) {
              logToFile('Starting PDF generation...');
              try {
                const pdfPromise = new Promise((resolve, reject) => {
                  try {
                    logToFile('Calling pdf.create...');

                    const options = {
                      format: 'A4',
                      timeout: 50000
                    };

                    pdf.create(invoiceHtml, options).toBuffer((err, buffer) => {
                      if (err) {
                        console.error('pdf.create error callback:', err);
                        logToFile(`pdf.create error callback: ${err.message}`);
                        reject(err);
                      } else {
                        logToFile('pdf.create success callback');
                        resolve(buffer);
                      }
                    });
                  } catch (err) {
                    console.error('pdf.create catch block:', err);
                    logToFile(`pdf.create catch block: ${err.message}`);
                    reject(err);
                  }
                });

                const timeoutPromise = new Promise((_, reject) =>
                  setTimeout(() => {
                    logToFile('Hard timeout (30s) reached for PDF generation');
                    reject(new Error('PDF generation timed out (30s threshold)'));
                  }, 30000)
                );

                pdfBuffer = await Promise.race([pdfPromise, timeoutPromise]);
                logToFile(`PDF Generation successful. Size: ${pdfBuffer.length}`);
              } catch (pdfError) {
                console.error('⚠️ PDF Generation failed or timed out:', pdfError.message);
                logToFile(`PDF Generation overall failed: ${pdfError.message}`);
              }
            } else {
              logToFile('Skipping PDF generation due to template error.');
            }

            // Send completion email with attachment
            const completionHtml = getCompletionTemplate({
              clientName,
              businessName,
              serviceName: appointment.serviceName,
              appointmentId: updatedAppointment?.invoiceNumber || appointment.invoiceNumber || appointment._id.toString(),
              appointmentDbId: appointment._id.toString(),
              appointmentDate: new Date(appointment.date || appointment.startTime || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' }),
              appointmentTime: updatedAppointment?.startTime || appointment.startTime,
              completedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' }),
              completedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
              orderTotal: invoice?.totalAmount || updatedAppointment?.totalAmount || appointment.totalAmount || totalAmount,
              location: appointment.homeServiceLocation?.address || businessName,
              businessAddress,
              businessPhone
            });

            logToFile('Sending email via transporter...');
            const emailOptions = {
              to: clientEmail,
              subject: `Appointment Completed - ${businessName}`,
              html: completionHtml,
              attachments: pdfBuffer ? [
                {
                  filename: `Invoice_${updatedAppointment.invoiceNumber || appointment._id}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf'
                }
              ] : []
            };

            const emailResult = await sendEmail(emailOptions);
            if (emailResult.success) {
              logToFile(`Email sent successfully. MessageID: ${emailResult.messageId}`);
            } else {
              logToFile(`Email sending FAILED. Error: ${emailResult.error}`);
              console.error(`❌ Email sending failed: ${emailResult.error}`);
            }
          } else {
            console.warn('⚠️ No client email found - emails not sent');
          }
        } catch (emailError) {
          console.error('❌ Error sending completion emails:', emailError);
          console.error('Email error stack:', emailError.stack);
        }
      } else {
      }

      // Check and credit referral bonus if user was referred (triggers on first completed appointment)
      // This is crucial for offline/pay-at-salon appointments handled via Collect Payment
      if (appointmentStatus === 'completed') {

        // ROBUST USER ID RESOLUTION:
        // The `client` field can hold either a User ID (online bookings) or a Client ID (offline bookings).
        // Step 1: Try using the client field value directly as a User ID.
        // Step 2: If not found, look up Client model to get the linked userId.
        let targetUserId = null;
        const rawClientValue = finalAppointment.client?.toString();

        if (rawClientValue) {
          try {
            // Step 1: Check if rawClientValue is a valid User ID directly
            const { default: UserModelLib } = await import('../../../../../../../../packages/lib/src/models/user/User.model');
            const userDoc = await UserModelLib.findById(rawClientValue).select('_id').lean();
            if (userDoc) {
              targetUserId = rawClientValue;
            }
          } catch (userErr) {
            console.warn(`[Collect Payment Referral] client field not a direct User ID, trying Client model:`, userErr.message);
          }

          if (!targetUserId) {
            try {
              // Step 2: client field is a Client record ID — look up linked userId
              const { default: ClientModelLib } = await import('../../../../../../../../packages/lib/src/models/Vendor/Client.model');
              const clientDoc = await ClientModelLib.findById(rawClientValue).select('userId').lean();
              if (clientDoc && clientDoc.userId) {
                targetUserId = clientDoc.userId.toString();
              } else {
              }
            } catch (err) {
              console.error(`[Collect Payment Referral] Error fetching Client record:`, err);
            }
          }
        } else {
        }

        if (targetUserId) {
          try {
            const { checkAndCreditReferralBonus } = await import('../../../../../../../../packages/lib/src/utils/referralWalletCredit');
            const referralResult = await checkAndCreditReferralBonus(targetUserId, 'appointment');
            if (referralResult.success) {
            } else {
              console.warn(`[Collect Payment Referral] ⚠️ Referral bonus not credited: ${referralResult.message}`);
            }
          } catch (referralError) {
            console.error('[Collect Payment Referral] Error crediting bonus:', referralError);
          }
        } else {
        }
      }


      // Include detailed payment information in the response
      const respTotalAmount = finalAppointment.finalAmount || finalAppointment.totalAmount || 0;
      const respAmountPaid = finalAppointment.amountPaid || 0;
      const respAmountRemaining = Math.max(0, respTotalAmount - respAmountPaid);

      return NextResponse.json({
        success: true,
        message: 'Payment collected successfully',
        paymentCollection: savedPaymentCollection,
        appointment: finalAppointment,
        paymentDetails: {
          totalAmount: respTotalAmount,
          amountPaid: respAmountPaid,
          amountRemaining: respAmountRemaining,
          paymentStatus: finalAppointment.paymentStatus || 'pending'
        }
      }, { status: 200 });

    } catch (appointmentError) {
      console.error('Failed to update appointment:', appointmentError);
      console.error('Error stack:', appointmentError.stack);
      // We still return success for the payment collection, but with a warning
      // Include detailed payment information in the response
      const totalAmount = appointment.finalAmount || appointment.totalAmount || 0;
      const amountPaid = appointment.amountPaid || 0;
      const amountRemaining = Math.max(0, totalAmount - amountPaid);

      return NextResponse.json({
        success: true,
        message: 'Payment collected successfully, but failed to update appointment status',
        paymentCollection: savedPaymentCollection,
        appointment: appointment,
        paymentDetails: {
          totalAmount: totalAmount,
          amountPaid: amountPaid,
          amountRemaining: amountRemaining,
          paymentStatus: appointment.paymentStatus || 'pending'
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Error collecting payment:', error);
    return NextResponse.json(
      { success: false, message: 'Error collecting payment', error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    );
  }
});