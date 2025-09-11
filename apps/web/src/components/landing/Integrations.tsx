
"use client";

import Image from 'next/image';
import { Badge } from '@repo/ui/badge';

const logos1 = [
  { src: 'https://picsum.photos/seed/google/48/48', alt: 'Google logo', hint: 'brand logo' },
  { src: 'https://picsum.photos/seed/slack/48/48', alt: 'Slack logo', hint: 'brand logo' },
  { src: 'https://picsum.photos/seed/confluence/48/48', alt: 'Confluence logo', hint: 'brand logo' },
  { src: 'https://picsum.photos/seed/snapchat/48/48', alt: 'Snapchat logo', hint: 'brand logo' },
  { src: 'https://picsum.photos/seed/yammer/48/48', alt: 'Yammer logo', hint: 'brand logo' },
  { src: 'https://picsum.photos/seed/figma/48/48', alt: 'Figma logo', hint: 'brand logo' },
  { src: 'https://picsum.photos/seed/microsoft/48/48', alt: 'Microsoft logo', hint: 'brand logo' },
];

const logos2 = [
    { src: 'https://picsum.photos/seed/meet/48/48', alt: 'Google Meet logo', hint: 'brand logo' },
    { src: 'https://picsum.photos/seed/edge/48/48', alt: 'Microsoft Edge logo', hint: 'brand logo' },
    { src: 'https://picsum.photos/seed/lv/48/48', alt: 'LV logo', hint: 'brand logo' },
    { src: 'https://picsum.photos/seed/framer/48/48', alt: 'Framer logo', hint: 'brand logo' },
    { src: 'https://picsum.photos/seed/marvel/48/48', alt: 'Marvel logo', hint: 'brand logo' },
    { src: 'https://picsum.photos/seed/confluence2/48/48', alt: 'Confluence logo', hint: 'brand logo' },
    { src: 'https://picsum.photos/seed/gmail/48/48', alt: 'Gmail logo', hint: 'brand logo' },
];

const Marquee = ({ logos, reverse = false }: { logos: { src: string, alt: string, hint: string }[], reverse?: boolean }) => (
    <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-[15%] md:w-[20%] bg-gradient-to-r from-secondary/50 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 h-full w-[15%] md:w-[20%] bg-gradient-to-l from-secondary/50 to-transparent z-10"></div>
        <div className={`flex w-fit items-center ${reverse ? 'animate-slide-rtl' : 'animate-slide'} hover:[animation-play-state:paused]`}>
            {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
                <figure key={index} className="size-20 md:size-[120px] bg-background rounded-full flex items-center justify-center mx-4 md:mx-[17px] border-[10px] border-secondary/50 shrink-0">
                    <Image src={logo.src} alt={logo.alt} width={48} height={48} className="size-12" data-ai-hint={logo.hint} />
                </figure>
            ))}
        </div>
    </div>
);

export function Integrations() {
  return (
    <section className="py-20 md:py-[100px] bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="space-y-[70px]">
          <div className="max-w-[804px] mx-auto text-center space-y-5">
            <Badge variant="secondary" className="bg-green-100 text-green-700">Integration</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Enhance your productivity effortlessly with over 50 integrations.
              </h2>
              <p className="text-muted-foreground max-w-[582px] mx-auto">
                Until recently, the prevailing view assumed lorem ipsum was born as a nonsense text. It's not Latin though it looks like nothing.
              </p>
            </div>
          </div>

          <div className="space-y-7">
            <Marquee logos={logos1} />
            <Marquee logos={logos2} reverse={true} />
          </div>
        </div>
      </div>
    </section>
  );
}
