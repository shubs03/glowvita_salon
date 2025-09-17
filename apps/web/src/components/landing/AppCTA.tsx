
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Download } from 'lucide-react';

export function AppCTA() {
  return (
    <section className="bg-secondary/30 py-16 md:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center md:text-left order-2 md:order-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4 md:mb-6">
              Take Us With You
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto md:mx-0 leading-relaxed mb-6 md:mb-8 px-2 sm:px-0">
              Download our mobile app to manage bookings, discover new styles, and connect with your favorite salons on the go. Experience the full power of GlowVita in your pocket.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 sm:gap-4 px-4 sm:px-0">
              <Button size="lg" className="bg-black hover:bg-black/80 text-white rounded-full px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
                <span>Download for iOS</span>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold border-2 hover:bg-primary hover:text-white transition-all duration-300">
                <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
                <span>Download for Android</span>
              </Button>
            </div>
            
            {/* Additional mobile features */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Instant booking notifications</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Offline access to appointments</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Real-time salon availability</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center order-1 md:order-2">
            <div className="relative">
              <Image 
                src="https://placehold.co/400x400.png"
                alt="Mobile App"
                width={280}
                height={280}
                className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl shadow-2xl object-cover"
                data-ai-hint="mobile app screenshot"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
