
"use client";

import { PageContainer } from '@repo/ui/page-container';

export default function TermsAndConditionsPage() {
  return (
    <PageContainer>
      <div className="prose dark:prose-invert max-w-4xl mx-auto py-12">
        <h1>Terms and Conditions</h1>
        <p className="lead">Last updated: August 1, 2024</p>
        
        <h2>1. Agreement to Terms</h2>
        <p>By using our Site, you agree to be bound by these Terms and Conditions. If you do not agree, do not use the Site.</p>
        
        <h2>2. Intellectual Property Rights</h2>
        <p>The Site and its original content, features, and functionality are owned by GlowVita Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
        
        <h2>3. User Representations</h2>
        <p>By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms and Conditions.</p>
        
        <h2>4. Prohibited Activities</h2>
        <p>You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
        
        <h2>5. Term and Termination</h2>
        <p>These Terms and Conditions shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS AND CONDITIONS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON.</p>

        {/* 5 more sections */}
        <section></section><section></section><section></section><section></section><section></section>
      </div>
    </PageContainer>
  );
}
