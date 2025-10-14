import { Button } from "@repo/ui/button";
import { Calendar, Video } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Connect with top medical professionals and get the care you deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-4 text-base rounded-md bg-white text-black hover:bg-white/90"
            >
              <Link
                href="/doctors/appointments"
                className="flex items-center gap-2"
              >
                Book Appointment
                <Calendar className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-base border-white text-black hover:bg-white hover:text-primary"
            >
              <Link
                href="/doctors/consultations"
                className="flex items-center gap-2"
              >
                Start Consultation
                <Video className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-white/70">
            Trusted by millions for their healthcare needs
          </p>
        </div>
      </div>
    </section>
  );
}