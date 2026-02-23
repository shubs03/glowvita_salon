const fs = require('fs');
const path = require('path');

const getCompletionTemplate = ({
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
        .header { padding: 15px 25px; background-color: #232f3e; display: flex; align-items: center; justify-content: space-between; }
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
            <div class="header">
                <a href="#" class="logo">Glow<span>Vita</span></a>
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
                
                <div style="margin-top: 20px;">
                    <a href="#" class="link-btn">Your Orders</a>
                    <a href="#" class="link-btn">Contact Salon</a>
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

const testData = {
    clientName: 'Jayshri Mukunda Khirari',
    businessName: 'GlowVita Salon',
    serviceName: 'Open Box Inspection for Samsung Galaxy M17 5G Mobile (Moonlight Silver, 8GB RAM, 128GB Storage)',
    appointmentId: '403-8227388-2253167',
    completedDate: 'Sun, 1 Feb, 2026',
    orderTotal: 79.00,
    location: 'Nashik, Maharashtra',
    businessAddress: 'Plot No 4, Gangapur Road, Nashik, Maharashtra 422005',
    businessPhone: '+91 9876543210'
};

try {
    const html = getCompletionTemplate(testData);
    const outputPath = 'f:/MERN Project/glowvita_salon/template-preview.html';
    fs.writeFileSync(outputPath, html);
    console.log('Preview generated successfully at template-preview.html');
} catch (error) {
    console.error('Error rendering template:', error);
}
