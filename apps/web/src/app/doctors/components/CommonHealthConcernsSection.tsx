"use client";

import { Button } from "@repo/ui/button";
import { Heart, Brain, Bone, Activity, Eye, Stethoscope, User, Baby } from "lucide-react";
import Link from "next/link";

export function CommonHealthConcernsSection() {
  const healthConcerns = [
    {
      icon: Heart,
      title: "Heart Health",
      description: "Chest pain, high blood pressure, heart palpitations",
      specialists: ["Cardiologist", "General Medicine"]
    },
    {
      icon: Brain,
      title: "Mental Health",
      description: "Anxiety, depression, stress management",
      specialists: ["Psychiatrist", "Psychologist"]
    },
    {
      icon: Bone,
      title: "Joint & Bone Issues",
      description: "Joint pain, arthritis, fractures, back pain",
      specialists: ["Orthopedic", "Rheumatologist"]
    },
    {
      icon: Activity,
      title: "Diabetes & Metabolism",
      description: "Blood sugar issues, weight management, thyroid",
      specialists: ["Endocrinologist", "General Medicine"]
    },
    {
      icon: Eye,
      title: "Vision Problems",
      description: "Eye strain, vision changes, eye infections",
      specialists: ["Ophthalmologist", "Optometrist"]
    },
    {
      icon: Stethoscope,
      title: "Respiratory Issues",
      description: "Cough, breathing problems, asthma, allergies",
      specialists: ["Pulmonologist", "General Medicine"]
    },
    {
      icon: User,
      title: "Skin Conditions",
      description: "Acne, rashes, skin allergies, dermatitis",
      specialists: ["Dermatologist", "General Medicine"]
    },
    {
      icon: Baby,
      title: "Women's Health",
      description: "Pregnancy, menstrual issues, reproductive health",
      specialists: ["Gynecologist", "Obstetrician"]
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            Common Health Concerns
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Get expert consultation for the most common health issues. Our specialists are here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {healthConcerns.map((concern, index) => {
            const IconComponent = concern.icon;
            return (
              <div
                key={concern.title}
                className="group relative p-6 rounded-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-400/10 to-blue-400/5 border border-blue-400/10 hover:border-blue-400/20 cursor-pointer"
              >
                <div className="flex flex-col items-start text-left">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 bg-blue-400/15">
                    <IconComponent className="h-6 w-6 text-blue-400" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-blue-400 transition-colors">
                    {concern.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {concern.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Specialists:</p>
                    <div className="flex flex-wrap gap-1">
                      {concern.specialists.map((specialist) => (
                        <span
                          key={specialist}
                          className="text-xs px-2 py-1 rounded-full bg-blue-400/10 text-blue-700"
                        >
                          {specialist}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full mt-auto hover:bg-blue-400/10 text-blue-400 border-blue-400/20 hover:border-blue-400/40"
                  >
                    <Link href={`/doctors/consultations/concern/${concern.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      Consult Now
                    </Link>
                  </Button>

                  {/* Subtle underline animation */}
                  <div className="h-0.5 w-0 bg-blue-400 mt-3 transition-all duration-300 rounded-full group-hover:w-8 mx-auto" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Don't see your concern listed? Our general practitioners can help with any health issue.
          </p>
          <Button
            asChild
            variant="outline"
            className="px-8 py-3 border-blue-400/20 hover:border-blue-400/40 hover:bg-blue-400/10 text-blue-400"
          >
            <Link href="/doctors/consultations/general">
              General Consultation
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}