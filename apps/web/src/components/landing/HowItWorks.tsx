
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { Search, CalendarCheck, Heart } from "lucide-react";

const steps = [
    {
        icon: <Search className="h-8 w-8 text-primary" />,
        title: "Interface & Discover",
        description: "Connect to the grid and search for top-tier stylists and bio-spas in your designated sector."
    },
    {
        icon: <CalendarCheck className="h-8 w-8 text-primary" />,
        title: "Sync Your Schedule",
        description: "Select your desired enhancement and sync the appointment directly with your neural calendar."
    },
    {
        icon: <Heart className="h-8 w-8 text-primary" />,
        title: "Upgrade & Enjoy",
        description: "Arrive at the designated coordinates and enjoy your bespoke upgrade session."
    }
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">The Protocol</h2>
                <p className="text-muted-foreground mt-2">Initiating your next upgrade sequence is simple.</p>
            </div>
            <div className="relative max-w-lg mx-auto md:max-w-4xl">
                 <div className="absolute top-0 left-1/2 w-1 h-full bg-border/50 -translate-x-1/2 hidden md:block"></div>
                 <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-primary/0 via-primary to-primary/0 animate-[pulse_5s_ease-in-out_infinite] hidden md:block"></div>
                <div className="space-y-16 md:space-y-24">
                    {steps.map((step, index) => (
                       <div key={index} className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                           <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8 md:order-2'}`}>
                               <div className="relative">
                                   <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-xl opacity-70 animate-pulse-slow"></div>
                                   <div className="mx-auto bg-background border-2 border-primary/50 w-24 h-24 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 relative z-10">
                                       {step.icon}
                                   </div>
                               </div>
                           </div>
                           <div className={`md:w-1/2 ${index % 2 === 0 ? '' : 'md:text-right'}`}>
                                <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                           </div>
                       </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
  );
}
