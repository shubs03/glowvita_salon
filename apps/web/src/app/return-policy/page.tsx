
"use client";

import { PageContainer } from '@repo/ui/page-container';

export default function ReturnPolicyPage() {
  return (
    <PageContainer>
      <div className="prose dark:prose-invert max-w-4xl mx-auto py-12">
        <h1>Return Policy</h1>
        <p className="lead">Last updated: August 1, 2024</p>
        
        <h2>1. Returns</h2>
        <p>All returns must be postmarked within thirty (30) days of the purchase date. All returned items must be in new and unused condition, with all original tags and labels attached.</p>
        
        <h2>2. Return Process</h2>
        <p>To return an item, please email customer service at returns@glowvita.com to obtain a Return Merchandise Authorization (RMA) number. After receiving a RMA number, place the item securely in its original packaging and include your proof of purchase, then mail your return to the following address:</p>
        <address>
          GlowVita Inc.<br />
          Attn: Returns<br />
          RMA # [your_rma_number]<br />
          123 Beauty Lane<br />
          Glamour City, 54321
        </address>
        
        <h2>3. Refunds</h2>
        <p>After receiving your return and inspecting the condition of your item, we will process your return or exchange. Please allow at least seven (7) days from the receipt of your item to process your return or exchange. Refunds may take 1-2 billing cycles to appear on your credit card statement, depending on your credit card company.</p>
        
        <h2>4. Exceptions</h2>
        <p>For defective or damaged products, please contact us at the contact details below to arrange a refund or exchange.</p>
        
        <h2>5. Questions</h2>
        <p>If you have any questions concerning our return policy, please contact us at: <a href="mailto:returns@glowvita.com">returns@glowvita.com</a></p>
        
        {/* 5 more sections */}
        <section></section><section></section><section></section><section></section><section></section>
      </div>
    </PageContainer>
  );
}
