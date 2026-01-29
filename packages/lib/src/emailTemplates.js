/**
 * Appointment Email Templates
 */

export const getConfirmationTemplate = ({ clientName, businessName, serviceName, date, startTime, location }) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
        .details { background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Appointment Confirmed!</h2>
        </div>
        <div class="content">
            <p>Hi ${clientName},</p>
            <p>Great news! Your appointment at <strong>${businessName}</strong> has been confirmed.</p>
            
            <div class="details">
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${startTime}</p>
                ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
            </div>
            
            <p>We look forward to seeing you!</p>
            <p>If you need to make any changes, please contact the salon directly.</p>
        </div>
        <div class="footer">
            <p>This is an automated message from GlowVita Salon.</p>
        </div>
    </div>
</body>
</html>
`;

export const getCompletionTemplate = ({ clientName, businessName, serviceName }) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Service Completed</h2>
        </div>
        <div class="content">
            <p>Hi ${clientName},</p>
            <p>Thank you for visiting <strong>${businessName}</strong> for your <strong>${serviceName}</strong> today!</p>
            
            <p>We hope you had a wonderful experience. Your feedback helps us improve!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <p>How was your service?</p>
                <a href="#" class="button">Rate Your Experience</a>
            </div>
            
            <p>See you again soon!</p>
        </div>
        <div class="footer">
            <p>This is an automated message from GlowVita Salon.</p>
        </div>
    </div>
</body>
</html>
`;

export const getInvoiceTemplate = ({ clientName, clientPhone, businessName, businessAddress, businessPhone, serviceName, date, startTime, amount, addOnsAmount, tax, platformFee, totalAmount, amountPaid, amountRemaining, paymentStatus, invoiceNumber, paymentMethod }) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.4; color: #000; margin: 0; padding: 20px; background-color: #fff; }
        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; background: white; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .salon-info { float: left; width: 60%; }
        .invoice-title { float: right; width: 30%; text-align: right; }
        .salon-name { font-size: 20px; font-bold: true; margin: 0; }
        .salon-detail { font-size: 14px; margin: 5px 0; }
        .title { font-size: 24px; font-weight: bold; margin: 0; }
        .clear { clear: both; }
        .info-section { margin: 20px 0; display: flex; justify-content: space-between; font-size: 14px; }
        .info-col { float: left; width: 45%; }
        .info-col-right { float: right; width: 45%; text-align: right; }
        .divider { border-top: 1px solid #000; margin: 15px 0; }
        .invoice-to { margin-bottom: 20px; font-size: 14px; }
        .table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px; }
        .table th { background-color: #e2e8f0; border: 1px solid #000; padding: 10px; text-align: left; font-size: 13px; font-weight: bold; }
        .table td { border: 1px solid #000; padding: 10px; font-size: 13px; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .summary-row td { padding: 8px 10px; border: 1px solid #000; }
        .total-row { background-color: #e2e8f0; }
        .footer { margin-top: 30px; border-top: 2px solid #000; pt-20px; text-align: center; }
        .footer-note { font-weight: 500; font-size: 14px; margin-bottom: 10px; }
        .computer-generated { font-size: 12px; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="salon-info">
                <h1 class="salon-name">${businessName}</h1>
                <p class="salon-detail">${businessAddress || ''}</p>
                <p class="salon-detail">Phone: ${businessPhone || ''}</p>
            </div>
            <div class="invoice-title">
                <h2 class="title">INVOICE</h2>
            </div>
            <div class="clear"></div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
            <div class="info-col">
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            </div>
            <div class="info-col-right">
                <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
            </div>
            <div class="clear"></div>
        </div>

        <div class="divider"></div>

        <!-- Client Section -->
        <div class="invoice-to">
            <p><strong>Invoice To:</strong> ${clientName}</p>
            ${clientPhone ? `<p><strong>Phone:</strong> ${clientPhone}</p>` : ''}
        </div>

        <!-- Table -->
        <table class="table">
            <thead>
                <tr>
                    <th>ITEM DESCRIPTION</th>
                    <th class="text-right">₹ PRICE</th>
                    <th class="text-right">QTY</th>
                    <th class="text-right">₹ TAX</th>
                    <th class="text-right">₹ AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="font-bold">${serviceName}</div>
                    </td>
                    <td class="text-right">₹${(Number(amount) || 0).toFixed(2)}</td>
                    <td class="text-right">1</td>
                    <td class="text-right">₹0.00</td>
                    <td class="text-right">₹${(Number(amount) || 0).toFixed(2)}</td>
                </tr>
                ${Number(addOnsAmount) > 0 ? `
                <tr>
                    <td style="padding-left: 20px;">+ Add-ons</td>
                    <td class="text-right">₹${Number(addOnsAmount).toFixed(2)}</td>
                    <td class="text-right">1</td>
                    <td class="text-right">₹0.00</td>
                    <td class="text-right">₹${Number(addOnsAmount).toFixed(2)}</td>
                </tr>` : ''}
                
                <!-- Summary Rows -->
                <tr class="summary-row">
                    <td colspan="4" class="text-right font-bold">Subtotal:</td>
                    <td class="text-right font-bold">₹${(Number(amount) + Number(addOnsAmount || 0)).toFixed(2)}</td>
                </tr>
                <tr class="summary-row">
                    <td colspan="4" class="text-right font-bold" style="color: #16a34a;">Discount:</td>
                    <td class="text-right font-bold" style="color: #16a34a;">-₹0.00</td>
                </tr>
                <tr class="summary-row">
                    <td colspan="4" class="text-right font-bold">Tax (0%):</td>
                    <td class="text-right font-bold">₹${(Number(tax) || 0).toFixed(2)}</td>
                </tr>
                <tr class="summary-row">
                    <td colspan="4" class="text-right font-bold">Platform Fee:</td>
                    <td class="text-right font-bold">₹${(Number(platformFee) || 0).toFixed(2)}</td>
                </tr>
                <tr class="summary-row total-row">
                    <td colspan="4" class="text-right font-bold" style="font-size: 16px;">Total:</td>
                    <td class="text-right font-bold" style="font-size: 16px;">₹${(Number(totalAmount) || 0).toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-note">
                ${paymentStatus === 'paid' || paymentStatus === 'completed'
        ? `Payment Of ₹${(Number(totalAmount) || 0).toFixed(2)} Received By ${paymentMethod || 'Paid at Salon'}`
        : `Payment Of ₹${(Number(totalAmount) || 0).toFixed(2)} Is Pending`
    }
            </p>
            <p class="computer-generated">
                NOTE: This is computer generated receipt and does not require physical signature.
            </p>
        </div>
    </div>
</body>
</html>
`;

export const getCancellationTemplate = ({ clientName, businessName, serviceName, date, startTime, cancellationReason }) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background-color: #fff0f0; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
        .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color: #dc3545;">Appointment Cancelled</h2>
        </div>
        <div class="content">
            <p>Hi ${clientName},</p>
            <p>Your appointment at <strong>${businessName}</strong> has been cancelled.</p>
            
            <div class="details">
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${startTime}</p>
                ${cancellationReason ? `<p><strong>Reason for cancellation:</strong> ${cancellationReason}</p>` : ''}
            </div>
            
            <p>If you'd like to reschedule, please visit our website or contact us directly.</p>
            <p>We hope to see you soon!</p>
        </div>
        <div class="footer">
            <p>This is an automated message from GlowVita Salon.</p>
        </div>
    </div>
</body>
</html>
`;
