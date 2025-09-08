
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Download } from 'lucide-react';

export function AppCTA() {
  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Take Us With You</h2>
            <p className="text-muted-foreground mb-8">
              Download our mobile app to manage bookings, discover new styles, and connect with your favorite salons on the go.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <Button size="lg" className="bg-black hover:bg-black/80 text-white rounded-full">
                <Download className="mr-2 h-5 w-5" /> App Store
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                <Download className="mr-2 h-5 w-5" /> Google Play
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <Image 
              src="https://placehold.co/400x400.png"
              alt="Mobile App"
              width={300}
              height={300}
              className="rounded-lg shadow-xl"
              data-ai-hint="mobile app screenshot"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
