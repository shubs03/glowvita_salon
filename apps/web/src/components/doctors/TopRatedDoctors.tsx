import { Star, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@repo/ui/button';

interface Doctor {
  _id: string;
  id?: string;
  name: string;
  specialty?: string;
  rating?: number;
  totalReviews?: number;
  image?: string;
  profileImage?: string;
}

interface TopRatedDoctorsProps {
  doctors: Doctor[];
}

export default function TopRatedDoctors({ doctors }: TopRatedDoctorsProps) {
  const topRatedDoctors = doctors
    .filter(d => d.rating && d.rating >= 4.5)
    .slice(0, 4);

  if (topRatedDoctors.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Highly Recommended Doctors
          </h2>
          <p className="text-sm text-muted-foreground">Meet our most trusted and experienced doctors</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {topRatedDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-background border border-border/50 rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-primary/30 group">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {doctor.image || doctor.profileImage ? (
                    <Image
                      src={doctor.image || doctor.profileImage || ''}
                      alt={doctor.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {doctor.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{doctor.specialty}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs font-semibold text-foreground">{doctor.rating?.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({doctor.totalReviews})</span>
                  </div>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="w-full h-9 text-xs font-semibold"
                variant="outline"
              >
                <Link href={`/doctors/${doctor.id}`}>
                  View Profile
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
