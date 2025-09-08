
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { Search, CalendarCheck, Heart, ArrowRight } from "lucide-react";

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
    <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">The Protocol</h2>
                <p className="text-muted-foreground mt-2">Initiating your next upgrade sequence is simple.</p>
            </div>
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/50 -translate-y-1/2 hidden md:block"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 animate-pulse hidden md:block"></div>
                <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            <div className="mx-auto bg-background border-2 border-primary/50 w-24 h-24 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
  );
}
