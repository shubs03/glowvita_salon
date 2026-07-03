import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#422A3C] text-white relative overflow-hidden m-0 mt-[-1px]">
      <div className="container mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 pt-6 sm:pt-8 lg:pt-10 pb-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 justify-items-center">

          {/* Column 1: Logo & Description */}
          <div className="space-y-4 flex flex-col items-center text-center">
            <div className="flex items-center justify-center">
              <img
                src="/images/GlowVita%20Salon%20PNG.png"
                alt="GlowVita Salon Logo"
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-white text-sm leading-relaxed text-left self-start">
              We believe every client deserves to feel special, and at GlowVita Salon, we make it happen with expert care.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 flex flex-col items-center text-center">
            <h4 className="font-bold text-white border-b-2 border-[#FFFFFF] inline-block pb-1">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white self-start">
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/" className="hover:underline transition-all duration-200">Home</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/all-products" className="hover:underline transition-all duration-200">Product</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/salons" className="hover:underline transition-all duration-200">Salons</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/about" className="hover:underline transition-all duration-200">About Us</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/contact" className="hover:underline transition-all duration-200">Reach Us</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Policies */}
          <div className="space-y-4 flex flex-col items-center text-center">
            <h4 className="font-bold text-white border-b-2 border-[#FFFFFF] inline-block pb-1">Our Policies</h4>
            <ul className="space-y-2 text-sm text-white self-start">
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/privacy-policy" className="hover:underline transition-all duration-200">Privacy Policy</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/terms-and-conditions" className="hover:underline transition-all duration-200">Terms & Conditions</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/return-policy" className="hover:underline transition-all duration-200">Return Policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-4 flex flex-col items-center text-center">
            <h4 className="font-bold text-white border-b-2 border-[#FFFFFF] inline-block pb-1">Contact Us</h4>
            <div className="space-y-3 text-sm text-white flex flex-col items-start self-start">
              <div>
                <a href="tel:+919075201035" className="flex items-center gap-2 hover:underline transition-all duration-200">
                  <img src="/images/Mask group.png" alt="phone" className="w-6 h-6 rounded-full" />
                  <span>+91 9075201035</span>
                </a>
              </div>
              <div>
                <a href="mailto:glowvitasalon@gmail.com" className="flex items-center gap-2 hover:underline transition-all duration-200">
                  <img src="/images/Mask group (1).png" alt="email" className="w-6 h-6 rounded-full" />
                  <span className="break-all">glowvitasalon@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-3 mt-2 flex justify-center items-center">
          <div className="text-center text-white text-sm">
            &copy; {new Date().getFullYear()} Created by GlowVita Salon | Developed by <a href="https://www.paarshinfotech.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Paarsh Infotech Pvt. Ltd.</a>
          </div>
        </div>
      </div>
    </footer>
  );
}