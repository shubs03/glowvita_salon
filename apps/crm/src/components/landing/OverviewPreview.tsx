import React from 'react';

const OverviewPreview = () => {
  return (
    <section className="py-10 overflow-hidden bg-white">
      {/* Section Header */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-gray-900 inline-block pb-4 mx-auto">
          CRM Panel Overview
        </h2>
        
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          Watch a quick preview of our powerful CRM panel designed specifically for salon businesses.
        </p>
      </div>

      {/* Video Preview */}
      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-sm max-w-4xl mx-auto">
          {/* Placeholder for video - In a real implementation, you would use a video element or embed */}
          <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-6 shadow-lg">
                <svg 
                  className="w-16 h-16 text-primary cursor-pointer hover:scale-105 transition-transform" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5V19L19 12L8 5Z" />
                </svg>
              </div>
            </div>
            
            {/* Video thumbnail or placeholder image */}
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&h=563&fit=crop" 
              alt="CRM Panel Preview"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewPreview;