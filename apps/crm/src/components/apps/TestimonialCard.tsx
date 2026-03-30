import { cn } from "@repo/ui/cn";

interface TestimonialCardProps {
  imageSrc: string;
  name: string;
  role: string;
  review: string;
  date: string;
}

const TestimonialCard = ({
  imageSrc,
  name,
  role,
  review,
  date,
}: TestimonialCardProps) => (
  <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-center md:items-start gap-6 max-w-4xl mx-auto border border-white/20 h-full max-h-[320px] overflow-hidden">
    {/* Profile Image */}
    <div className="flex-shrink-0 relative group">
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md relative z-10">
        <img 
          src={imageSrc} 
          alt={name} 
          className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-500"
        />
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-indigo-100 -m-1.5 opacity-40 group-hover:scale-110 transition-transform duration-500"></div>
    </div>

    {/* Content */}
    <div className="flex-grow text-center md:text-left overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-3">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 font-manrope tracking-tight">
          {name}
        </h3>
        <span className="text-gray-400 text-xs md:text-sm font-medium font-manrope flex items-center gap-1.5">
          <span className="hidden md:inline text-gray-200">•</span> {role}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm md:text-base leading-relaxed font-manrope font-light italic relative mb-4 line-clamp-4">
        "{review}"
      </p>
      
      <p className="text-gray-400 text-xs font-manrope font-medium tracking-wide">
        {date}
      </p>
    </div>
  </div>
);

export default TestimonialCard;