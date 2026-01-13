
import React from 'react';
import { Users, BarChart3, Calendar, Settings, Activity, TrendingUp } from 'lucide-react';

const CoreFeatures = () => {
  const features = [
    {
      icon: Users,
      title: 'Lead Management',
      description: 'Capture, track, and nurture leads from initial contact to conversion with automated follow-up sequences.',
    },
    {
      icon: BarChart3,
      title: 'Sales Pipeline',
      description: 'Visualize your sales process with customizable stages and track deals through to completion.',
    },
    {
      icon: Settings,
      title: 'Customer Profiles',
      description: 'Maintain comprehensive client records with service history, preferences, and communication logs.',
    },
    {
      icon: Calendar,
      title: 'Task Automation',
      description: 'Automate routine tasks like appointment reminders, follow-ups, and data entry to save time.',
    },
    {
      icon: Activity,
      title: 'Analytics Dashboard',
      description: 'Get actionable insights with real-time data on sales, customer trends, and business performance.',
    },
    {
      icon: TrendingUp,
      title: 'Performance Tracking',
      description: 'Monitor KPIs and team performance with customizable reports and visual dashboards.',
    }
  ];

  return (
    <section className="py-10 overflow-hidden bg-white">
      {/* Section Header */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-4">
          Core CRM Features
        </h2>
        
        <p className="mt-2 text-gray-600 max-w-2xl">
          Powerful tools designed to streamline your salon business and enhance customer relationships.
        </p>
      </div>

      {/* Features Grid */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed pl-16">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;