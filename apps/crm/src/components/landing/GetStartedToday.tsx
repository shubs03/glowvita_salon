import { Button } from "@repo/ui/button";
import Link from "next/link";
import { UserPlus, Phone, CheckCircle, Shield, Clock } from "lucide-react";

const GetStartedToday = () => {
  return (
    <section className="py-16 md:py-20 text-center bg-gradient-to-br from-background via-primary/10 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <UserPlus className="h-4 w-4" />
            Get Started Today
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of successful salons worldwide. Transform your
            business today with our powerful, easy-to-use CRM platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-8">
            <Button
              size="lg"
              className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              asChild
            >
              <Link href="/login">
                Sign Up Now{" "}
                <UserPlus className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
              asChild
            >
              <Link href="#">
                Schedule Demo <Phone className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span>Free 7-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetStartedToday;