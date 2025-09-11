
"use client";

import Image from 'next/image';
import { Button } from '@repo/ui/button';

export function KeyFeatures() {
  return (
    <section className="lg:py-[100px] py-[60px] bg-background-2 dark:bg-background-5">
      <div className="main-container">
        <div className="lg:max-w-[668px] md:max-w-[550px] max-w-[400px] mx-auto space-y-5 mb-10 md:mb-[70px] text-center">
          <span className="badge badge-green">More features</span>
          <h2>Managing your money has never been easier</h2>
        </div>
        <div className="mb-12 sm:mb-16 md:mb-[100px]">
          <div className="grid grid-cols-12 lg:gap-[42px] md:gap-8 gap-y-11">
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <div className="space-y-3">
                <div className="border border-stroke-4 bg-background-1 dark:bg-background-6 dark:border-stroke-6 p-2.5 rounded-[20px]">
                  <figure className="lg:max-w-[402px] md:max-w-full w-full">
                    <Image src="https://picsum.photos/seed/web-security/402/300" alt="web security" width={402} height={300} className="w-full h-full rounded-[10px]" data-ai-hint="web security interface" />
                  </figure>
                </div>
                <div className="space-y-1 pl-2.5">
                  <h3 className="text-heading-6 sm:text-heading-5 font-normal">Web security</h3>
                  <p className="text-lg text-muted-foreground">Safeguard websites from cyber threats, malware, and unauthorized access.</p>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <div className="space-y-3">
                <div className="border border-stroke-4 bg-background-1 dark:bg-background-6 dark:border-stroke-6 p-2.5 rounded-[20px]">
                  <figure className="lg:max-w-[402px] md:max-w-full w-full">
                    <Image src="https://picsum.photos/seed/analytics/402/300" alt="software analytics" width={402} height={300} className="w-full h-full rounded-[10px]" data-ai-hint="software analytics dashboard" />
                  </figure>
                </div>
                <div className="space-y-1 pl-2.5">
                  <h3 className="text-heading-6 sm:text-heading-5 font-normal">Software analytics</h3>
                  <p className="text-lg text-muted-foreground">Ensure your applications and systems are always up-to-date and secure.</p>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4 md:col-start-4 lg:col-start-auto">
              <div className="space-y-3">
                <div className="border border-stroke-4 bg-background-1 dark:bg-background-6 dark:border-stroke-6 p-2.5 rounded-[20px]">
                  <figure className="lg:max-w-[402px] md:max-w-full w-full">
                     <Image src="https://picsum.photos/seed/payment-security/402/300" alt="payment security" width={402} height={300} className="w-full h-full rounded-[10px]" data-ai-hint="payment security" />
                  </figure>
                </div>
                <div className="space-y-1 pl-2.5">
                  <h3 className="text-heading-6 sm:text-heading-5 font-normal">Payment security</h3>
                  <p className="text-lg text-muted-foreground">End-to-end encryption and fraud prevention for online transactions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <Button variant="secondary" size="lg">Explore all</Button>
        </div>
      </div>
    </section>
  );
}
