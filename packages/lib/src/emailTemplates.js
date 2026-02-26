/**
 * Appointment Email Templates
 */

const LOGO_URL = "https://glowvitasalon.com/images/GlowVitaSalonFinal_Logo.png";

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
            <div style="text-align: center;">
                <img src="${LOGO_URL}" alt="GlowVita Salon" style="max-width: 80px; height: auto; vertical-align: middle;">
                <h1 style="display: inline-block; vertical-align: middle; margin: 0 0 0 10px; color: #333; font-size: 24px;">GlowVita Salon</h1>
            </div>
            <h2 style="margin-top: 15px;">Appointment Confirmed!</h2>
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

export const getCompletionTemplate = ({
    clientName,
    businessName,
    serviceName,
    appointmentId,
    completedDate,
    orderTotal,
    location,
    businessAddress,
    businessPhone
}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: 'Amazon Ember', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; color: #111; margin: 0; padding: 0; background-color: #f3f3f3; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f3f3f3; padding-bottom: 40px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        
        /* Header */
        .header { padding: 20px; background-color: #f8f9fa; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { color: #ffffff; font-size: 24px; font-weight: bold; text-decoration: none; letter-spacing: -0.5px; }
        .logo span { color: #ff9900; }
        
        /* Content */
        .content { padding: 40px 25px; }
        .greeting { font-size: 22px; font-weight: 500; margin-bottom: 20px; }
        .main-text { font-size: 14px; margin-bottom: 25px; }
        
        /* Order Review Box */
        .order-summary { border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 20px 0; margin-bottom: 25px; }
        .summary-header { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        
        .order-row { display: table; width: 100%; margin-bottom: 10px; }
        .order-col-left { display: table-cell; width: 33%; font-weight: bold; font-size: 13px; color: #555; vertical-align: top; }
        .order-col-right { display: table-cell; width: 67%; font-size: 13px; vertical-align: top; }
        
        .divider { border-bottom: 1px solid #eee; margin: 15px 0; }
        
        /* Buttons */
        .btn-container { text-align: left; margin: 30px 0; }
        .button { display: inline-block; padding: 12px 30px; background-color: #ffd814; color: #111; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; border: 1px solid #fcd200; box-shadow: 0 2px 5px rgba(213,217,217,.5); }
        .button:hover { background-color: #f7ca00; }
        .link-btn { color: #007185; text-decoration: none; font-size: 14px; margin-right: 20px; }
        .link-btn:hover { text-decoration: underline; color: #c45500; }
        
        /* Footer */
        .footer { padding: 25px; border-top: 1px solid #eee; background-color: #ffffff; }
        .footer-text { font-size: 12px; color: #565959; margin-bottom: 10px; }
        .branding-footer { margin-top: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
        .branding-name { font-weight: bold; color: #232f3e; font-size: 14px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- GlowVita Logo Header -->
            <!-- GlowVita Logo Header -->
            <div class="header">
                 <div style="text-align: center;">
                    <img src="${LOGO_URL}" alt="GlowVita Salon" style="max-width: 200px; height: auto; vertical-align: middle;">
                </div>
            </div>

            <div class="content">
                <div class="greeting">Hi ${clientName},</div>
                <div class="main-text">
                    Thank you for your recent service order of <strong>${serviceName}</strong> at <strong>${businessName}</strong>. 
                    We hope you had a professional and relaxing experience. 
                    You can now leave a review of your experience using the "Leave Service Feedback" link below. 
                    You can view your order history in Your Orders.
                </div>

                <div class="order-summary">
                    <div class="summary-header">Order details</div>
                    
                    <div class="order-row">
                        <div class="order-col-left">Order #:</div>
                        <div class="order-col-right">${appointmentId}</div>
                    </div>
                    <div class="order-row">
                        <div class="order-col-left">Completed on:</div>
                        <div class="order-col-right">${completedDate}</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="order-row">
                        <div class="order-col-left">Order total:</div>
                        <div class="order-col-right" style="font-weight: bold; font-size: 15px;">₹${(Number(orderTotal) || 0).toFixed(2)}</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="order-row">
                        <div class="order-col-left">Service location:</div>
                        <div class="order-col-right">
                            ${location || businessName}<br/>
                            ${businessAddress ? `<span style="color: #555; font-size: 12px;">${businessAddress}</span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="btn-container">
                    <a href="#" class="button">Leave Service Feedback</a>
                </div>
                
               
            </div>

            <div class="footer">
                <div class="footer-text">
                    This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.
                </div>
                
                <div class="branding-footer">
                    <div class="branding-name">GlowVita Salon</div>
                    <div class="footer-text" style="font-size: 11px;">Professional Salon Management Platform</div>
                    <div class="footer-text" style="font-size: 11px; margin-top: 5px; color: #999;">&copy; 2026 GlowVita. All rights reserved.</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const getInvoiceTemplate = ({
    clientName,
    clientPhone,
    businessName,
    businessAddress,
    businessPhone,
    date,
    items = [],
    subtotal,
    tax,
    taxRate = 0,
    platformFee,
    discount = 0,
    couponCode = "",
    totalAmount,
    paymentStatus,
    invoiceNumber,
    paymentMethod
}) => {
    // Helper to format address with line breaks like the UI component
    const formatAddress = (address) => {
        if (!address || address === 'N/A') return address;
        if (address.length > 50) {
            const words = address.split(' ');
            const lines = [];
            let currentLine = '';
            for (const word of words) {
                if ((currentLine + word).length > 40 && currentLine.length > 0) {
                    lines.push(currentLine.trim());
                    currentLine = word + ' ';
                } else {
                    currentLine += word + ' ';
                }
            }
            if (currentLine.trim().length > 0) lines.push(currentLine.trim());
            return lines.join('<br />');
        }
        return address;
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4; color: #000; margin: 0; padding: 0; background-color: #f4f4f5; }
        .invoice-container { max-width: 800px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        
        /* GlowVita Branding Header */
        .branding-header { background-color: #111827; color: white; padding: 12px 24px; text-align: center; }
        .branding-title { font-size: 18px; font-weight: bold; margin: 0; color: #ffffff; letter-spacing: 0.025em; }
        .branding-subtitle { font-size: 10px; margin-top: 2px; opacity: 0.8; }
        
        .main-content { padding: 30px; }
        
        .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
        .salon-info { float: left; width: 60%; }
        .invoice-title-box { float: right; width: 30%; text-align: right; }
        .salon-name { font-size: 20px; font-weight: bold; margin: 0; color: #000; }
        .salon-detail { font-size: 14px; margin: 2px 0; color: #000; }
        .invoice-header-title { font-size: 24px; font-weight: bold; margin: 0; color: #000; }
        .clear { clear: both; }
        
        .info-section { margin-bottom: 15px; font-size: 14px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .info-label { font-weight: 600; }
        
        .divider { border-top: 1px solid #000; margin: 15px 0; }
        
        .table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px; }
        .table th { background-color: #e5e7eb; border: 1px solid #000; padding: 10px 8px; text-align: left; font-size: 12px; font-weight: bold; color: #000; }
        .table td { border: 1px solid #000; padding: 10px 8px; font-size: 12px; color: #000; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .addon-item { padding-left: 15px; }
        
        .summary-row td { padding: 8px; border: 1px solid #000; }
        .total-row { background-color: #e5e7eb; }
        
        .footer-section { margin-top: 30px; border-top: 2px solid #000; padding-top: 20px; }
        .payment-status-note { font-weight: 500; font-size: 14px; margin-bottom: 8px; text-align: center; color: #000; }
        .computer-generated { font-size: 10px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; text-align: center; margin-bottom: 25px; }
        
        /* GlowVita Footer Branding */
        .branding-footer { border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; }
        .footer-brand { display: inline-flex; align-items: center; color: #111827; font-weight: 600; font-size: 14px; margin-bottom: 4px; }
        .footer-subtitle { font-size: 12px; color: #6b7280; margin: 2px 0; }
        .footer-link { font-size: 12px; color: #9ca3af; margin: 2px 0; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- GlowVita Branding Header -->
        <div class="branding-header">
            <div class="branding-title">GlowVita Salon</div>
            <div class="branding-subtitle">Professional Salon Management Platform</div>
        </div>

        <div class="main-content">
            <!-- Header -->
            <div class="header">
                <div class="salon-info">
                    <h1 class="salon-name">${businessName}</h1>
                    <div class="salon-detail">${formatAddress(businessAddress)}</div>
                    <div class="salon-detail">Phone: ${businessPhone}</div>
                </div>
                <div class="invoice-title-box">
                    <h2 class="invoice-header-title">INVOICE</h2>
                </div>
                <div class="clear"></div>
            </div>

            <!-- Date and Invoice No -->
            <div class="info-section">
                <div style="float: left;">
                    <span class="info-label">Date:</span> ${date}
                </div>
                <div style="float: right;">
                    <span class="info-label">Invoice No:</span> ${invoiceNumber}
                </div>
                <div class="clear"></div>
            </div>

            <div class="divider"></div>

            <!-- Client Section -->
            <div class="info-section">
                <div><span class="info-label">Invoice To:</span> ${clientName || 'N/A'}</div>
                ${clientPhone ? `<div><span class="info-label">Phone:</span> ${clientPhone}</div>` : ''}
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
                    ${items.map(item => `
                    <tr>
                        <td>
                            <div class="font-bold ${item.type === 'addon' ? 'addon-item' : ''}">
                                ${item.type === 'addon' ? '+ ' : ''}${item.name}
                            </div>
                        </td>
                        <td class="text-right">₹${(Number(item.price) || 0).toFixed(2)}</td>
                        <td class="text-right">${item.quantity || 1}</td>
                        <td class="text-right">₹${((Number(item.price || 0) * Number(item.quantity || 1) * Number(taxRate)) / 100).toFixed(2)}</td>
                        <td class="text-right font-bold">₹${(Number(item.totalPrice) || 0).toFixed(2)}</td>
                    </tr>
                    `).join('')}
                    
                    <!-- Summary Rows -->
                    <tr class="summary-row">
                        <td colspan="4" class="text-right font-bold">Subtotal:</td>
                        <td class="text-right font-bold">₹${(Number(subtotal) || 0).toFixed(2)}</td>
                    </tr>
                    <tr class="summary-row">
                        <td colspan="4" class="text-right font-bold">Tax (${taxRate}%):</td>
                        <td class="text-right font-bold">₹${(Number(tax) || 0).toFixed(2)}</td>
                    </tr>
                    <tr class="summary-row">
                        <td colspan="4" class="text-right font-bold">Platform Fee:</td>
                        <td class="text-right font-bold">₹${(Number(platformFee) || 0).toFixed(2)}</td>
                    </tr>
                    <tr class="summary-row">
                        <td colspan="4" class="text-right font-bold" style="color: #16a34a;">
                            Discount${couponCode ? ` (${couponCode})` : ''}:
                        </td>
                        <td class="text-right font-bold" style="color: #16a34a;">-₹${(Number(discount) || 0).toFixed(2)}</td>
                    </tr>
                    <tr class="summary-row total-row">
                        <td colspan="4" class="text-right font-bold" style="font-size: 15px;">Total:</td>
                        <td class="text-right font-bold" style="font-size: 15px;">₹${(Number(totalAmount) || 0).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Footer -->
            <div class="footer-section">
                <p class="payment-status-note">
                    ${paymentMethod || paymentStatus === 'paid' || paymentStatus === 'completed'
            ? `Payment Of ₹${(Number(totalAmount) || 0).toFixed(2)} Received By ${paymentMethod || 'Paid at Salon'}`
            : `Payment Of ₹${(Number(totalAmount) || 0).toFixed(2)} Is Pending`
        }
                </p>
                <p class="computer-generated">
                    NOTE: This is computer generated receipt and does not require physical signature.
                </p>
                
                <div class="branding-footer">
                    <div class="footer-brand">Powered by GlowVita Salon</div>
                    <p class="footer-subtitle">Professional Salon Management Platform</p>
                    <p class="footer-link">www.glowvitasalon.com</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

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
            <div style="text-align: center;">
                <img src="${LOGO_URL}" alt="GlowVita Salon" style="max-width: 80px; height: auto; vertical-align: middle;">
                <h1 style="display: inline-block; vertical-align: middle; margin: 0 0 0 10px; color: #dc3545; font-size: 24px;">GlowVita Salon</h1>
            </div>
            <h2 style="color: #dc3545; margin-top: 15px;">Appointment Cancelled</h2>
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

export const noshowAppointmentEmail = ({ clientName, serviceName, appointmentDate, appointmentTime, salonName, reason }) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background-color: #fff9f0; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
        .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f39c12; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
             <div style="text-align: center;">
                <img src="${LOGO_URL}" alt="GlowVita Salon" style="max-width: 80px; height: auto; vertical-align: middle;">
                <h1 style="display: inline-block; vertical-align: middle; margin: 0 0 0 10px; color: #f39c12; font-size: 24px;">GlowVita Salon</h1>
            </div>
            <h2 style="color: #f39c12; margin-top: 15px;">Appointment Marked as No-Show</h2>
        </div>
        <div class="content">
            <p>Hi ${clientName},</p>
            <p>Your appointment at <strong>${salonName}</strong> was marked as a no-show because it wasn't completed or checked in.</p>
            
            <div class="details">
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
                ${reason ? `<p><strong>Status Detail:</strong> ${reason}</p>` : ''}
            </div>
            
            <p>If you believe this is an error, please contact the salon directly to resolve your appointment status.</p>
            <p>We hope to see you again soon!</p>
        </div>
        <div class="footer">
            <p>This is an automated message from GlowVita Salon.</p>
        </div>
    </div>
</body>
</html>
`;
