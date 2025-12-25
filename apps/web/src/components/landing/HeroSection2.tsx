import React, { useState } from "react";
import {
  Search,
  MapPin,
  Scissors,
  Sparkles,
  Droplets,
  Star,
} from "lucide-react";

const Hepurplection2 = () => {
  const [serviceName, setServiceName] = useState("");
  const [address, setAddress] = useState("");

  const services = [
    { icon: Scissors, label: "Nail Salon" },
    { icon: Scissors, label: "Hair Salon" },
    { icon: Sparkles, label: "Spa" },
    { icon: Star, label: "MakeUp" },
    { icon: Droplets, label: "Skin Care" },
  ];

  return (
    <div className="relative w-full h-[615px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(45, 28, 48, 0.85), rgba(45, 28, 48, 0.4)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl">
        {/* Logo */}
        <div className="mb-8">
          <h3 className="text-amber-100 text-sm font-light tracking-[0.3em] uppercase">
            GLOWVITA
          </h3>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-amber-50 mb-6 max-w-2xl leading-tight">
          Find a service
          <br />
          close to you
        </h1>

        {/* Subheading */}
        <p className="text-gray-200 text-base md:text-lg mb-10 max-w-xl leading-relaxed">
          Experience convenience by discovering salons and specialists in your
          area, ready to provide excellent self-care services.
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-full shadow-2xl p-2 flex items-center gap-3 max-w-4xl mb-8">
          {/* Service Name Input */}
          <div className="flex-1 flex items-center gap-3 px-4 border-r border-gray-200">
            <div className="flex flex-col flex-1">
              {!serviceName && (
                <label className="text-purple-400 text-xs font-medium mb-1">
                  Service Name
                </label>
              )}
              <input
                type="text"
                placeholder="Book your services..."
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="outline-none text-gray-800 placeholder-gray-400 text-sm"
              />
            </div>
            <Scissors className="w-4 h-4 text-gray-400" />
          </div>

          {/* Address Input */}
          <div className="flex-1 flex items-center gap-3 px-4">
            <div className="flex flex-col flex-1">
              {!address && (
                <label className="text-purple-400 text-xs font-medium mb-1">
                  Address
                </label>
              )}
              <input
                type="text"
                placeholder="Where"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="outline-none text-gray-800 placeholder-gray-400 text-sm"
              />
            </div>
            <MapPin className="w-4 h-4 text-gray-400" />
          </div>

          {/* Search Button */}
          <button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 shadow-lg">
            Search
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Service Categories Marquee */}
        <div className="max-w-4xl overflow-hidden relative">
          {/* Left Fade - More Subtle */}
          <div className="rounded-full absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[rgba(45,28,48,0.95)] via-[rgba(45,28,48,0.7)] to-transparent z-10 pointer-events-none"></div>

          {/* Marquee */}
          <div className="flex gap-3 animate-marquee hover:[animation-play-state:paused]">
            {[...services, ...services].map((service, index) => {
              const Icon = service.icon;
              return (
                <button
                  key={index}
                  className="bg-white bg-opacity-10 backdrop-blur-sm hover:border-white hover:bg-opacity-20 border border-purple-950 border-opacity-30 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <Icon className="w-4 h-4" />
                  {service.label}
                </button>
              );
            })}
          </div>

          {/* Right Fade - More Subtle */}
          <div className="rounded-full absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[rgba(45,28,48,0.95)] via-[rgba(45,28,48,0.7)] to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Hepurplection2;
