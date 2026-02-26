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

    console.log('Received payment request body:', JSON.stringify(body, null, 2));

    const {
      appointmentId,
      amount,
      paymentMethod,
      notes,
      transactionId,
      paymentDate
    } = body;

    console.log('Received payment request with appointmentId:', appointmentId);
    console.log('Amount:', amount);
    console.log('Payment Method:', paymentMethod);
    console.log('Notes:', notes);
    console.log('Transaction ID:', transactionId);
    console.log('Client-sent paymentDate:', paymentDate);

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

    // Find the appointment
    console.log('=== DEBUG: Finding appointment ===');
    console.log('Appointment ID:', appointmentId);
    console.log('Vendor ID:', vendorId);

    const appointment = await AppointmentModel.findOne({
      _id: appointmentId,
      vendorId: vendorId
    }).populate('service', 'name duration price');

    console.log('Found appointment:', appointment ? appointment._id : 'None');
    if (appointment) {
      console.log('Appointment details:');
      console.log('  - ID:', appointment._id);
      console.log('  - Service:', appointment.service);
      console.log('  - Service Name:', appointment.serviceName);
      console.log('  - Has service field:', !!appointment.service);
      console.log('  - Service type:', typeof appointment.service);
      console.log('  - Client ID (Raw):', appointment.client);
      console.log('  - Client Name:', appointment.clientName);
      console.log('  - Amount:', appointment.amount);
      console.log('  - Total Amount:', appointment.totalAmount);
      console.log('  - Final Amount:', appointment.finalAmount);
      console.log('  - Payment Status:', appointment.paymentStatus);
    } else {
      console.log('ERROR: Appointment not found or access denied');
      return NextResponse.json(
        { success: false, message: 'Appointment not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate payment details
    const totalAmount = appointment.finalAmount || appointment.totalAmount || 0;
    // Use the new amountPaid field from the appointment, fallback to payment.paid for backward compatibility
    const currentPaid = appointment.amountPaid || appointment.payment?.paid || 0;
    const newPaidAmount = currentPaid + amount;
    const remainingAmount = Math.max(0, totalAmount - newPaidAmount);

    console.log('=== PAYMENT CALCULATION DEBUG ===');
    console.log('totalAmount:', totalAmount);
    console.log('currentPaid (from appointment.amountPaid):', appointment.amountPaid);
    console.log('currentPaid (from appointment.payment?.paid):', appointment.payment?.paid);
    console.log('currentPaid (final):', currentPaid);
    console.log('amount to add:', amount);
    console.log('newPaidAmount:', newPaidAmount);
    console.log('remainingAmount:', remainingAmount);

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

    // Prepare service details
    console.log('=== DEBUG: Preparing service details ===');
    console.log('Appointment isMultiService:', appointment.isMultiService);
    console.log('Appointment serviceItems:', appointment.serviceItems);
    console.log('ServiceItems length:', appointment.serviceItems ? appointment.serviceItems.length : 'N/A');

    let serviceDetails = [];
    if (appointment.isMultiService && appointment.serviceItems && appointment.serviceItems.length > 0) {
      console.log('Processing multi-service appointment');
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
      console.log('Multi-service details:', JSON.stringify(serviceDetails, null, 2));
    } else {
      console.log('Processing single-service appointment');
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
      console.log('Single service details:', JSON.stringify(serviceDetails, null, 2));
    }

    // Check if there's already a payment collection record for this appointment
    console.log('=== DEBUG: Checking for existing payment collection ===');
    const existingPaymentCollection = await PaymentCollectionModel.findOne({
      appointmentId: appointmentId,
      vendorId: vendorId
    });

    let savedPaymentCollection;

    if (existingPaymentCollection) {
      // Update existing payment collection record
      console.log('=== DEBUG: Updating existing payment collection ===');
      console.log('Existing payment collection ID:', existingPaymentCollection._id);

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
      console.log('Payment collection updated successfully:', savedPaymentCollection._id);
    } else {
      // Create new payment collection record
      console.log('=== DEBUG: Creating new payment collection ===');
      console.log('Payment collection data:', {
        vendorId: vendorId,
        appointmentId: appointmentId,
        clientId: appointment.client || null,
        serviceDetails: serviceDetails,
        mode: appointment.mode || 'offline',
        subtotal: appointment.amount,
        discount: appointment.discountAmount || appointment.discount || 0,
        totalAmount: totalAmount,
        couponCode: appointment.payment?.offer?.code || null,
        offerType: appointment.payment?.offer ? 'vendor' : null,
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
      console.log('=== DEBUG: Saving payment collection ===');
      try {
        savedPaymentCollection = await paymentCollection.save();
        console.log('Payment collection saved successfully:', savedPaymentCollection._id);
      } catch (saveError) {
        console.error('Failed to save payment collection:', saveError);
        return NextResponse.json(
          { success: false, message: 'Failed to save payment collection', error: saveError.message },
          { status: 500 }
        );
      }
    }

    // Update appointment payment status using findByIdAndUpdate to avoid validation issues
    console.log('=== DEBUG: Updating appointment ===');
    console.log('Updating appointment with ID:', appointmentId);
    console.log('Update data:', {
      paymentStatus: appointmentPaymentStatus,
      status: appointmentStatus,
      amountPaid: newPaidAmount,
      amountRemaining: remainingAmount
    });

    // Log the actual update operation
    console.log('=== APPOINTMENT UPDATE OPERATION ===');
    console.log('Find ID:', appointmentId);
    console.log('Update object:', {
      $set: {
        paymentStatus: appointmentPaymentStatus,
        status: appointmentStatus,
        amountPaid: newPaidAmount,
        amountRemaining: remainingAmount
      }
    });

    try {
      // Use findByIdAndUpdate with runValidators: false to avoid validation issues
      console.log('=== PERFORMING APPOINTMENT UPDATE ===');
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
        console.log('Using existing payment collection ID for appointment update');
      }

      // Add the paymentCollectionId to the payment history
      if (savedPaymentCollection && savedPaymentCollection._id) {
        updateQuery.$push.paymentHistory.paymentCollectionId = savedPaymentCollection._id;
      }

      console.log('Update query:', JSON.stringify(updateQuery, null, 2));

      // TRIGGER CENTRALIZED INVOICE GENERATION if appointment is reaching completed status
      if (appointmentStatus === 'completed' || appointmentStatus === 'completed without payment') {
        try {
          const { default: InvoiceModel } = await import('@repo/lib/models/Invoice/Invoice.model');
          const invoice = await InvoiceModel.createFromAppointment(appointmentId, vendorId);
          if (invoice) {
            updateQuery.$set.invoiceNumber = invoice.invoiceNumber;
            console.log(`Prepared sequential invoice ${invoice.invoiceNumber} for appointment ${appointmentId}`);
          }
        } catch (invoiceError) {
          console.error("Error in centralized invoice generation during payment:", invoiceError);
        }
      }

      // First, let's check if the appointment exists and log its current state
      const currentAppointment = await AppointmentModel.findById(appointmentId);
      console.log('Current appointment state before update:', currentAppointment ? {
        _id: currentAppointment._id,
        paymentStatus: currentAppointment.paymentStatus,
        status: currentAppointment.status,
        amountPaid: currentAppointment.amountPaid,
        amountRemaining: currentAppointment.amountRemaining
      } : 'null');

      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        updateQuery,
        { new: true, runValidators: false }
      ).populate([
        // REMOVED 'client' from population to handle manual lookup below
        // { path: 'client', select: 'fullName email phone' },
        { path: 'service', select: 'name duration price' },
        { path: 'staff', select: 'name email phone' }
      ]);

      console.log('Appointment update result:', updatedAppointment ? {
        _id: updatedAppointment._id,
        paymentStatus: updatedAppointment.paymentStatus,
        status: updatedAppointment.status,
        amountPaid: updatedAppointment.amountPaid,
        amountRemaining: updatedAppointment.amountRemaining,
        invoiceNumber: updatedAppointment.invoiceNumber
      } : 'null');

      // If the update failed for some reason, use the original appointment
      const finalAppointment = updatedAppointment || appointment;

      // Verify the update was successful
      if (updatedAppointment) {
        console.log('=== UPDATE VERIFICATION ===');
        console.log('Expected amountPaid:', newPaidAmount);
        console.log('Actual amountPaid:', updatedAppointment.amountPaid);
        console.log('Expected amountRemaining:', remainingAmount);
        console.log('Actual amountRemaining:', updatedAppointment.amountRemaining);

        // Check if the values match what we expected
        if (updatedAppointment.amountPaid !== newPaidAmount || updatedAppointment.amountRemaining !== remainingAmount) {
          console.warn('WARNING: Appointment update may not have persisted correctly!');
        }
      } else {
        console.error('FAILED TO UPDATE APPOINTMENT: Appointment not found or update failed');
      }

      // Send email if appointment is completed
      console.log('=== EMAIL SENDING CHECK ===');
      console.log('appointmentStatus:', appointmentStatus);
      console.log('appointment.status (before update):', appointment.status);
      console.log('Condition check:', appointmentStatus === 'completed' && appointment.status !== 'completed');

      if (appointmentStatus === 'completed' && appointment.status !== 'completed') {
        try {
          console.log('=== SENDING COMPLETION EMAIL AND INVOICE ===');
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

          console.log('Initial client email (from appointment):', clientEmail);
          console.log('Initial client name (from appointment):', clientName);
          console.log('Client ID (Raw):', clientId);

          if (!clientEmail && clientId) {
            console.log(`Searching for email for Client ID: ${clientId}`);

            // 1. Try Client Collection (Vendor-specific clients)
            try {
              const clientDoc = await ClientModel.findById(clientId);
              if (clientDoc) {
                console.log('Found in Client collection:', clientDoc._id);
                clientEmail = clientDoc.email;
                if (!clientName) clientName = clientDoc.fullName;
                clientPhone = clientDoc.phone;
              }
            } catch (err) {
              console.error('Error lookup in ClientModel:', err.message);
            }

            // 2. If not found, Try User Collection (Online bookings)
            if (!clientEmail) {
              console.log('Not found in Client collection or no email. Checking User collection...');
              try {
                const userDoc = await UserModel.findById(clientId);
                if (userDoc) {
                  console.log('Found in User collection:', userDoc._id);
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
            console.log('Sending emails to:', clientEmail);
            logToFile(`Attempting to send email to: ${clientEmail}`);

            let invoiceHtml;
            try {
              console.log('Generating invoice template...');
              logToFile('Generating invoice template...');

              // Fetch the saved invoice to get formal items and other details
              const { default: InvoiceModel } = await import('@repo/lib/models/Invoice/Invoice.model');
              const invoice = await InvoiceModel.findOne({ appointmentId: appointment._id });

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
                  paymentStatus: 'paid',
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
              console.log('Generating Invoice PDF...');
              logToFile('Starting PDF generation...');
              try {
                const pdfPromise = new Promise((resolve, reject) => {
                  try {
                    console.log('Calling pdf.create...');
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
                        console.log('pdf.create success callback');
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
                console.log('Invoice PDF generated, size:', pdfBuffer.length);
                logToFile(`PDF Generation successful. Size: ${pdfBuffer.length}`);
              } catch (pdfError) {
                console.error('⚠️ PDF Generation failed or timed out:', pdfError.message);
                logToFile(`PDF Generation overall failed: ${pdfError.message}`);
                console.log('Proceeding to send email without invoice attachment.');
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
              completedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' }),
              orderTotal: updatedAppointment?.totalAmount || appointment.totalAmount,
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
              console.log(`✅ Completion email sent successfully to ${clientEmail}`);
            } else {
              logToFile(`Email sending FAILED. Error: ${emailResult.error}`);
              console.error(`❌ Email sending failed: ${emailResult.error}`);
            }
          } else {
            console.warn('⚠️ No client email found - emails not sent');
            console.log('Client data:', JSON.stringify(appointment.client, null, 2));
          }
        } catch (emailError) {
          console.error('❌ Error sending completion emails:', emailError);
          console.error('Email error stack:', emailError.stack);
        }
      } else {
        console.log('⚠️ Email condition not met - emails not sent');
        console.log('Reason: appointmentStatus !== "completed" OR appointment was already completed');
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