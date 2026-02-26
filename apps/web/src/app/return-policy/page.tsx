
"use client";

import { PageContainer } from '@repo/ui/page-container';

export default function ReturnPolicyPage() {
  return (
    <PageContainer padding="none">
      {/* Section 1: Hero */}
      <section className="py-20 md:py-24 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
            Return Policy
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Our return and refund policy is designed to be simple and straightforward.
          </p>
        </div>
      </section>

      {/* Section 2: Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <style jsx>{`
          .return-content h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: hsl(var(--foreground));
            margin-top: 3rem;
            margin-bottom: 1.25rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid hsl(var(--border));
          }
          
          .return-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: hsl(var(--foreground));
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          
          .return-content p {
            margin-bottom: 1rem;
            line-height: 1.75;
            color: hsl(var(--foreground) / 0.9);
          }
          
          .return-content ul, .return-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
          }
          
          .return-content li {
            margin-bottom: 0.75rem;
            line-height: 1.75;
            color: hsl(var(--foreground) / 0.9);
          }
          
          .return-content a {
            color: hsl(var(--primary));
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          
          .return-content a:hover {
            color: hsl(var(--primary) / 0.8);
          }
          
          .return-content strong {
            font-weight: 600;
            color: hsl(var(--foreground));
          }
          
          .return-content em {
            font-style: italic;
            color: hsl(var(--muted-foreground));
          }
          
          .question-text {
            display: block;
            font-weight: 700;
            color: hsl(var(--foreground));
            margin-bottom: 0.5rem;
            font-size: 1.05rem;
          }
          
          .lead-text {
            font-size: 0.95rem;
            color: hsl(var(--muted-foreground));
            font-style: italic;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid hsl(var(--border) / 0.5);
          }
          
          .summary-box {
            background: hsl(var(--secondary) / 0.3);
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 2rem 0;
          }
          
          .info-box {
            background: hsl(var(--secondary) / 0.2);
            border-left: 3px solid hsl(var(--primary));
            padding: 1rem 1.5rem;
            margin: 1.5rem 0;
          }
          
          .highlight-box {
            background: hsl(var(--secondary) / 0.25);
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            padding: 1.25rem 1.5rem;
            margin: 1.5rem 0;
          }
        `}</style>
        
        <div className="return-content">
        <p className="lead-text">Last updated: January 01, 2026</p>
        
        <div className="summary-box">
          <p style={{ marginBottom: 0 }}>
            Thank you for your purchase. We hope you are happy with your purchase. However, if you are not completely satisfied with your purchase for any reason, 
            you may return it to us for <strong>a full refund, store credit, or an exchange</strong>. Please see below for more information on our return policy.
          </p>
        </div>

        <h2>RETURNS</h2>
        <p>
          All returns must be postmarked within <strong>fourteen (14) days</strong> of the purchase date. 
          All returned items must be in new and unused condition, with all original tags and labels attached.
        </p>

        <h2>RETURN PROCESS</h2>
        <p>
          To return an item, please email customer service at <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a> to obtain 
          a Return Merchandise Authorisation (RMA) number. After receiving a RMA number, place the item securely in its original packaging and the return form provided, 
          then mail your return to the following address:
        </p>

        <div className="info-box">
          <p style={{ marginBottom: '0.5rem' }}><strong>glowvitasalon</strong></p>
          <p style={{ marginBottom: '0.5rem' }}>Attn: Returns</p>
          <p style={{ marginBottom: '0.5rem' }}>RMA #</p>
          <p style={{ marginBottom: '0.5rem' }}>Nashik</p>
          <p style={{ marginBottom: '0.5rem' }}>Nashik, Maharashtra 422009</p>
          <p style={{ marginBottom: 0 }}>India</p>
        </div>

        <div className="highlight-box">
          <p style={{ marginBottom: 0 }}>
            <strong>Important:</strong> Return shipping charges will be paid or reimbursed by us.
          </p>
        </div>

        <h2>REFUNDS</h2>
        <p>
          After receiving your return and inspecting the condition of your item, we will process your <strong>return or exchange</strong>. 
          Please allow at least <strong>fourteen (14) days</strong> from the receipt of your item to process your return or exchange. 
          Refunds may take 1-2 billing cycles to appear on your credit card statement, depending on your credit card company. 
          We will notify you by email when your return has been processed.
        </p>

        <h2>EXCEPTIONS</h2>
        <p>
          For defective or damaged products, please contact us at the contact details below to arrange a refund or exchange.
        </p>

        <div className="highlight-box">
          <p className="question-text">Please Note</p>
          <p style={{ marginBottom: 0 }}>● Sale items are <strong>FINAL SALE</strong> and cannot be returned.</p>
        </div>

        <h2>QUESTIONS</h2>
        <p>If you have any questions concerning our return policy, please contact us at:</p>
        
        <div className="info-box">
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Phone:</strong> <a href="tel:9075201035">90752 01035</a>
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Email:</strong> <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a>
          </p>
        </div>
        </div>
      </div>
    </PageContainer>
  );
}
