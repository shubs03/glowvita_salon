
"use client";

import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import Image from "next/image";
import Link from 'next/link';

const StatCard = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="space-y-1">
    <div className="2xl:size-16 xl:size-14 size-12 mx-auto flex items-center justify-center rounded-full bg-primary/10">
      {icon}
    </div>
    <p className="text-foreground/80 font-normal text-sm text-center">
      {label}
    </p>
  </div>
);

const TrustReviewCard = () => (
  <figure data-ns-animate="" data-delay="0.8" data-direction="left" data-offset="100" data-spring="true" data-duration="2" data-instant="" className="flex items-center justify-between gap-4 bg-white dark:bg-background-8 dark:border-stroke-6 2xl:p-8 px-6 2xl:py-8 py-6 rounded-full border border-stroke-4">
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <p className="text-secondary text-2xl font-normal dark:text-accent">5.0</p>
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path d="M12.9135 18.3812L17.6419 21.3769C18.2463 21.7598 18.9967 21.1903 18.8173 20.4848L17.4512 15.1108C17.4127 14.9611 17.4173 14.8036 17.4643 14.6564C17.5114 14.5092 17.5991 14.3783 17.7172 14.2787L21.9573 10.7496C22.5144 10.2859 22.2269 9.36127 21.5111 9.31481L15.9738 8.95544C15.8247 8.94479 15.6816 8.89198 15.5613 8.80317C15.441 8.71437 15.3484 8.59321 15.2943 8.45382L13.2292 3.25323C13.173 3.10528 13.0732 2.9779 12.943 2.88802C12.8127 2.79814 12.6582 2.75 12.5 2.75C12.3418 2.75 12.1873 2.79814 12.057 2.88802C11.9268 2.9779 11.827 3.10528 11.7708 3.25323L9.70568 8.45382C9.65157 8.59321 9.55897 8.71437 9.43868 8.80317C9.31838 8.89198 9.17533 8.94479 9.02618 8.95544L3.48894 9.31481C2.77315 9.36127 2.4856 10.2859 3.04272 10.7496L7.28278 14.2787C7.40095 14.3783 7.4886 14.5092 7.53566 14.6564C7.58272 14.8036 7.58727 14.9611 7.5488 15.1108L6.28188 20.0945C6.06667 20.9412 6.96715 21.6246 7.69243 21.1651L12.0865 18.3812C12.21 18.3025 12.3535 18.2607 12.5 18.2607C12.6465 18.2607 12.79 18.3025 12.9135 18.3812Z" fill="#C6F56F"></path>
          </svg>
        </p>
      </div>
      <p className="xl:block sm:hidden block">4k users reviews</p>
    </div>
    <div>
      <Link href="#" className="2xl:size-14 size-12 flex items-center justify-center rounded-full bg-secondary dark:bg-accent relative group overflow-hidden">
        <Image src="https://picsum.photos/seed/arrow-up-right/24/24" alt="Arrow Icon" width={24} height={24} className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 group-hover:-translate-y-12 group-hover:translate-x-8 transition-all duration-500 opacity-100 group-hover:inline dark:hidden" />
        <Image src="https://picsum.photos/seed/arrow-up-right/24/24" alt="Arrow Icon" width={24} height={24} className="absolute translate-y-6 -translate-x-12 transition-all duration-500 group-hover:-translate-x-[0px] group-hover:-translate-y-[7%] group-hover:opacity-100 inline dark:hidden" />
        <Image src="https://picsum.photos/seed/arrow-up-right/24/24" alt="Arrow Icon" width={24} height={24} className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 group-hover:-translate-y-12 group-hover:translate-x-8 transition-all duration-500 opacity-100 group-hover:dark:inline hidden" />
        <Image src="https://picsum.photos/seed/arrow-up-right/24/24" alt="Arrow Icon" width={24} height={24} className="absolute translate-y-6 -translate-x-12 transition-all duration-500 group-hover:-translate-x-[0px] group-hover:-translate-y-[7%] group-hover:opacity-100 dark:inline hidden" />
      </Link>
    </div>
  </figure>
);

