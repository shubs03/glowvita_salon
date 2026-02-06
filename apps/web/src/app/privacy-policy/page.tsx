
"use client";

import { PageContainer } from '@repo/ui/page-container';

export default function PrivacyPolicyPage() {
  return (
    <PageContainer padding="none">
      {/* Section 1: Hero */}
      <section className="py-20 md:py-24 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Your privacy is important to us. This policy outlines how we handle your personal information.
          </p>
        </div>
      </section>

      {/* Section 2: Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <style jsx>{`
          .privacy-content h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: hsl(var(--foreground));
            margin-top: 3rem;
            margin-bottom: 1.25rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid hsl(var(--border));
          }
          
          .privacy-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: hsl(var(--foreground));
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          
          .privacy-content p {
            margin-bottom: 1rem;
            line-height: 1.75;
            color: hsl(var(--foreground) / 0.9);
          }
          
          .privacy-content ul, .privacy-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
          }
          
          .privacy-content li {
            margin-bottom: 0.75rem;
            line-height: 1.75;
            color: hsl(var(--foreground) / 0.9);
          }
          
          .privacy-content a {
            color: hsl(var(--primary));
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          
          .privacy-content a:hover {
            color: hsl(var(--primary) / 0.8);
          }
          
          .privacy-content strong {
            font-weight: 600;
            color: hsl(var(--foreground));
          }
          
          .privacy-content em {
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
        `}</style>
        
        <div className="privacy-content">
        <p className="lead-text">Last updated: April 1, 2025</p>
        
        <p>
          This privacy notice for <strong>glowvitasalon</strong> (&apos;<strong>Company</strong>&apos;, &apos;<strong>we</strong>&apos;, &apos;<strong>us</strong>&apos;, or &apos;<strong>our</strong>&apos;), 
          describes how and why we might collect, store, use, and/or share (&apos;<strong>process</strong>&apos;) your information when you use our services (&apos;<strong>Services</strong>&apos;), such as when you:
        </p>
        <ul>
          <li>Download and use our mobile application (glowvitasalon), or</li>
          <li>Engage with us in other related ways, including any sales, marketing, or events</li>
        </ul>
        <div className="summary-box">
          <p className="question-text">Questions or concerns?</p>
          <p style={{ marginBottom: 0 }}>
            Reading this privacy notice will help you understand your privacy rights and choices. 
            If you do not agree with our policies and practices, please do not use our Services. 
            If you still have any questions or concerns, please contact us at <a href="mailto:glowvitasalon@gmail.com">glowvitasalon@gmail.com</a>.
          </p>
        </div>

        <h2>SUMMARY OF KEY POINTS</h2>
        <p>
          <strong><em>This summary provides key points from our privacy notice, but you can find out more details about any of these topics by using our table of contents below to find the section you are looking for.</em></strong>
        </p>
        <div className="space-y-4">
          <div>
            <p className="question-text">What personal information do we process?</p>
            <p>When you visit, use, or navigate our Services, we may process personal information depending on how you interact with glowvitasalon and the Services, the choices you make, and the products and features you use.</p>
          </div>
          <div>
            <p className="question-text">Do we process any sensitive personal information?</p>
            <p>We do not process sensitive personal information.</p>
          </div>
          <div>
            <p className="question-text">Do we receive any information from third parties?</p>
            <p>We do not receive any information from third parties.</p>
          </div>
          <div>
            <p className="question-text">How do we process your information?</p>
            <p>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</p>
          </div>
          <div>
            <p className="question-text">In what situations and with which parties do we share personal information?</p>
            <p>We may share information in specific situations and with specific third parties.</p>
          </div>
          <div>
            <p className="question-text">How do we keep your information safe?</p>
            <p>We have organisational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>
          </div>
          <div>
            <p className="question-text">What are your rights?</p>
            <p>Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</p>
          </div>
          <div>
            <p className="question-text">How do you exercise your rights?</p>
            <p>The easiest way to exercise your rights is by visiting <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a>, or by contacting us.</p>
          </div>
        </div>

        <div className="toc-box">
          <h2 id="toc" style={{ marginTop: 0 }}>TABLE OF CONTENTS</h2>
          <ol>
            <li><a href="#infocollect">WHAT INFORMATION DO WE COLLECT?</a></li>
            <li><a href="#infouse">HOW DO WE PROCESS YOUR INFORMATION?</a></li>
            <li><a href="#whoshare">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
            <li><a href="#cookies">DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></li>
            <li><a href="#inforetain">HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
            <li><a href="#infosafe">HOW DO WE KEEP YOUR INFORMATION SAFE?</a></li>
            <li><a href="#privacyrights">WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
            <li><a href="#DNT">CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
            <li><a href="#caresidents">DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a></li>
            <li><a href="#policyupdates">DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
            <li><a href="#contact">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
            <li><a href="#request">HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></li>
          </ol>
        </div>

        <h2 id="infocollect">1. WHAT INFORMATION DO WE COLLECT?</h2>
        
        <h3>Personal information you disclose to us</h3>
        <p><strong><em>In Short:</em></strong> <em>We collect personal information that you provide to us.</em></p>
        <p>
          We collect personal information that you voluntarily provide to us when you register on the Services, 
          express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, 
          or otherwise when you contact us.
        </p>
        <p><strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:</p>
        <ul>
          <li>names</li>
          <li>phone numbers</li>
          <li>email addresses</li>
          <li>mailing addresses</li>
          <li>usernames</li>
          <li>passwords</li>
        </ul>
        <p><strong>Sensitive Information.</strong> We do not process sensitive information.</p>
        <p><strong>Payment Data.</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is stored by Razor Pay.</p>
        <p><strong>Application Data.</strong> If you use our application(s), we also may collect the following information if you choose to provide us with access or permission:</p>
        <ul>
          <li><em>Geolocation Information.</em> We may request access or permission to track location-based information from your mobile device, either continuously or while you are using our mobile application(s), to provide certain location-based services. If you wish to change our access or permissions, you may do so in your device&apos;s settings.</li>
          <li><em>Mobile Device Access.</em> We may request access or permission to certain features from your mobile device, including your mobile device&apos;s camera, storage, and other features. If you wish to change our access or permissions, you may do so in your device&apos;s settings.</li>
        </ul>
        <p>This information is primarily needed to maintain the security and operation of our application(s), for troubleshooting, and for our internal analytics and reporting purposes.</p>
        <p>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</p>

        <h2 id="infouse">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
        <p><strong><em>In Short:</em></strong> <em>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</em></p>
        <p><strong>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</strong></p>
        <ul>
          <li>To facilitate account creation and authentication and otherwise manage user accounts</li>
          <li>To deliver and facilitate delivery of services to the user</li>
          <li>To respond to user inquiries/offer support to users</li>
          <li>To send administrative information to you</li>
          <li>To fulfill and manage your orders</li>
          <li>To enable user-to-user communications</li>
          <li>To request feedback</li>
          <li>To send you marketing and promotional communications</li>
          <li>To protect our Services</li>
          <li>To identify usage trends</li>
          <li>To save or protect an individual&apos;s vital interest</li>
        </ul>

        <h2 id="whoshare">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
        <p><strong><em>In Short:</em></strong> <em>We may share information in specific situations described in this section and/or with the following third parties.</em></p>
        <p>We may need to share your personal information in the following situations:</p>
        <ul>
          <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
          <li><strong>When we use Google Maps Platform APIs.</strong> We may share your information with certain Google Maps Platform APIs (e.g., Google Maps API, Places API).</li>
          <li><strong>Business Partners.</strong> We may share your information with our business partners to offer you certain products, services, or promotions.</li>
        </ul>

        <h2 id="cookies">4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
        <p><strong><em>In Short:</em></strong> <em>We may use cookies and other tracking technologies to collect and store your information.</em></p>
        <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.</p>

        <h2 id="inforetain">5. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
        <p><strong><em>In Short:</em></strong> <em>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.</em></p>
        <p>
          We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, 
          unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
        </p>
        <p>
          When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise such information, 
          or, if this is not possible (for example, because your personal information has been stored in backup archives), 
          then we will securely store your personal information and isolate it from any further processing until deletion is possible.
        </p>

        <h2 id="infosafe">6. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
        <p><strong><em>In Short:</em></strong> <em>We aim to protect your personal information through a system of organisational and technical security measures.</em></p>
        <p>
          We have implemented appropriate and reasonable technical and organisational security measures designed to protect the security of any personal information we process. 
          However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, 
          so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.
        </p>

        <h2 id="privacyrights">7. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
        <p><strong><em>In Short:</em></strong> <em>You may review, change, or terminate your account at any time.</em></p>
        <p>
          If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority.
        </p>
        <div>
          <p className="question-text">Withdrawing your consent:</p>
          <p>If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us.</p>
        </div>
        <div>
          <p className="question-text">Account Information:</p>
          <p>If you would at any time like to review or change the information in your account or terminate your account, you can log in to your account settings and update your user account.</p>
        </div>

        <h2 id="DNT">8. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
        <p>
          Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (&apos;DNT&apos;) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. 
          At this stage no uniform technology standard for recognising and implementing DNT signals has been finalised. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.
        </p>

        <h2 id="caresidents">9. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
        <p><strong><em>In Short:</em></strong> <em>Yes, if you are a resident of California, you are granted specific rights regarding access to your personal information.</em></p>
        <p>
          California Civil Code Section 1798.83, also known as the &apos;Shine The Light&apos; law, permits our users who are California residents to request and obtain from us, once a year and free of charge, 
          information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year.
        </p>

        <h2 id="policyupdates">10. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
        <p><strong><em>In Short:</em></strong> <em>Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></p>
        <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated &apos;Revised&apos; date and the updated version will be effective as soon as it is accessible.</p>

        <h2 id="contact">11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
        <p>If you have questions or comments about this notice, you may email us at <a href="mailto:glowvitasalon@gmail.com">glowvitasalon@gmail.com</a> or contact us at <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a>.</p>

        <h2 id="request">12. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
        <p>
          Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, 
          change that information, or delete it. To request to review, update, or delete your personal information, please contact us at <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a>.
        </p>
        </div>
      </div>
    </PageContainer>
  );
}
