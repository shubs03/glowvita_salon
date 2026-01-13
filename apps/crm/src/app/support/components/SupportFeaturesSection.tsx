import React from "react";

const SupportFeaturesSection = () => {
  return (
    <section className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Support Resources
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl">
          Comprehensive tools to help you succeed
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center">
          <div className="mx-auto bg-primary/10 text-primary p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
          </div>
          <h3 className="font-bold text-card-foreground text-xl mb-2">Knowledge Base</h3>
          <p className="text-muted-foreground mb-4">
            Access our comprehensive collection of articles, guides, and FAQs covering all aspects of GlowVita CRM.
          </p>
          <a href="/support/knowledge-base" className="text-primary hover:underline font-medium inline-flex items-center gap-2">
            Browse Resources
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="m7 17 4-4-4-4"></path>
              <path d="m11 13 4 4 4-4"></path>
            </svg>
          </a>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center">
          <div className="mx-auto bg-primary/10 text-primary p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
          <h3 className="font-bold text-card-foreground text-xl mb-2">Video Tutorials</h3>
          <p className="text-muted-foreground mb-4">
            Watch step-by-step video guides demonstrating how to use various features of GlowVita CRM effectively.
          </p>
          <a href="/support/tutorials" className="text-primary hover:underline font-medium inline-flex items-center gap-2">
            Watch Tutorials
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="m7 17 4-4-4-4"></path>
              <path d="m11 13 4 4 4-4"></path>
            </svg>
          </a>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 text-center">
          <div className="mx-auto bg-primary/10 text-primary p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M21.2 8.4c.3-.4.3-1 0-1.4l-7-7c-.4-.4-1-.4-1.4 0l-7 7c-.4.4-.4 1 0 1.4l7 7c.4.4 1 .4 1.4 0z"></path>
              <path d="M3.5 5.5L21 18"></path>
            </svg>
          </div>
          <h3 className="font-bold text-card-foreground text-xl mb-2">Live Chat</h3>
          <p className="text-muted-foreground mb-4">
            Connect with our support team in real-time for immediate assistance with any questions or issues.
          </p>
          <a href="/support/chat" className="text-primary hover:underline font-medium inline-flex items-center gap-2">
            Start Chat
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="m7 17 4-4-4-4"></path>
              <path d="m11 13 4 4 4-4"></path>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SupportFeaturesSection;