import React from 'react';
import { Heart, TrendingUp, ShieldCheck } from 'lucide-react';

const PhilosophySection = () => {
  const values = [
    {
      icon: <Heart size={28} fill="#422A3C" stroke="none" />,
      title: 'Simplicity',
      description: 'We believe beauty services should be easy to find, book, and enjoy without unnecessary complexity.',
    },
    {
      icon: <TrendingUp size={28} fill="none" stroke="#422A3C" strokeWidth={2.5} />,
      title: 'Performance',
      description: 'We deliver fast, reliable experiences that respect your time and exceed your expectations.',
    },
    {
      icon: <ShieldCheck size={28} fill="#422A3C" stroke="white" strokeWidth={1.5} />,
      title: 'Trust',
      description: 'We build confidence through transparency, verified reviews, and secure transactions every time.',
    },
  ];

  return (
    <section className="py-8 sm:py-10 container mx-auto px-4 sm:px-6 lg:px-8 bg-background">
      {/* Section Header */}
      <div className="mb-6 md:mb-8">
        <h2
          className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3"
          style={{ color: "#252B42" }}
        >
          Our Philosophy
          <span
            className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
            }}
          />
        </h2>

        <p
          className="text-muted-foreground mt-3"
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "14px",
            lineHeight: "160%",
            letterSpacing: "0%",
          }}
        >
          Our approach is guided by three fundamental principles that shape every decision we make and every experience we create for our community.
        </p>
      </div>


      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {values.map((value, index) => {
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-2xl flex-shrink-0 bg-[#422A3C]/10 group-hover:bg-[#422A3C]/20 transition-all duration-300">
                  {value.icon}
                </div>
                <h3
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '18px',
                    lineHeight: '24px',
                    letterSpacing: '0.1px',
                  }}
                  className="text-card-foreground"
                >
                  {value.title}
                </h3>
              </div>
              <p
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '23px',
                  letterSpacing: '0.1px',
                  textAlign: 'justify',
                }}
                className="text-muted-foreground pl-16"
              >
                {value.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PhilosophySection;