import { Users, CheckCircle, Star, MapPin } from 'lucide-react';

interface Doctor {
  _id: string;
  isVerified?: boolean;
  rating?: number;
}

interface QuickStatsProps {
  doctors: Doctor[];
  allCities: string[];
}

export default function QuickStats({ doctors, allCities }: QuickStatsProps) {
  const averageRating = doctors.length > 0 
    ? (doctors.reduce((acc, d) => acc + (d.rating || 0), 0) / doctors.length).toFixed(1) 
    : '0.0';

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-background rounded-lg p-5 text-center border border-border/50 hover:shadow-md transition-all duration-200 hover:border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{doctors.length}+</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Expert Doctors</p>
          </div>
          <div className="bg-background rounded-lg p-5 text-center border border-border/50 hover:shadow-md transition-all duration-200 hover:border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {doctors.filter(d => d.isVerified).length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Verified Profiles</p>
          </div>
          <div className="bg-background rounded-lg p-5 text-center border border-border/50 hover:shadow-md transition-all duration-200 hover:border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-primary fill-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {averageRating}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="bg-background rounded-lg p-5 text-center border border-border/50 hover:shadow-md transition-all duration-200 hover:border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{allCities.length - 1}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Cities Covered</p>
          </div>
        </div>
      </div>
    </section>
  );
}
