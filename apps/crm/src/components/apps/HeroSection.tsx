const HeroSection = () => {
  return (
    <section 
      className="relative w-full overflow-hidden flex items-center justify-center mx-auto"
      style={{
        maxWidth: '1537px',
        height: '603px',
        marginTop: '0px',
        opacity: 1,
        transform: 'rotate(0deg)',
        backgroundImage: `url('/appbackimage.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-0" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Elegant Brand Mark */}
        <div className="mb-8">
          <p className="text-white/70 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
            MOBILE APPS
          </p>
        </div>
...
        {/* Main Headline */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8 leading-tight tracking-tight"
          style={{ fontFamily: 'Manrope, sans-serif', color: '#FFFFFF' }}
        >
          Your Business,
          <br />
          In Your Pocket
        </h1>

        {/* Descriptive Paragraph */}
        <p 
          className="text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-light mb-6"
          style={{ fontFamily: 'Manrope, sans-serif', color: '#FFFFFF' }}
        >
          Manage your salon and connect with your clients on the go with our
          powerful, intuitive mobile apps.
        </p>

        {/* Supporting Text */}
        <p 
          className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light"
          style={{ fontFamily: 'Manrope, sans-serif', color: '#FFFFFF' }}
        >
          From managing appointments to connecting with clients, everything you need
          for your salon business is right here in one place.
        </p>

        <div className="gap-4 flex flex-wrap justify-center mt-8">
          <a href="/login" className="bg-primary text-white border border-primary px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/90 shadow-lg">Join GlowVita Today</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;