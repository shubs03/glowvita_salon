import React from 'react';

const StatsSection = () => {
  const stats = [
    {
      number: '5000+',
      label: 'Salons Managed',
    },
    {
      number: '98%',
      label: 'Customer Retention',
    },
    {
      number: '24/7',
      label: 'Support Available',
    },
    {
      number: '10x',
      label: 'Faster Operations',
    },
  ];

  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {stat.number}
            </div>
            <p className="text-muted-foreground text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;