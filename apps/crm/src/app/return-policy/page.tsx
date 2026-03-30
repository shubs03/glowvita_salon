
"use client";

import { PageContainer } from '@repo/ui/page-container';

export default function ReturnPolicyPage() {
  return (
    <PageContainer padding="none">
      {/* Section 1: Hero */}
      <section className="py-20 md:py-24 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
            Refund & Return Policy
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Our policy is designed to be fair and transparent for all our customers.
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
            text-transform: uppercase;
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
          
          .return-content ul {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
            list-style-type: disc;
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
          
          .question-text {
            display: block;
            font-weight: 700;
            color: hsl(var(--foreground));
            margin-bottom: 0.5rem;
            font-size: 1.05rem;
          }
        `}</style>
        
        <div className="return-content">
          <p className="lead-text">Last Updated: January 01, 2026</p>
          
          <div className="summary-box">
            <p style={{ marginBottom: 0 }}>
              Thank you for booking our services and purchasing our product. We hope you are satisfied with your purchase. However, if you are not completely happy with your booking or product for any reason, you may return it for a <strong>full refund, store credit, or an exchange</strong>. Please see the details of our return policy below.
            </p>
          </div>

          <h2>RETURNS</h2>
          <p>
            All returns must be postmarked within <strong>fourteen (14) days</strong> of the purchase date. Items being returned must be in new, unused condition, with all original tags and labels attached.
          </p>

          <h3>Appointment Related Returns</h3>
          <div className="highlight-box">
            <p style={{ marginBottom: 0 }}>
              For booking services, returns must be postmarked at least <strong>one hour before the booking time</strong>. Once the booking time has passed, no refunds will be issued.
            </p>
          </div>

          <h2>RETURN PROCESS</h2>
          <p>
            To return an item, please email customer service at <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a> to obtain a <strong>Return Merchandise Authorisation (RMA) number</strong>. Once you have the RMA number, securely place the item in its original packaging along with the return form provided, and mail your return to the following address:
          </p>

          <div className="info-box">
            <p style={{ marginBottom: '0.5rem' }}><strong>GlowVita CRM</strong></p>
            <p style={{ marginBottom: '0.5rem' }}>Attn: Returns</p>
            <p style={{ marginBottom: '0.5rem' }}>RMA # [Your RMA Number]</p>
            <p style={{ marginBottom: '0.5rem' }}>Nashik</p>
            <p style={{ marginBottom: '0.5rem' }}>Nashik, Maharashtra 422009</p>
            <p style={{ marginBottom: 0 }}>India</p>
          </div>

          <div className="highlight-box">
            <p style={{ marginBottom: 0 }} className="font-semibold italic">
              Important: Return shipping charges will be covered or reimbursed by the respective vendor.
            </p>
          </div>

          <h2>REFUNDS</h2>
          <p>
            After we receive your return and inspect the condition of the item, we will process your return or exchange. Please allow at least <strong>fourteen (14) days</strong> from the receipt of your item for processing. Refunds may take 1-2 billing cycles to appear on your credit card statement, depending on your credit card provider. We will notify you via email once your return has been processed.
          </p>

          <h2>EXCEPTIONS</h2>
          <p>
            For defective or damaged products, please contact us using the information below to arrange for a refund or exchange.
          </p>

          <div className="summary-box">
            <p className="question-text">Please Note</p>
            <ul style={{ marginBottom: 0 }}>
              <li className="font-semibold text-slate-800 dark:text-white">Sale items are considered FINAL SALE and cannot be returned.</li>
            </ul>
          </div>

          <h2>QUESTIONS</h2>
          <p>If you have any questions regarding our return policy, please reach out to us at:</p>
          
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
