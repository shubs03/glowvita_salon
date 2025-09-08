
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { Search, CalendarCheck, Heart } from "lucide-react";

const steps = [
    {
        icon: <Search className="h-8 w-8 text-primary" />,
        title: "Find a Salon",
        description: "Search for top-rated salons, spas, and barbershops in your area."
    },
    {
        icon: <CalendarCheck className="h-8 w-8 text-primary" />,
        title: "Book an Appointment",
        description: "Choose your service and book a slot that works for you, anytime."
    },
    {
        icon: <Heart className="h-8 w-8 text-primary" />,
        title: "Enjoy Your Service",
        description: "Relax and enjoy your pampering session with our trusted professionals."
    }
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
                <p className="text-muted-foreground mt-2">Booking your next appointment is as easy as 1-2-3.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                {steps.map((step, index) => (
                    <Card key={index} className="bg-background/50 hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                                {step.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </section>
  );
}
