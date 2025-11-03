import { Shield, Video, Clock, Award } from 'lucide-react';

export default function TrustAndSafety() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Your Health, Our Priority
          </h2>
          <p className="text-sm text-muted-foreground">Quality healthcare with verified doctors and secure consultations</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-background rounded-lg p-5 border border-border/50 text-center hover:shadow-md transition-all duration-200 hover:border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-2">Verified Doctors</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All doctors are verified with valid medical licenses
            </p>
          </div>
          <div className="bg-background rounded-lg p-5 border border-border/50 text-center hover:shadow-md transition-all duration-200 hover:border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-2">Video Consultation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Consult with doctors from the comfort of your home
            </p>
          </div>
          <div className="bg-background rounded-lg p-5 border border-border/50 text-center hover:shadow-md transition-all duration-200 hover:border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-2">24/7 Support</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Round-the-clock customer support for your queries
            </p>
          </div>
          <div className="bg-background rounded-lg p-5 border border-border/50 text-center hover:shadow-md transition-all duration-200 hover:border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-2">Best Specialists</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Experienced doctors across multiple specialties
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
