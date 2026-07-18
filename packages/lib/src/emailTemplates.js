/**
 * Appointment Email Templates
 */

const LOGO_URL = "https://glowvitasalon.com/images/GlowVita%20Salon%20PNG.png";

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
                <img src="${LOGO_URL}" alt="GlowVita Salon" style="max-width: 250px; height: auto; vertical-align: middle;">
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
    appointmentDbId,
    appointmentDate,
    appointmentTime,
    completedDate,
    completedTime,
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
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #2D3748; 
            margin: 0; 
            padding: 0; 
            background-color: #FAF6F8; 
        }
        .wrapper { 
            width: 100%; 
            table-layout: fixed; 
            background-color: #FAF6F8; 
            padding: 40px 0; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(186, 120, 148, 0.08);
            border: 1px solid #F1E5EC;
            overflow: hidden;
        }
        
        /* Header */
        .header { 
            padding: 30px 20px; 
            background-color: #ffffff; 
            text-align: center; 
            border-bottom: 2px solid #F1E5EC; 
        }
        
        /* Content */
        .content { 
            padding: 40px 35px; 
        }
        .greeting { 
            font-size: 20px; 
            font-weight: 700; 
            color: #1A202C;
            margin-bottom: 16px; 
        }
        .main-text { 
            font-size: 15px; 
            color: #4A5568;
            margin-bottom: 30px; 
            line-height: 1.6;
        }
        
        /* Order Review Box */
        .order-summary { 
            background-color: #FAF6F8;
            border: 1px solid #F1E5EC;
            border-radius: 8px;
            padding: 24px; 
            margin-bottom: 30px; 
        }
        .summary-header { 
            font-size: 16px; 
            font-weight: 700; 
            color: #BA7894;
            margin-bottom: 20px; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .order-row { 
            display: table; 
            width: 100%; 
            margin-bottom: 12px; 
        }
        .order-col-left { 
            display: table-cell; 
            width: 35%; 
            font-weight: 600; 
            font-size: 14px; 
            color: #718096; 
            vertical-align: top; 
        }
        .order-col-right { 
            display: table-cell; 
            width: 65%; 
            font-size: 14px; 
            color: #2D3748;
            vertical-align: top; 
        }
        
        .divider { 
            border-bottom: 1px solid #F1E5EC; 
            margin: 16px 0; 
        }
        
        /* Buttons */
        .btn-container { 
            text-align: center; 
            margin: 30px 0 10px 0; 
        }
        .button { 
            display: inline-block; 
            padding: 14px 36px; 
            background-color: #BA7894; 
            color: #ffffff !important; 
            text-decoration: none; 
            border-radius: 8px; 
            font-size: 15px; 
            font-weight: 600; 
            box-shadow: 0 4px 14px rgba(186, 120, 148, 0.3); 
            border: none;
            transition: background-color 0.2s;
        }
        .button:hover { 
            background-color: #A36580; 
        }
        
        /* Footer */
        .footer { 
            padding: 30px 35px; 
            border-top: 1px solid #F1E5EC; 
            background-color: #FAF6F8; 
            text-align: center;
        }
        .footer-text { 
            font-size: 12px; 
            color: #718096; 
            margin-bottom: 8px; 
            line-height: 1.5;
        }
        .branding-footer { 
            margin-top: 20px; 
            border-top: 1px solid #EAE0E5; 
            padding-top: 20px; 
        }
        .branding-name { 
            font-weight: 700; 
            color: #BA7894; 
            font-size: 14px; 
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- GlowVita Logo Header -->
            <div class="header">
                 <div style="text-align: center;">
                    <img src="${LOGO_URL}" alt="GlowVita Salon" style="max-width: 180px; height: auto; vertical-align: middle;">
                </div>
            </div>

            <div class="content">
                <div class="greeting">Hi ${clientName},</div>
                <div class="main-text">
                    Thank you for your recent service Appointment of <strong>${serviceName}</strong> at <strong>${businessName}</strong>. 
                    We hope you had a professional and relaxing experience. 
                    You can now leave a review of your experience using the "Leave Service Feedback" link below. 
                    You can view your service history in Your Appointments.
                </div>

                <div class="order-summary">
                    <div class="summary-header">Appointment details</div>
                    
                    <div class="order-row">
                        <div class="order-col-left">Invoice #:</div>
                        <div class="order-col-right">${appointmentId}</div>
                    </div>
                    <div class="order-row">
                        <div class="order-col-left">Appointment Date:</div>
                        <div class="order-col-right">${appointmentDate || completedDate}${appointmentTime ? ` at ${appointmentTime}` : ''}</div>
                    </div>
                    <div class="order-row">
                        <div class="order-col-left">Completed on:</div>
                        <div class="order-col-right">${completedDate}${completedTime ? ` at ${completedTime}` : ''}</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="order-row">
                        <div class="order-col-left">Total Amount:</div>
                        <div class="order-col-right" style="font-weight: 700; font-size: 16px; color: #BA7894;">₹${(Number(orderTotal) || 0).toFixed(2)}</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="order-row">
                        <div class="order-col-left">Service location:</div>
                        <div class="order-col-right">
                            <strong>${location || businessName}</strong><br/>
                            ${businessAddress ? `<span style="color: #718096; font-size: 12px; display: inline-block; margin-top: 4px;">${businessAddress}</span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="btn-container">
                    <a href="${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'}/service-review/${appointmentDbId || appointmentId}" class="button" style="color: #ffffff !important;">Leave Service Feedback</a>
                </div>
            </div>

            <div class="footer">
                <div class="footer-text">
                    This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.
                </div>
                
                <div class="branding-footer">
                    <div class="branding-name">GlowVita Salon</div>
                    <div class="footer-text" style="font-size: 11px;">Professional Salon Management Platform</div>
                    <div class="footer-text" style="font-size: 11px; margin-top: 5px; color: #a0aec0;">&copy; 2026 GlowVita. All rights reserved.</div>
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
                    <div class="footer-brand">Professional Salon Management Platform</div>
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
                <img src="${LOGO_URL}" alt="GlowVita Salon" style="max-width: 250px; height: auto; vertical-align: middle;">
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
                <img src="${LOGO_URL}" alt="GlowVita Salon" style="max-width: 250px; height: auto; vertical-align: middle;">
            </div>
            <h2 style="color: #f39c12; margin-top: 15px;">Appointment Cancelled</h2>
        </div>
        <div class="content">
            <p>Dear ${clientName},</p>
            <p>We regret to inform you that your scheduled appointment at <strong>${salonName}</strong> has been automatically canceled because we were unable to connect with you at the scheduled time.</p>
            
            <div class="details">
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
            </div>
            
            <p>If you would still like to proceed, please schedule a new appointment at your convenience. We would be happy to assist you.</p>
            <p>Thank you for your understanding.</p>
            <br>
            <p>Best Regards,<br>Support Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message from GlowVita Salon.</p>
        </div>
    </div>
</body>
</html>
`;
