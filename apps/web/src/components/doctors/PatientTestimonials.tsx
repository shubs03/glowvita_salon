import { Star, User } from 'lucide-react';

export default function PatientTestimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      feedback: "Found an excellent dermatologist through this platform. The booking process was seamless and the doctor was very professional. Highly recommend!"
    },
    {
      id: 2,
      name: "Michael Chen",
      feedback: "The video consultation feature is amazing! I got expert medical advice from home. The platform is user-friendly and doctors are very responsive."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      feedback: "Great experience! Easy to search for specialists in my area, transparent pricing, and excellent customer support. This has become my go-to platform."
    }
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            What Our Patients Say
          </h2>
          <p className="text-sm text-muted-foreground">Real experiences from patients who found their perfect doctor</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-background rounded-lg p-5 border border-border/50 hover:shadow-md transition-all duration-200 hover:border-primary/30">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                "{testimonial.feedback}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">Verified Patient</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