const LogoMarquee = () => {
    const logos = [1, 2, 3, 4, 5];
    return (
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-fit animate-slide hover:[animation-play-state:paused]">
                {[...logos, ...logos].map((logo, index) => (
                    <figure key={index} className="min-w-[140px] md:min-w-[201px] mx-4">
                        <Image src={`https://picsum.photos/seed/client-logo-${logo}/201/40`} alt={`Client ${logo} logo`} width={201} height={40} data-ai-hint="company logo" />
                    </figure>
                ))}
            </div>
        </div>
    );
};

export function HeroSection() {
  return (
    <section className="relative z-0 bg-background-3 dark:bg-background-7 py-[60px] sm:py-[100px]">
      <div className="relative z-10 mx-auto w-full max-w-[600px] rounded-4xl border border-stroke-1 bg-background-2 px-6 pt-[120px] pb-[50px] dark:border-stroke-5 dark:bg-background-5 sm:border sm:bg-background-2 sm:pt-[150px] sm:pb-[100px] md:max-w-[700px] lg:max-w-[980px] xl:max-w-[1240px] 2xl:max-w-[1440px] 2xl:px-0">
        <div className="pointer-events-none absolute -top-[29%] left-[7%] -z-0 h-full w-full -rotate-[326deg] select-none sm:-top-[50%] sm:-left-[30%]">
          <Image src="https://picsum.photos/seed/gradient-6/800/800" alt="gradient" width={800} height={800} />
        </div>
        <div className="pointer-events-none absolute -top-[65%] -right-[57%] -z-0 h-full w-full -rotate-[75deg] select-none">
          <Image src="https://picsum.photos/seed/gradient-7/800/800" alt="gradient" width={800} height={800} className="rotate-180" />
        </div>
        
        <div className="relative z-10 mx-auto mb-[100px] space-y-10 lg:mb-[150px] lg:space-y-[70px] xl:mb-[220px]">
          <div className="relative z-10">
            <div className="space-y-5 text-center">
              <Badge variant="secondary" className="bg-green-100 text-green-700">Keep an eye on your finances</Badge>
              <div className="mx-auto max-w-[400px] space-y-4 sm:max-w-[500px] lg:max-w-[690px]">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Cyber security for a safer tomorrow</h1>
                <p>Experience AI-powered cybersecurity designed for a safer tomorrow, delivering advanced protection against modern cyber threats with unmatched precision.</p>
              </div>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:mt-14">
                <Button size="lg" className="w-[90%] sm:w-auto">Request business call</Button>
                <Button size="lg" variant="outline" className="w-[90%] sm:w-auto">14-Days free trial</Button>
              </div>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex flex-col items-center gap-5 sm:flex-row 2xl:gap-10 lg:gap-8">
                <div className="w-full space-y-5 sm:max-w-[350px] min-[550px]:w-[80%] 2xl:max-w-[389px]">
                  <figure className="flex items-center justify-center gap-4 rounded-full border border-stroke-4 bg-white p-5 dark:border-stroke-6 dark:bg-background-8 2xl:px-8 2xl:py-[22px]">
                    <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M5 13.3333V6C5 5.73478 5.10536 5.48043 5.29289 5.29289C5.48043 5.10536 5.73478 5 6 5H26C26.2652 5 26.5196 5.10536 26.7071 5.29289C26.8946 5.48043 27 5.73478 27 6V13.3333C27 23.8353 18.0868 27.3146 16.307 27.9047C16.1081 27.9731 15.8919 27.9731 15.693 27.9047C13.9133 27.3146 5 23.8353 5 13.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>} label="Data protection" />
                    <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M21.9996 16C22.0045 19.9099 21.2429 23.7828 19.7578 27.3997" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M20.4694 11.9996C19.6592 11.094 18.5932 10.4557 17.4124 10.1692C16.2315 9.88267 14.9915 9.96143 13.8564 10.3951C12.7213 10.8287 11.7446 11.5967 11.0555 12.5976C10.3665 13.5984 9.99752 14.7849 9.99751 16C10.0022 19.0494 9.22865 22.0496 7.75 24.7165" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12 4.68285C13.8103 4.04483 15.7471 3.85003 17.6481 4.1148C19.5492 4.37956 21.3591 5.09617 22.9261 6.20456C24.4932 7.31295 25.7717 8.78082 26.6545 10.4852C27.5373 12.1895 27.9987 14.0806 28.0001 16C28.0017 18.6916 27.7025 21.3749 27.108 23.9999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M2.91406 21.003C3.63335 19.4344 4.00455 17.7287 4.00215 16.003C4.00024 14.3143 4.35565 12.6443 5.04504 11.1028C5.73443 9.56123 6.74219 8.18298 8.00212 7.05859" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M13.8207 26C13.5671 26.5524 13.2936 27.0931 13 27.6223" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15.9983 16C15.9998 18.0239 15.7457 20.0398 15.2422 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>} label="Access control" />
                    <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none"><path d="M16.5 20C17.8807 20 19 18.8807 19 17.5C19 16.1193 17.8807 15 16.5 15C15.1193 15 14 16.1193 14 17.5C14 18.8807 15.1193 20 16.5 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M16.5 20V23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M26.5 11H6.5C5.94772 11 5.5 11.4477 5.5 12V26C5.5 26.5523 5.94772 27 6.5 27H26.5C27.0523 27 27.5 26.5523 27.5 26V12C27.5 11.4477 27.0523 11 26.5 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12 11V6.5C12 5.30653 12.4741 4.16193 13.318 3.31802C14.1619 2.47411 15.3065 2 16.5 2C17.6935 2 18.8381 2.47411 19.682 3.31802C20.5259 4.16193 21 5.30653 21 6.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>} label="ID security" />
                  </figure>
                  <TrustReviewCard />
                </div>
                <div className="hidden hero-box-2 lg:block">
                  <figure className="overflow-hidden rounded-[20px] 2xl:max-w-[497px] xl:max-w-[420px] max-w-[380px]">
                    <Image src="https://picsum.photos/seed/hero-img/497/572" alt="hero-img" width={497} height={572} className="size-full object-cover" data-ai-hint="futuristic dashboard" />
                  </figure>
                </div>
                <div className="w-full space-y-5 sm:max-w-[389px] min-[550px]:w-[80%]">
                  <figure className="flex items-center justify-between gap-4 rounded-full border border-stroke-4 bg-white p-5 dark:border-stroke-6 dark:bg-background-8 2xl:p-6">
                    <div>
                      <p className="xl:text-tagline-1 text-tagline-2">Security incidents</p>
                      <p className="font-normal text-secondary dark:text-accent 2xl:text-heading-6 text-tagline-1 xl:block sm:hidden block">Neuttralized</p>
                    </div>
                    <div>
                      <figure><Image src="https://picsum.photos/seed/hero-chart/100/40" alt="hero chart" width={100} height={40} data-ai-hint="chart graph" /></figure>
                    </div>
                  </figure>
                  <figure className="flex gap-4">
                    <div className="flex flex-1 items-center justify-between rounded-full border border-stroke-4 bg-white p-4 py-4 dark:border-stroke-6 dark:bg-background-8 2xl:py-6 px-5 sm:max-w-[240px] 2xl:max-w-[257px]">
                      <div>
                        <p className="xl:text-tagline-1 text-tagline-2">Data encryption</p>
                        <p className="font-medium text-secondary dark:text-accent xl:text-heading-6 text-tagline-1 lg:block sm:hidden block">55.00%</p>
                      </div>
                      <div>
                        <div className="flex size-[52px] items-center justify-center rounded-full bg-secondary">
                          <div className="flex items-end gap-1.5"><div className="h-[18px] w-[3px] rounded-full bg-white"></div><div className="h-[26px] w-[3px] rounded-full bg-white"></div><div className="h-3 w-[3px] rounded-full bg-white"></div></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex h-[102px] w-full max-w-[54px] items-end justify-center rounded-full border border-stroke-4 bg-white dark:border-stroke-6 dark:bg-background-8">
                      <div className="mb-1">
                        <figure className="size-[42px] overflow-hidden rounded-full"><Image src="https://picsum.photos/seed/avatar2/42/42" alt="avatar" width={42} height={42} className="h-full w-full bg-primary-500" data-ai-hint="woman portrait" /></figure>
                      </div>
                    </div>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 pt-[50px] lg:pt-[100px]">
          <div className="mx-auto max-w-7xl px-4">
            <div className="space-y-5 lg:space-y-8">
              <p className="text-center font-normal text-secondary dark:text-accent text-lg">Trusted by industry leaders</p>
              <LogoMarquee />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```