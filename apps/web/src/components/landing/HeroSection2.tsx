
"use client";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";

export function HeroSection2() {
  return (
    <section className="sm:py-[100px] py-[60px]">
      <div className="relative overflow-hidden 2xl:max-w-[1440px] xl:max-w-[1240px] lg:max-w-[980px] md:max-w-[700px] max-w-[600px] mx-auto 2xl:px-0 px-6 w-full sm:pt-[150px] pt-[120px] sm:pb-[100px] pb-[50px] rounded-4xl sm:border border-border/20 sm:bg-secondary/30">
        {/* Gradients */}
        <div className="absolute -top-[29%] sm:-top-[50%] left-[7%] sm:-left-[30%] -rotate-[326deg] w-full h-full -z-0 pointer-events-none select-none opacity-50">
          <Image src="https://picsum.photos/seed/gradient6/800/800" alt="gradient" width={800} height={800} />
        </div>
        <div className="absolute -top-[65%] -right-[57%] w-full -rotate-[75deg] h-full -z-0 pointer-events-none select-none opacity-50">
          <Image src="https://picsum.photos/seed/gradient6/800/800" alt="gradient" width={800} height={800} className="rotate-180" />
        </div>

        <div className="relative z-10">
          <div className="space-y-5 text-center">
            <Badge variant="secondary" className="bg-green-100 text-green-700">Keep an eye on your finances</Badge>
            <div className="space-y-4 lg:max-w-[690px] sm:max-w-[500px] max-w-[400px] mx-auto">
              <h1>Cyber security for a safer tomorrow</h1>
              <p>
                Experience AI-powered cybersecurity designed for a safer tomorrow, delivering advanced
                protection against modern cyber threats with unmatched precision.
              </p>
            </div>
            <ul className="flex sm:flex-row flex-col items-center justify-center gap-4 mt-10 lg:mt-14">
              <li className="w-full sm:w-auto">
                <Button asChild size="lg" className="w-full">
                  <Link href="#">Request business call</Link>
                </Button>
              </li>
              <li className="w-full sm:w-auto">
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href="#">14-Days free trial</Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10 mt-16">
          <div className="container mx-auto">
            <div className="flex sm:flex-row flex-col items-center 2xl:gap-10 lg:gap-8 gap-5">
              <div className="space-y-5 2xl:max-w-[389px] sm:max-w-[350px] max-w-full sm:w-full min-[550px]:w-[80%] w-full">
                <figure className="flex items-center gap-4 justify-center bg-background dark:bg-background/50 dark:border-border/50 2xl:px-8 px-6 2xl:py-[22px] py-5 rounded-full border border-border/20">
                  <div className="space-y-1">
                    <div className="2xl:size-16 xl:size-14 size-12 mx-auto flex items-center justify-center rounded-full bg-green-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M5 13.3333V6C5 5.73478 5.10536 5.48043 5.29289 5.29289C5.48043 5.10536 5.73478 5 6 5H26C26.2652 5 26.5196 5.10536 26.7071 5.29289C26.8946 5.48043 27 5.73478 27 6V13.3333C27 23.8353 18.0868 27.3146 16.307 27.9047C16.1081 27.9731 15.8919 27.9731 15.693 27.9047C13.9133 27.3146 5 23.8353 5 13.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                    <p className="text-secondary-foreground font-normal text-sm text-center">Data protection</p>
                  </div>
                  {/* Other icons */}
                </figure>
                <figure className="flex items-center justify-between gap-4 bg-background dark:bg-background/50 dark:border-border/50 2xl:p-8 px-6 2xl:py-8 py-6 rounded-full border border-border/20">
                  {/* Rating */}
                </figure>
              </div>

              <div className="lg:block hidden">
                <figure className="2xl:max-w-[497px] xl:max-w-[420px] max-w-[380px] overflow-hidden rounded-[20px]">
                  <Image src="https://picsum.photos/seed/hero-main/497/480" alt="hero-img" width={497} height={480} className="w-full h-full object-cover" />
                </figure>
              </div>

              <div className="space-y-5 sm:max-w-[389px] max-w-full sm:w-full min-[550px]:w-[80%] w-full">
                <figure className="flex items-center gap-4 sm:justify-center justify-between bg-background dark:bg-background/50 dark:border-border/50 2xl:p-6 p-5 rounded-full border border-border/20">
                  {/* Security incidents */}
                </figure>
                <figure className="flex gap-4">
                  <div className="bg-background dark:bg-background/50 dark:border-border/50 rounded-full 2xl:py-6 px-5 py-4 border border-border/20 flex items-center justify-between 2xl:max-w-[257px] sm:max-w-[240px] max-w-full w-full flex-1">
                    {/* Data encryption */}
                  </div>
                  <div className="max-w-[54px] w-full border rounded-full flex items-end justify-center h-[102px] border-border/20 bg-background dark:bg-background/50 dark:border-border/50">
                    <div className="mb-1">
                      <figure className="size-[42px] rounded-full overflow-hidden">
                        <Image src="https://picsum.photos/seed/avatar2/42/42" alt="avatar" width={42} height={42} />
                      </figure>
                    </div>
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:pt-[100px] pt-[50px] relative z-10">
            <div className="container mx-auto">
                <div className="space-y-5 lg:space-y-8">
                    <p className="text-lg font-normal text-secondary-foreground text-center">
                    Trusted by industry leaders
                    </p>
                    <div className="relative">
                        <div className="absolute left-0 top-0 h-full w-[15%] md:w-[20%] bg-gradient-to-r from-secondary/30 to-transparent z-40"></div>
                        <div className="absolute right-0 top-0 h-full w-[15%] md:w-[20%] bg-gradient-to-l from-secondary/30 to-transparent z-40"></div>
                        <div className="w-full overflow-hidden">
                            <div className="flex w-fit items-center animate-slide hover:[animation-play-state:paused]">
                                {[...Array(10)].map((_, i) => (
                                    <figure key={i} className="min-w-[140px] md:min-w-[201px] mx-4">
                                        <Image src={`https://picsum.photos/seed/logo${i}/201/40`} alt={`Client ${i+1} logo`} width={201} height={40} />
                                    </figure>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
}
