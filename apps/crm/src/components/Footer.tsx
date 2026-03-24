
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#422A3C] text-white border-t border-white/10 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img
                src="/images/GlowVita Salon PNG.png"
                alt="GlowVita Salon Logo"
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-white text-sm leading-relaxed">
              GlowVita Salon helps businesses with its all-in-one integrated business solution.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white border-b-2 border-white/30 inline-block pb-1">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white">
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/" className="hover:underline transition-all duration-200">Home</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/apps" className="hover:underline transition-all duration-200">Apps</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/about" className="hover:underline transition-all duration-200">About</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="/support" className="hover:underline transition-all duration-200">Support</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Policies */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white border-b-2 border-white/30 inline-block pb-1">Our Policies</h4>
            <ul className="space-y-2 text-sm text-white">
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="#" className="hover:underline transition-all duration-200">Shipping & Delivery Policy</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="#" className="hover:underline transition-all duration-200">Terms & Conditions</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="#" className="hover:underline transition-all duration-200">Privacy Policy</Link>
              </li>
              <li className="flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-white"></span>
                <Link href="#" className="hover:underline transition-all duration-200">Refund Policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white border-b-2 border-white/30 inline-block pb-1">Contact Us</h4>
            <div className="space-y-3 text-sm text-white">
              <div>
                <a href="tel:+919075201035" className="flex items-center gap-2 hover:underline transition-all duration-200">
                  <Phone className="w-4 h-4 text-white" />
                  <span>+91 9075201035</span>
                </a>
              </div>
              <div>
                <a href="mailto:glowvitasalon@gmail.com" className="flex items-center gap-2 hover:underline transition-all duration-200">
                  <Mail className="w-4 h-4 text-white" />
                  <span className="break-all">glowvitasalon@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

        </div>
        
        <div className="border-t border-white/10 pt-6 mt-8 flex justify-center items-center">
          <div className="text-center text-white text-sm">
            &copy; 2025 Created by GlowVita Salon | Developed by <a href="https://www.paarshinfotech.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Paarsh Infotech Pvt. Ltd.</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
