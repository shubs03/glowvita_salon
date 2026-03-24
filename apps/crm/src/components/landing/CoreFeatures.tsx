
import React from 'react';
import Image from 'next/image';
import { Users, BarChart3, Calendar, Settings, Activity, TrendingUp, Laptop, Globe, CreditCard, Target, Megaphone, Mail, Share2, Award, Zap, Clock, Repeat, Bell, FileText, Send } from 'lucide-react';

const CoreFeatures = () => {
  const digitalTransformationFeatures = [
    {
      iconImage: '/icons/browser 1.png',
      title: 'Offline to Online Transition',
      description: "Do all your record keeping, bookkeeping digitally. GlowVita Salon helps you manage customer records, expenses, and accounts digitally — saving time and reducing mistakes.",
    },
    {
      iconImage: '/icons/direct-marketing 1.png',
      title: 'Sell your services online',
      description: 'GlowVita Salon enables you to set up an online profile to reach more customers. Expand your salon visibility with a dedicated online presence and let clients discover your services easily.',
    },
    {
      iconImage: '/icons/cashless 1.png',
      title: 'Go Cashless',
      description: "Receive and accept all your payments digitally through GlowVita Salon. GlowVita Salon allows you to accept online payments and maintain accurate digital payment records.",
    },
  ];


  const FeatureCard = ({ icon: Icon, iconImage, title, description }: { icon?: any, iconImage?: string, title: string, description: string }) => (
    <div className="relative mt-12">
      {/* Icon circle on top border */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-white border-2 border-primary/20 shadow-md flex items-center justify-center z-10">
        {/* Icon centered inside circle */}
        <div className="w-12 h-12 text-primary relative flex items-center justify-center">
          {iconImage ? (
            <Image
              src={iconImage}
              alt={title}
              fill
              className="object-contain"
            />
          ) : Icon ? (
            <Icon />
          ) : null}
        </div>
      </div>
      {/* Card body */}
      <div className="bg-[#f0f7ff] border border-border rounded-2xl p-6 pt-20 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 w-full h-full flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-card-foreground text-xl text-center leading-tight mb-4">
            {title}
          </h3>
        </div>
        <p className="text-muted-foreground text-base leading-relaxed text-center">
          {description}
        </p>
      </div>
    </div>
  );

  const managementFeatures = [
    {
      iconImage: '/icons/customer-service (4) 1.png',
      title: 'Customer Management',
      description: 'Manage your customer data & track their preferences for better decision making. Access service history, preferences, and visit records to improve customer satisfaction and retention.',
    },
    {
      iconImage: '/icons/material-management 1.png',
      title: 'Inventory Management',
      description: 'Manage & track your Inventory in real time & stay updated about stocks. Keep track of stock levels, product movement, and restocking needs with accurate real-time data.',
    },
    {
      iconImage: '/icons/increase 1.png',
      title: 'Expense Management',
      description: 'Track and control all your salon expenses efficiently in one place. Categorize spending, maintain clear records, and gain better financial control for smarter business decisions.',
    },
    {
      iconImage: '/icons/management 1.png',
      title: 'Staff Management',
      description: 'Streamline employee management with smart digital tools. Manage salaries, attendance, working hours, performance history and generate detailed reports — all in one place.',
    },
    {
      iconImage: '/icons/payment (1) 1.png',
      title: 'Payment Management',
      description: 'Enable online payments & track offline transactions. Accept online payments and record offline payments while tracking all transactions accurately in one system.',
    },
    {
      iconImage: '/icons/calendar (2) 1.png',
      title: 'Appointment Management',
      description: 'Efficiently manage your salon schedule with digital appointment tracking. Monitor bookings, avoid overlaps, and keep your daily operations organized for a smooth customer experience.',
    },
    {
      iconImage: '/icons/booking (2) 1.png',
      title: 'Online Booking',
      description: 'Make booking effortless for your customers. With GlowVita Salon, clients can check service availability and schedule their visits online without calling the salon.',
    },
    {
      iconImage: '/icons/notification (3) 2.png',
      title: 'Notifications & Reminders',
      description: 'Automatically send reminders for upcoming appointments, payment updates, and follow-ups to ensure better customer communication and fewer missed visits overall.',
    },
    {
      iconImage: '/icons/gift (3) 1.png',
      title: 'Discount & Offers',
      description: 'Create and manage attractive discounts and special offers for your services. Promote deals to attract more customers, increase bookings, and boost your salon sales.',
    },
    {
      iconImage: '/icons/bill 1.png',
      title: 'Easy & Fast Billing',
      description: 'Easily manage your entire billing process by creating invoices, recording purchases, and tracking every payment from one simple, streamlined system.',
    },
    {
      iconImage: '/icons/contactless-payment 1.png',
      title: 'Mobile POS',
      description: 'Speed up sales and improve customer experience with a mobile POS system that allows quick checkout and instant billing from your device.',
    },
    {
      iconImage: '/icons/supply-chain-management 1.png',
      title: 'Suppliers Management',
      description: 'Keep supplier information and stock movement history together in one place for better tracking. Easily monitor purchases, manage suppliers, and make smarter inventory decisions.',
    },
  ];

  const marketingFeatures = [
    {
      iconImage: '/icons/speech-bubble 1.png',
      title: 'Message Blast',
      description: 'Reach your customers instantly with promotional messages. Send bulk SMS about offers, discounts, and special announcements to keep your clients engaged and coming back.',
    },
    {
      iconImage: '/icons/email-marketing 1.png',
      title: 'Email Campaigns',
      description: 'Create and send email campaigns to share offers, updates, and beauty tips with your clients. Stay connected and keep your customers engaged with your brand',
    },
    {
      iconImage: '/icons/video 1.png',
      title: 'Social Media Marketing',
      description: 'GlowVita Salon provides a dedicated campaign manager to help you run effective ads, reach the right audience, and promote your salon services to attract more customers online.',
    },
    {
      iconImage: '/icons/post 1.png',
      title: 'Social Media Post Creation',
      description: 'GlowVita Salon includes a built-in content creation tool that helps you design and share posts on social media or use them in ad campaigns.',
    },
    {
      iconImage: '/icons/social-media 1.png',
      title: 'Marketing Reports',
      description: 'GlowVita Salon provides comprehensive marketing reports so you can track performance, optimize strategies and grow your business effectively.',
    },
  ];

  const automationFeatures = [
    {
      iconImage: '/icons/3d-report 1.png',
      title: 'Automated Reports',
      description: 'Access your business data instantly with automatically generated reports. Track performance and revenue without manual effort.',
    },
    {
      iconImage: '/icons/statistics 1.png',
      title: 'Analytics',
      description: 'GlowVita Salon provides detailed analytics and insights on your top-selling products, most popular services, and high-demand areas to help you optimize your business.',
    },
    {
      iconImage: '/icons/process 1.png',
      title: 'Business Automation',
      description: 'Run your salon smoothly with smart automation tools. Automate bookings, reminders, billing, and save time to focus on clients.',
    },
  ];

  return (
    <section className="py-10 overflow-hidden bg-white">
      {/* Section Header */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16 text-center">
        <h2 className="text-2xl md:text-[2.25rem] font-serif font-bold text-gray-900 relative inline-block pb-4">
          Powerful tools to empower your{' '}
          <span className="text-[#0C1880] font-bold">business growth</span>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>

        <p className="mt-3 text-lg text-gray-600">
          Using GlowVita Salon&apos;s powerful &amp; easy to use tools any salon &amp; spa can modernize their business.
        </p>
      </div>

      {/* Digital Transformation Cards */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-gray-900 relative inline-block pb-2 mb-5">
          Digital Transformation
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {digitalTransformationFeatures.map((feature: any, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              iconImage={feature.iconImage}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      {/* Management Section */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-gray-900 relative inline-block pb-2 mb-5">
          Management
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {managementFeatures.map((feature: any, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              iconImage={feature.iconImage}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      {/* Marketing Section */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-gray-900 relative inline-block pb-2 mb-5">
          Marketing
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {marketingFeatures.map((feature: any, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              iconImage={feature.iconImage}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      {/* Automation Section */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-gray-900 relative inline-block pb-2 mb-5">
          Automation
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#302131] to-transparent"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {automationFeatures.map((feature: any, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              iconImage={feature.iconImage}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>

    </section>
  );
};

export default CoreFeatures;
