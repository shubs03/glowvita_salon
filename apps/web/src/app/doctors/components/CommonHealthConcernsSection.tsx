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
      specialists: ["Cardiologist", "General Medicine"],
      color: "red",
      gradient: "from-red-500/10 to-red-500/5"
    },
    {
      icon: Brain,
      title: "Mental Health",
      description: "Anxiety, depression, stress management",
      specialists: ["Psychiatrist", "Psychologist"],
      color: "purple",
      gradient: "from-purple-500/10 to-purple-500/5"
    },
    {
      icon: Bone,
      title: "Joint & Bone Issues",
      description: "Joint pain, arthritis, fractures, back pain",
      specialists: ["Orthopedic", "Rheumatologist"],
      color: "orange",
      gradient: "from-orange-500/10 to-orange-500/5"
    },
    {
      icon: Activity,
      title: "Diabetes & Metabolism",
      description: "Blood sugar issues, weight management, thyroid",
      specialists: ["Endocrinologist", "General Medicine"],
      color: "green",
      gradient: "from-green-500/10 to-green-500/5"
    },
    {
      icon: Eye,
      title: "Vision Problems",
      description: "Eye strain, vision changes, eye infections",
      specialists: ["Ophthalmologist", "Optometrist"],
      color: "blue",
      gradient: "from-blue-500/10 to-blue-500/5"
    },
    {
      icon: Stethoscope,
      title: "Respiratory Issues",
      description: "Cough, breathing problems, asthma, allergies",
      specialists: ["Pulmonologist", "General Medicine"],
      color: "teal",
      gradient: "from-teal-500/10 to-teal-500/5"
    },
    {
      icon: User,
      title: "Skin Conditions",
      description: "Acne, rashes, skin allergies, dermatitis",
      specialists: ["Dermatologist", "General Medicine"],
      color: "pink",
      gradient: "from-pink-500/10 to-pink-500/5"
    },
    {
      icon: Baby,
      title: "Women's Health",
      description: "Pregnancy, menstrual issues, reproductive health",
      specialists: ["Gynecologist", "Obstetrician"],
      color: "indigo",
      gradient: "from-indigo-500/10 to-indigo-500/5"
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
                className={`group relative p-6 rounded-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${concern.gradient} border hover:border-opacity-40 cursor-pointer`}
                style={{
                  borderColor: `${concern.color === 'red' ? 'rgb(239 68 68 / 0.1)' : 
                    concern.color === 'purple' ? 'rgb(168 85 247 / 0.1)' : 
                    concern.color === 'orange' ? 'rgb(249 115 22 / 0.1)' :
                    concern.color === 'green' ? 'rgb(34 197 94 / 0.1)' :
                    concern.color === 'blue' ? 'rgb(59 130 246 / 0.1)' :
                    concern.color === 'teal' ? 'rgb(20 184 166 / 0.1)' :
                    concern.color === 'pink' ? 'rgb(236 72 153 / 0.1)' :
                    'rgb(99 102 241 / 0.1)'}`
                }}
              >
                <div className="flex flex-col items-start text-left">
                  <div className={`w-12 h-12 rounded-md flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110`}
                       style={{
                         backgroundColor: `${concern.color === 'red' ? 'rgb(239 68 68 / 0.15)' : 
                           concern.color === 'purple' ? 'rgb(168 85 247 / 0.15)' : 
                           concern.color === 'orange' ? 'rgb(249 115 22 / 0.15)' :
                           concern.color === 'green' ? 'rgb(34 197 94 / 0.15)' :
                           concern.color === 'blue' ? 'rgb(59 130 246 / 0.15)' :
                           concern.color === 'teal' ? 'rgb(20 184 166 / 0.15)' :
                           concern.color === 'pink' ? 'rgb(236 72 153 / 0.15)' :
                           'rgb(99 102 241 / 0.15)'}`
                       }}
                  >
                    <IconComponent className={`h-6 w-6`} 
                                   style={{
                                     color: `${concern.color === 'red' ? 'rgb(239 68 68)' : 
                                       concern.color === 'purple' ? 'rgb(168 85 247)' : 
                                       concern.color === 'orange' ? 'rgb(249 115 22)' :
                                       concern.color === 'green' ? 'rgb(34 197 94)' :
                                       concern.color === 'blue' ? 'rgb(59 130 246)' :
                                       concern.color === 'teal' ? 'rgb(20 184 166)' :
                                       concern.color === 'pink' ? 'rgb(236 72 153)' :
                                       'rgb(99 102 241)'}`
                                   }} />
                  </div>
                  
                  <h3 className={`text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors`}>
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
                          className={`text-xs px-2 py-1 rounded-full`}
                          style={{
                            backgroundColor: `${concern.color === 'red' ? 'rgb(239 68 68 / 0.1)' : 
                              concern.color === 'purple' ? 'rgb(168 85 247 / 0.1)' : 
                              concern.color === 'orange' ? 'rgb(249 115 22 / 0.1)' :
                              concern.color === 'green' ? 'rgb(34 197 94 / 0.1)' :
                              concern.color === 'blue' ? 'rgb(59 130 246 / 0.1)' :
                              concern.color === 'teal' ? 'rgb(20 184 166 / 0.1)' :
                              concern.color === 'pink' ? 'rgb(236 72 153 / 0.1)' :
                              'rgb(99 102 241 / 0.1)'}`,
                            color: `${concern.color === 'red' ? 'rgb(185 28 28)' : 
                              concern.color === 'purple' ? 'rgb(124 58 237)' : 
                              concern.color === 'orange' ? 'rgb(194 65 12)' :
                              concern.color === 'green' ? 'rgb(21 128 61)' :
                              concern.color === 'blue' ? 'rgb(37 99 235)' :
                              concern.color === 'teal' ? 'rgb(13 148 136)' :
                              concern.color === 'pink' ? 'rgb(190 24 93)' :
                              'rgb(79 70 229)'}`
                          }}
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
                    className={`w-full mt-auto hover:bg-primary/5 text-primary border-primary/20 hover:border-primary/40`}
                  >
                    <Link href={`/doctors/consultations/concern/${concern.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      Consult Now
                    </Link>
                  </Button>

                  {/* Subtle underline animation */}
                  <div className={`h-0.5 w-0 bg-primary mt-3 transition-all duration-300 rounded-full group-hover:w-8 mx-auto`} />
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
            className="px-8 py-3 border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary"
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