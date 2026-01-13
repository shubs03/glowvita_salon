import { cn } from "@repo/ui/cn";
import Image from "next/image";
import { ReactNode } from "react";

interface PhoneMockupProps {
  imageUrl: string;
  alt: string;
  hint: string;
  className?: string;
}

const PhoneMockup = ({
  imageUrl,
  alt,
  hint,
  className,
}: PhoneMockupProps) => (
  <div
    className={cn(
      "relative w-full aspect-[9/19] bg-slate-400 rounded-xl shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer p-2 border border-slate-400",
      className
    )}
  >
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-400 rounded-full z-20"></div>
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <Image
        src={imageUrl}
        className="group-hover:scale-110 transition-transform duration-500"
        alt={alt}
        fill
        style={{
          objectFit: "cover",
        }}
        data-ai-hint={hint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  </div>
);

export default PhoneMockup;