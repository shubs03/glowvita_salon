
"use client";

import { PageContainer } from '@repo/ui/page-container';

export default function TermsConditionsPage() {
  return (
    <PageContainer padding="none">
      {/* Section 1: Hero */}
      <section className="py-20 md:py-24 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Please read these terms carefully before using our service.
          </p>
        </div>
      </section>

      {/* Section 2: Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <style jsx>{`
          .terms-content h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: hsl(var(--foreground));
            margin-top: 3rem;
            margin-bottom: 1.25rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid hsl(var(--border));
          }
          
          .terms-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: hsl(var(--foreground));
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          
          .terms-content p {
            margin-bottom: 1rem;
            line-height: 1.75;
            color: hsl(var(--foreground) / 0.9);
          }
          
          .terms-content ul, .terms-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
          }
          
          .terms-content li {
            margin-bottom: 0.75rem;
            line-height: 1.75;
            color: hsl(var(--foreground) / 0.9);
          }
          
          .terms-content a {
            color: hsl(var(--primary));
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          
          .terms-content a:hover {
            color: hsl(var(--primary) / 0.8);
          }
          
          .terms-content strong {
            font-weight: 600;
            color: hsl(var(--foreground));
          }
          
          .terms-content em {
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
          
          .toc-box {
            background: hsl(var(--secondary) / 0.2);
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 2rem 0;
          }
          
          .toc-box ol {
            padding-left: 1.25rem;
            margin-bottom: 0;
          }
          
          .toc-box li {
            margin-bottom: 0.5rem;
          }
          
          .info-box {
            background: hsl(var(--secondary) / 0.2);
            border-left: 3px solid hsl(var(--primary));
            padding: 1rem 1.5rem;
            margin: 1.5rem 0;
          }
        `}</style>
        
        <div className="terms-content">
          <p className="lead-text">Last Updated: January 01, 2026</p>

          <h2>AGREEMENT TO OUR LEGAL TERMS</h2>
          <p>
            We are <strong>GlowVita CRM</strong> (&apos;<strong>Company</strong>&apos;, &apos;<strong>we</strong>&apos;, &apos;<strong>us</strong>&apos;, or &apos;<strong>our</strong>&apos;), 
            a company registered in India at Nashik, Maharashtra 422009.
          </p>
          <p>
            We operate the mobile application <strong>GlowVita CRM</strong> (the &apos;<strong>App</strong>&apos;), as well as any other related products and services that refer or link to these legal terms (the &apos;<strong>Legal Terms</strong>&apos;) (collectively, the &apos;<strong>Services</strong>&apos;).
          </p>
          <div className="info-box">
            <p style={{ marginBottom: 0 }}>
              You can contact us by phone at <strong>90752 01035</strong>, email at <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a>, 
              or by mail to Nashik, Maharashtra 422009.
            </p>
          </div>
          <p>
            These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&apos;<strong>you</strong>&apos;), and <strong>GlowVita CRM</strong>, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. 
            <strong> IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
          </p>
          <div className="summary-box">
            <p className="question-text">Age Restriction</p>
            <p style={{ marginBottom: 0 }}>
              The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.
            </p>
          </div>

          <div className="toc-box">
            <h2 id="toc" style={{ marginTop: 0 }}>TABLE OF CONTENTS</h2>
            <ol>
              <li><a href="#section-1">OUR SERVICES</a></li>
              <li><a href="#section-2">INTELLECTUAL PROPERTY RIGHTS</a></li>
              <li><a href="#section-3">USER REPRESENTATIONS</a></li>
              <li><a href="#section-4">PRODUCTS</a></li>
              <li><a href="#section-5">PURCHASES AND PAYMENT</a></li>
              <li><a href="#section-6">SUBSCRIPTIONS</a></li>
              <li><a href="#section-7">CANCELLATION</a></li>
              <li><a href="#section-8">PROHIBITED ACTIVITIES</a></li>
              <li><a href="#section-9">USER GENERATED CONTRIBUTIONS</a></li>
              <li><a href="#section-10">CONTRIBUTION LICENCE</a></li>
              <li><a href="#section-11">GUIDELINES FOR REVIEWS</a></li>
              <li><a href="#section-12">MOBILE APPLICATION LICENCE</a></li>
              <li><a href="#section-13">SERVICES MANAGEMENT</a></li>
              <li><a href="#section-14">PRIVACY POLICY</a></li>
              <li><a href="#section-15">TERM AND TERMINATION</a></li>
              <li><a href="#section-16">MODIFICATIONS AND INTERRUPTIONS</a></li>
              <li><a href="#section-17">GOVERNING LAW</a></li>
              <li><a href="#section-18">DISPUTE RESOLUTION</a></li>
              <li><a href="#section-19">CORRECTIONS</a></li>
              <li><a href="#section-20">DISCLAIMER</a></li>
              <li><a href="#section-21">LIMITATIONS OF LIABILITY</a></li>
              <li><a href="#section-22">INDEMNIFICATION</a></li>
              <li><a href="#section-23">USER DATA</a></li>
              <li><a href="#section-24">ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</a></li>
              <li><a href="#section-25">MISCELLANEOUS</a></li>
              <li><a href="#section-26">CONTACT US</a></li>
            </ol>
          </div>

          <h2 id="section-1">1. OUR SERVICES</h2>
          <p>The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation.</p>

          <h2 id="section-2">2. INTELLECTUAL PROPERTY RIGHTS</h2>
          <h3>Our intellectual property</h3>
          <p>We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services.</p>

          <h2 id="section-3">3. USER REPRESENTATIONS</h2>
          <p>By using the Services, you represent and warrant that all registration information you submit will be true, accurate, current, and complete.</p>

          <h2 id="section-4">4. PRODUCTS</h2>
          <p>All products are subject to availability. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.</p>

          <h2 id="section-5">5. PURCHASES AND PAYMENT</h2>
          <p>We accept the following forms of payment: Visa, Mastercard, American Express, Discover, PayPal, and UPI.</p>

          <h2 id="section-6">6. SUBSCRIPTIONS</h2>
          <p>Your subscription will continue and automatically renew unless cancelled. You consent to our charging your payment method on a recurring basis without requiring your prior approval.</p>

          <h2 id="section-7">7. CANCELLATION</h2>
          <p>All purchases are non-refundable. You can cancel your subscription at any time by logging into your account. Your cancellation will take effect at the end of the current paid term.</p>

          <h2 id="section-8">8. PROHIBITED ACTIVITIES</h2>
          <p>You may not access or use the Services for any purpose other than that for which we make the Services available. Prohibited activities include systematically retrieving data to compile a database, defrauding users, and attempting to bypass security measures.</p>

          <h2 id="section-9">9. USER GENERATED CONTRIBUTIONS</h2>
          <p>The Services may invite you to chat, contribute to, or participate in blogs, message boards, and other functionality. Any contributions you make are considered non-confidential and non-proprietary.</p>

          <h2 id="section-10">10. CONTRIBUTION LICENCE</h2>
          <p>By posting your Contributions to any part of the Services, you automatically grant to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, worldwide right and licence to host, use, copy, reproduce, and distribute such Contributions.</p>

          <h2 id="section-11">11. GUIDELINES FOR REVIEWS</h2>
          <p>When posting a review, you must comply with our criteria: firsthand experience, no offensive language, no discriminatory references, and no false/misleading statements.</p>

          <h2 id="section-12">12. MOBILE APPLICATION LICENCE</h2>
          <p>If you access the Services via the App, we grant you a revocable, non-exclusive, non-transferable, limited right to install and use the App on wireless electronic devices owned or controlled by you.</p>

          <h2 id="section-13">13. SERVICES MANAGEMENT</h2>
          <p>We reserve the right to monitor the Services for violations of these Legal Terms and take appropriate legal action against anyone who violates the law or these Legal Terms.</p>

          <h2 id="section-14">14. PRIVACY POLICY</h2>
          <p>We care about data privacy and security. Please review our Privacy Policy. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms.</p>

          <h2 id="section-15">15. TERM AND TERMINATION</h2>
          <p>These Legal Terms shall remain in full force and effect while you use the Services. We reserve the right to deny access to and use of the Services to any person for any reason at our sole discretion.</p>

          <h2 id="section-16">16. MODIFICATIONS AND INTERRUPTIONS</h2>
          <p>We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice.</p>

          <h2 id="section-17">17. GOVERNING LAW</h2>
          <p>These Legal Terms shall be governed by and defined following the laws of India. GlowVita CRM and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction.</p>

          <h2 id="section-18">18. DISPUTE RESOLUTION</h2>
          <p>To expedite resolution and control the cost of any dispute, any claim related to these Legal Terms will first attempt to be resolved informally through good faith negotiations.</p>

          <h2 id="section-19">19. CORRECTIONS</h2>
          <p>There may be information on the Services that contains typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors and to change or update information without prior notice.</p>

          <h2 id="section-20">20. DISCLAIMER</h2>
          <p className="uppercase">THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK.</p>

          <h2 id="section-21">21. LIMITATIONS OF LIABILITY</h2>
          <p className="uppercase">IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES.</p>

          <h2 id="section-22">22. INDEMNIFICATION</h2>
          <p>You agree to defend, indemnify, and hold us harmless from and against any loss, damage, liability, claim, or demand due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms.</p>

          <h2 id="section-23">23. USER DATA</h2>
          <p>We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services. You are solely responsible for all data that you transmit.</p>

          <h2 id="section-24">24. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
          <p>Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications from us.</p>

          <h2 id="section-25">25. MISCELLANEOUS</h2>
          <p>These Legal Terms and any policies or operating rules posted by us on the Services constitute the entire agreement and understanding between you and us.</p>

          <h2 id="section-26">26. CONTACT US</h2>
          <p>In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</p>
          <div className="info-box">
            <p style={{ marginBottom: '0.5rem' }}><strong>GlowVita CRM</strong></p>
            <p style={{ marginBottom: '0.5rem' }}>Nashik, Maharashtra 422009</p>
            <p style={{ marginBottom: '0.5rem' }}>India</p>
            <p style={{ marginBottom: '0.5rem' }}>Phone: <strong>90752 01035</strong></p>
            <p style={{ marginBottom: 0 }}>Email: <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a></p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
