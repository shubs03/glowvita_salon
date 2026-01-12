import { NextResponse } from 'next/server';
import { sendEmail } from '@repo/lib/emailService';

export async function POST(request) {
  try {
    // Check if request is FormData (multipart/form-data) or JSON
    const contentType = request.headers.get('content-type') || '';
    
    let to, subject, html, text = '', from, attachments = [];
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await request.formData();
      
      to = formData.get('to');
      subject = formData.get('subject');
      html = formData.get('html');
      from = formData.get('from');
      
      // Handle attachment
      const attachmentFile = formData.get('attachment');
      if (attachmentFile && attachmentFile.size > 0) {
        // Convert File to Buffer
        const bytes = await attachmentFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        attachments = [{
          filename: attachmentFile.name || 'Sales_Invoice.pdf',
          content: buffer
        }]; 
      }
    } else {
      // Handle JSON (backward compatibility)
      const jsonData = await request.json();
      to = jsonData.to;
      subject = jsonData.subject;
      html = jsonData.html;
      from = jsonData.from;
    }
    
    console.log('Received email request:', { to, subject, from, html: html ? 'HTML content present' : 'No HTML content', text: text || 'No text content' });
    
    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      console.log('Missing required fields:', { to, subject, html, text });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Use provided from address or fallback to EMAIL_FROM environment variable
    const fromAddress = from || process.env.EMAIL_FROM;
    console.log('Using from address:', fromAddress);
    
    // Send email using the email service
    const result = await sendEmail({ 
      to, 
      subject, 
      html,
      text, // Pass text content if available
      from: fromAddress,
      attachments
    });
    
    console.log('Email service result:', result);
    
    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}