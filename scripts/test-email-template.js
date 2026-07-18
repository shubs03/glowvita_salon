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
        .content { padding: 40px 35px; }
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
        
        /* Order Summary Box */
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
        
        .order-row { display: table; width: 100%; margin-bottom: 12px; }
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
        
        .divider { border-bottom: 1px solid #F1E5EC; margin: 16px 0; }
        
        /* Buttons */
        .btn-container { text-align: center; margin: 30px 0 10px 0; }
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
        }
        
        /* Footer */
        .footer { 
            padding: 30px 35px; 
            border-top: 1px solid #F1E5EC; 
            background-color: #FAF6F8; 
            text-align: center;
        }
        .footer-text { font-size: 12px; color: #718096; margin-bottom: 8px; line-height: 1.5; }
        .branding-footer { margin-top: 20px; border-top: 1px solid #EAE0E5; padding-top: 20px; }
        .branding-name { font-weight: 700; color: #BA7894; font-size: 14px; margin-bottom: 4px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- GlowVita Logo Header -->
            <div class="header">
                <div style="text-align: center;">
                    <img src="https://glowvitasalon.com/images/GlowVitaSalonFinal_Logo.png" alt="GlowVita Salon" style="max-width: 180px; height: auto; vertical-align: middle;">
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
                        <div class="order-col-left">Completed on:</div>
                        <div class="order-col-right">${completedDate}</div>
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
                    <a href="#" class="button" style="color: #ffffff !important;">Leave Service Feedback</a>
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
