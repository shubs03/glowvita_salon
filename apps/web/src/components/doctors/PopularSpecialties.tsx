import { Stethoscope } from 'lucide-react';
import { Badge } from '@repo/ui/badge';

interface Doctor {
  specialty?: string;
  specialties?: string[];
}

interface PopularSpecialtiesProps {
  allSpecialties: string[];
  doctors: Doctor[];
  onSpecialtyClick: (specialty: string) => void;
}

export default function PopularSpecialties({ allSpecialties, doctors, onSpecialtyClick }: PopularSpecialtiesProps) {
  const specialtiesToShow = allSpecialties.slice(1, 11);

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Find Doctors by Specialty
          </h2>
          <p className="text-sm text-muted-foreground">Browse doctors by their area of expertise</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {specialtiesToShow.map((specialty) => {
            const count = doctors.filter(d => 
              d.specialty === specialty || (d.specialties && d.specialties.includes(specialty))
            ).length;
            return (
              <button
                key={specialty}
                onClick={() => onSpecialtyClick(specialty)}
                className="group bg-background hover:bg-primary/5 border border-border/50 hover:border-primary/30 rounded-lg p-5 text-left transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary">
                    {count}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {specialty}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
