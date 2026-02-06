
"use client";

import { PageContainer } from '@repo/ui/page-container';

export default function TermsAndConditionsPage() {
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
        <p className="lead-text">Last updated: April 1, 2025</p>

        <h2>AGREEMENT TO OUR LEGAL TERMS</h2>
        
        <p>
          We are <strong>glowvitasalon</strong> (&apos;<strong>Company</strong>&apos;, &apos;<strong>we</strong>&apos;, &apos;<strong>us</strong>&apos;, or &apos;<strong>our</strong>&apos;), 
          a company registered in India at Nashik, Nashik, Maharashtra 422009.
        </p>

        <p>
          We operate the mobile application <strong>glowvitasalon</strong> (the &apos;<strong>App</strong>&apos;), 
          as well as any other related products and services that refer or link to these legal terms (the &apos;<strong>Legal Terms</strong>&apos;) (collectively, the &apos;<strong>Services</strong>&apos;).
        </p>

        <div className="info-box">
          <p style={{ marginBottom: 0 }}>
            You can contact us by phone at <strong>80874 35747</strong>, email at <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a>, 
            or by mail to Nashik, Nashik, Maharashtra 422009.
          </p>
        </div>

        <p>
          These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&apos;<strong>you</strong>&apos;), 
          and <strong>glowvitasalon</strong>, concerning your access to and use of the Services. You agree that by accessing the Services, 
          you have read, understood, and agreed to be bound by all of these Legal Terms. 
          <strong> IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
        </p>

        <p>
          We will provide you with prior notice of any scheduled changes to the Services you are using. The modified Legal Terms will become effective upon posting or notifying you by 
          <a href="mailto:support@glowvitasalon.com"> support@glowvitasalon.com</a>, as stated in the email message. 
          By continuing to use the Services after the effective date of any changes, you agree to be bound by the modified terms.
        </p>

        <div className="summary-box">
          <p className="question-text">Age Restriction</p>
          <p style={{ marginBottom: 0 }}>
            The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.
          </p>
        </div>

        <p>We recommend that you print a copy of these Legal Terms for your records.</p>

        <div className="toc-box">
          <h2 id="toc" style={{ marginTop: 0 }}>TABLE OF CONTENTS</h2>
          <ol>
            <li><a href="#services">OUR SERVICES</a></li>
            <li><a href="#ip">INTELLECTUAL PROPERTY RIGHTS</a></li>
            <li><a href="#userreps">USER REPRESENTATIONS</a></li>
            <li><a href="#products">PRODUCTS</a></li>
            <li><a href="#purchases">PURCHASES AND PAYMENT</a></li>
            <li><a href="#subscriptions">SUBSCRIPTIONS</a></li>
            <li><a href="#cancel">CANCELLATION</a></li>
            <li><a href="#prohibited">PROHIBITED ACTIVITIES</a></li>
            <li><a href="#ugc">USER GENERATED CONTRIBUTIONS</a></li>
            <li><a href="#license">CONTRIBUTION LICENCE</a></li>
            <li><a href="#reviews">GUIDELINES FOR REVIEWS</a></li>
            <li><a href="#mobile">MOBILE APPLICATION LICENCE</a></li>
            <li><a href="#sitemanage">SERVICES MANAGEMENT</a></li>
            <li><a href="#ppyes">PRIVACY POLICY</a></li>
            <li><a href="#terms">TERM AND TERMINATION</a></li>
            <li><a href="#modifications">MODIFICATIONS AND INTERRUPTIONS</a></li>
            <li><a href="#law">GOVERNING LAW</a></li>
            <li><a href="#disputes">DISPUTE RESOLUTION</a></li>
            <li><a href="#corrections">CORRECTIONS</a></li>
            <li><a href="#disclaimer">DISCLAIMER</a></li>
            <li><a href="#liability">LIMITATIONS OF LIABILITY</a></li>
            <li><a href="#indemnification">INDEMNIFICATION</a></li>
            <li><a href="#userdata">USER DATA</a></li>
            <li><a href="#electronic">ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</a></li>
            <li><a href="#misc">MISCELLANEOUS</a></li>
            <li><a href="#contact">CONTACT US</a></li>
          </ol>
        </div>

        <h2 id="services">1. OUR SERVICES</h2>
        <p>
          The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country 
          where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country.
        </p>

        <h2 id="ip">2. INTELLECTUAL PROPERTY RIGHTS</h2>
        
        <h3>Our intellectual property</h3>
        <p>
          We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, 
          website designs, audio, video, text, photographs, and graphics in the Services (collectively, the &apos;<strong>Content</strong>&apos;), 
          as well as the trademarks, service marks, and logos contained therein (the &apos;<strong>Marks</strong>&apos;).
        </p>
        <p>
          Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) 
          and treaties in the United States and around the world.
        </p>
        <p>
          The Content and Marks are provided in or through the Services &apos;AS IS&apos; for your personal, non-commercial use or internal business purpose only.
        </p>

        <h3>Your use of our Services</h3>
        <p>Subject to your compliance with these Legal Terms, including the &apos;PROHIBITED ACTIVITIES&apos; section below, we grant you a non-exclusive, non-transferable, revocable licence to:</p>
        <ul>
          <li>access the Services; and</li>
          <li>download or print a copy of any portion of the Content to which you have properly gained access</li>
        </ul>
        <p>solely for your personal, non-commercial use or internal business purpose.</p>
        <p>
          Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, 
          republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, 
          without our express prior written permission.
        </p>
        <p>
          If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, 
          please address your request to: <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a>. 
          If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, 
          you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, 
          reproducing, or displaying our Content.
        </p>
        <p>We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.</p>
        <p>Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.</p>

        <h3>Your submissions</h3>
        <p>
          Please review this section and the &apos;PROHIBITED ACTIVITIES&apos; section carefully prior to using our Services to understand the (a) rights you give us 
          and (b) obligations you have when you post or upload any content through the Services.
        </p>

        <h2 id="userreps">3. USER REPRESENTATIONS</h2>
        <p>By using the Services, you represent and warrant that:</p>
        <ul>
          <li>All registration information you submit will be true, accurate, current, and complete</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary</li>
          <li>You have the legal capacity and you agree to comply with these Legal Terms</li>
          <li>You are not a minor in the jurisdiction in which you reside</li>
          <li>You will not access the Services through automated or non-human means, whether through a bot, script or otherwise</li>
          <li>You will not use the Services for any illegal or unauthorised purpose</li>
          <li>Your use of the Services will not violate any applicable law or regulation</li>
        </ul>
        <p>If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).</p>

        <h2 id="products">4. PRODUCTS</h2>
        <p>
          All products are subject to availability. We reserve the right to discontinue any products at any time for any reason. 
          Prices for all products are subject to change.
        </p>

        <h2 id="purchases">5. PURCHASES AND PAYMENT</h2>
        <p>We accept the following forms of payment:</p>
        <ul>
          <li>Visa</li>
          <li>Mastercard</li>
          <li>American Express</li>
          <li>Discover</li>
          <li>PayPal</li>
          <li>UPI</li>
        </ul>
        <p>
          You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. 
          You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, 
          so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. 
          We may change prices at any time. All payments shall be in <strong>Rupees</strong>.
        </p>
        <p>
          You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, 
          and you authorise us to charge your chosen payment provider for any such amounts upon placing your order.
        </p>
        <p>
          We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, 
          per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, 
          and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgement, 
          appear to be placed by dealers, resellers, or distributors.
        </p>

        <h2 id="subscriptions">6. SUBSCRIPTIONS</h2>
        <p>
          Your subscription will continue and automatically renew unless cancelled. You consent to our charging your payment method on a recurring basis 
          without requiring your prior approval for each recurring charge, until such time as you cancel the applicable order.
        </p>

        <h2 id="cancel">7. CANCELLATION</h2>
        <p>
          All purchases are non-refundable. You can cancel your subscription at any time by logging into your account. 
          Your cancellation will take effect at the end of the current paid term.
        </p>

        <h2 id="prohibited">8. PROHIBITED ACTIVITIES</h2>
        <p>You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavours except those that are specifically endorsed or approved by us.</p>
        <p>As a user of the Services, you agree not to:</p>
        <ul>
          <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us</li>
          <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords</li>
          <li>Circumvent, disable, or otherwise interfere with security-related features of the Services</li>
          <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services</li>
          <li>Use any information obtained from the Services in order to harass, abuse, or harm another person</li>
          <li>Make improper use of our support services or submit false reports of abuse or misconduct</li>
          <li>Use the Services in a manner inconsistent with any applicable laws or regulations</li>
          <li>Engage in unauthorised framing of or linking to the Services</li>
          <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material that interferes with any party&apos;s uninterrupted use and enjoyment of the Services</li>
          <li>Engage in any automated use of the system, such as using scripts to send comments or messages</li>
          <li>Delete the copyright or other proprietary rights notice from any Content</li>
          <li>Attempt to impersonate another user or person or use the username of another user</li>
          <li>Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism</li>
          <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services</li>
          <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you</li>
          <li>Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services</li>
          <li>Copy or adapt the Services&apos; software, including but not limited to Flash, PHP, HTML, JavaScript, or other code</li>
          <li>Decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services</li>
          <li>Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system</li>
          <li>Use the Services as part of any effort to compete with us or otherwise use the Services for any revenue-generating endeavour or commercial enterprise</li>
        </ul>

        <h2 id="ugc">9. USER GENERATED CONTRIBUTIONS</h2>
        <p>
          The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, 
          and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services.
        </p>

        <h2 id="license">10. CONTRIBUTION LICENCE</h2>
        <p>
          By posting your Contributions to any part of the Services, you automatically grant, and you represent and warrant that you have the right to grant, 
          to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and licence to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions.
        </p>

        <h2 id="reviews">11. GUIDELINES FOR REVIEWS</h2>
        <p>We may provide you areas on the Services to leave reviews or ratings. When posting a review, you must comply with the following criteria:</p>
        <ul>
          <li>You should have firsthand experience with the person/entity being reviewed</li>
          <li>Your reviews should not contain offensive profanity, or abusive, racist, offensive, or hateful language</li>
          <li>Your reviews should not contain discriminatory references based on religion, race, gender, national origin, age, marital status, sexual orientation, or disability</li>
          <li>Your reviews should not contain references to illegal activity</li>
          <li>You should not be affiliated with competitors if posting negative reviews</li>
          <li>You should not make any conclusions as to the legality of conduct</li>
          <li>You may not post any false or misleading statements</li>
          <li>You may not organise a campaign encouraging others to post reviews, whether positive or negative</li>
        </ul>

        <h2 id="mobile">12. MOBILE APPLICATION LICENCE</h2>
        
        <h3>Use Licence</h3>
        <p>
          If you access the Services via the App, then we grant you a revocable, non-exclusive, non-transferable, limited right to install and use the App 
          on wireless electronic devices owned or controlled by you, and to access and use the App on such devices strictly in accordance with the terms and conditions of this mobile application licence.
        </p>

        <h3>Terms Applicable to Apple Store</h3>
        <p>The following terms apply when you use the App obtained from the Apple Store:</p>
        <ul>
          <li>The licence granted to you is limited to a non-transferable licence to use the application on an iOS product that you own or control</li>
          <li>We are responsible for providing any maintenance and support services with respect to the App</li>
          <li>In the event of any failure of the App to conform to any applicable warranty, you may notify Apple</li>
        </ul>

        <h2 id="sitemanage">13. SERVICES MANAGEMENT</h2>
        <p>We reserve the right, but not the obligation, to:</p>
        <ul>
          <li>Monitor the Services for violations of these Legal Terms</li>
          <li>Take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms</li>
          <li>Refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof</li>
          <li>Remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems</li>
          <li>Otherwise manage the Services in a manner designed to protect our rights and property</li>
        </ul>

        <h2 id="ppyes">14. PRIVACY POLICY</h2>
        <p>
          We care about data privacy and security. Please review our Privacy Policy. By using the Services, you agree to be bound by our Privacy Policy, 
          which is incorporated into these Legal Terms. Please be advised the Services are hosted in India.
        </p>

        <h2 id="terms">15. TERM AND TERMINATION</h2>
        <p>
          These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, 
          WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), 
          TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS 
          OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, 
          WITHOUT WARNING, IN OUR SOLE DISCRETION.
        </p>

        <h2 id="modifications">16. MODIFICATIONS AND INTERRUPTIONS</h2>
        <p>
          We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. 
          However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.
        </p>
        <p>
          We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, 
          resulting in interruptions, delays, or errors.
        </p>

        <h2 id="law">17. GOVERNING LAW</h2>
        <p>
          These Legal Terms shall be governed by and defined following the laws of India. glowvitasalon and yourself irrevocably consent that the courts of India 
          shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.
        </p>

        <h2 id="disputes">18. DISPUTE RESOLUTION</h2>
        
        <h3>Informal Negotiations</h3>
        <p>
          To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms, 
          any dispute arising out of or in connection with these Legal Terms will first attempt to be resolved informally through good faith negotiations.
        </p>

        <h2 id="corrections">19. CORRECTIONS</h2>
        <p>
          There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. 
          We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
        </p>

        <h2 id="disclaimer">20. DISCLAIMER</h2>
        <p className="uppercase">
          THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. 
          TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, 
          INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. 
          WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES&apos; CONTENT OR THE CONTENT OF ANY WEBSITES OR 
          MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, 
          (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, 
          (3) ANY UNAUTHORISED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, 
          (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED 
          TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND 
          INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. 
          WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, 
          ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY 
          BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. 
          AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGEMENT AND EXERCISE CAUTION WHERE APPROPRIATE.
        </p>

        <h2 id="liability">21. LIMITATIONS OF LIABILITY</h2>
        <p className="uppercase">
          IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, 
          SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, 
          EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>

        <h2 id="indemnification">22. INDEMNIFICATION</h2>
        <p>
          You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, 
          from and against any loss, damage, liability, claim, or demand, including reasonable attorneys&apos; fees and expenses, made by any third party due to or arising out of: 
          (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; 
          (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of 
          the Services with whom you connected via the Services.
        </p>

        <h2 id="userdata">23. USER DATA</h2>
        <p>
          We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. 
          Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services.
        </p>

        <h2 id="electronic">24. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
        <p>
          Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, 
          and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, 
          satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, 
          AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. 
          You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature 
          or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.
        </p>

        <h2 id="misc">25. MISCELLANEOUS</h2>
        <p>
          These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. 
          Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. 
          These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. 
          We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. 
          If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision 
          is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. 
          There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. 
          You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defences you may have based on 
          the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.
        </p>

        <h2 id="contact">26. CONTACT US</h2>
        <p>In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</p>
        <div className="info-box">
          <p style={{ marginBottom: '0.5rem' }}><strong>glowvitasalon</strong></p>
          <p style={{ marginBottom: '0.5rem' }}>Nashik, Nashik</p>
          <p style={{ marginBottom: '0.5rem' }}>Maharashtra 422009</p>
          <p style={{ marginBottom: '0.5rem' }}>India</p>
          <p style={{ marginBottom: '0.5rem' }}>Phone: <strong>80874 35747</strong></p>
          <p style={{ marginBottom: 0 }}>Email: <a href="mailto:support@glowvitasalon.com">support@glowvitasalon.com</a></p>
        </div>
        </div>
      </div>
    </PageContainer>
  );
}
