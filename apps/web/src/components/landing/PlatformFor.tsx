"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@repo/ui/cn";
import { Sparkles, ArrowRight } from "lucide-react";
import { useGetPublicCategoriesQuery, useGetPublicServicesQuery } from "@repo/store/services/api";
import { Button } from "@repo/ui/button";
import { useSalonFilter } from "./SalonFilterContext";

interface CategoryItem {
  _id: string;
  name: string;
  imageUrl?: string;
}

interface ServiceItem {
  _id: string;
  name: string;
  category?: {
    _id: string;
    name: string;
  } | null;
  imageUrl?: string;
}

const PlatformForCard = ({
  title,
  imageUrl,
  hint,
  onClick,
  itemId,
  isSelected
}: {
  title: string;
  imageUrl: string;
  hint: string;
  onClick?: (id: string) => void;
  itemId: string;
  isSelected?: boolean;
}) => (
  <div
    className={`relative inline-block h-48 w-72 md:h-56 md:w-80 shrink-0 overflow-hidden rounded-lg transition-all duration-500 hover:shadow-2xl group border-2 ${
      isSelected 
        ? "border-primary shadow-lg shadow-primary/25" 
        : "border-border/30 hover:border-primary/50"
    } hover-lift bg-gradient-to-br from-background to-primary/5 cursor-pointer`}
    onClick={() => onClick && onClick(itemId)}
  >
    <Image
      className="size-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 filter group-hover:brightness-110"
      src={imageUrl}
      alt={title}
      width={320}
      height={224}
      data-ai-hint={hint}
    />

    {/* Shimmer Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

    <div className="rounded-md absolute inset-0 z-10 flex w-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
      <div className="rounded-md flex flex-row items-center justify-between gap-2 p-4 md:p-6">
        <div className="text-base md:text-base font-bold leading-tight text-white group-hover:text-primary transition-colors duration-300">
          {title}
        </div>
        <ArrowRight className="h-5s w-5 text-white/70 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </div>

    {/* Hover overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  </div>
);

const PlatformForMarquee = ({ 
  items,
  rtl = false,
  onItemClick,
  selectedItems
}: { 
  items: (CategoryItem | ServiceItem)[];
  rtl?: boolean;
  onItemClick?: (id: string) => void;
  selectedItems?: string[];
}) => {
  // Duplicate items for seamless marquee effect
  const duplicatedItems = [...items, ...items];
  
  return (
    <div className="w-full overflow-hidden">
      <div
        className={`pt-5 flex w-fit items-start space-x-6 md:space-x-8 ${rtl ? "animate-marquee-reverse" : "animate-marquee"} hover:pause-marquee cursor-grab active:cursor-grabbing select-none`}
        style={{ transition: 'transform 0.1s ease-out' }}
        onMouseDown={(e) => {
          e.preventDefault();
          const slider = e.currentTarget;
          const startX = e.pageX - slider.offsetLeft;
          const scrollLeft = slider.scrollLeft;
          
          // Pause the animation while dragging
          slider.style.animationPlayState = 'paused';
          
          const mouseMoveHandler = (moveEvent: MouseEvent) => {
            const x = moveEvent.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
          };
          
          const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            // Resume the animation after dragging with a slight delay for smoothness
            setTimeout(() => {
              slider.style.animationPlayState = 'running';
            }, 100);
          };
          
          document.addEventListener('mousemove', mouseMoveHandler);
          document.addEventListener('mouseup', mouseUpHandler);
        }}
      >
        {duplicatedItems.map((item, index) => (
          <PlatformForCard
            key={`${item._id}-${index}`}
            itemId={item._id}
            title={item.name}
            imageUrl={item.imageUrl || "https://placehold.co/320x224.png"}
            hint={item.name.toLowerCase()}
            onClick={onItemClick}
            isSelected={selectedItems?.includes(item._id)}
          />
        ))}
      </div>
    </div>
  );
};

export function PlatformFor() {
  const [isVisible, setIsVisible] = useState(false);
  const { 
    selectedCategories, 
    selectedServices, 
    addCategory, 
    removeCategory, 
    addService, 
    removeService,
    clearFilters 
  } = useSalonFilter();
  
  // Fetch categories and services
  const { data: CategoriesData, isLoading: categoriesLoading } = useGetPublicCategoriesQuery(undefined);
  const { data: ServicesData, isLoading: servicesLoading } = useGetPublicServicesQuery({});

  // Extract and prepare data for marquees
  const categoryItems = CategoriesData?.categories?.map((category: any) => ({
    _id: category._id,
    name: category.name,
    imageUrl: `https://placehold.co/320x224/7e22ce/ffffff?text=${encodeURIComponent(category.name)}`
  })) || [];

  const serviceItems = ServicesData?.services?.slice(0, 10).map((service: any) => ({
    _id: service._id,
    name: service.name,
    category: service.category,
    imageUrl: `https://placehold.co/320x224/db2777/ffffff?text=${encodeURIComponent(service.name)}`
  })) || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("platform-for");
    if (element) observer.observe(element);

    return () => {
        if (element) {
            observer.unobserve(element);
        }
    };
  }, []);

  // Handle category click - toggle selection
  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      removeCategory(categoryId);
    } else {
      addCategory(categoryId);
      // Clear services when a new category is selected to avoid conflicts
      // setSelectedServices([]);
    }
  };

  // Handle service click - toggle selection
  const handleServiceClick = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      removeService(serviceId);
    } else {
      addService(serviceId);
    }
  };

  return (
    <section
      id="platform-for"
      className="py-20 md:py-28 bg-gradient-to-br from-secondary/20 via-primary/15 to-primary/10 relative overflow-hidden"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-20"></div>
      <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-primary/15 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-secondary/15 to-transparent rounded-full blur-3xl animate-float-delayed"></div>

      <div className="mx-auto max-w-[2000px] space-y-12 md:space-y-16 relative z-10">
        <div
          className={cn(
            "text-center space-y-6 px-4 transition-all duration-1000",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            A Platform for Every Style
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Whether you're running a small boutique salon or managing
            multiple locations, our platform scales with your ambitions and adapts to your unique business
            needs.
          </p>
        </div>

        <div
          className={cn(
            "space-y-8 transition-all duration-1000 delay-300",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <PlatformForMarquee 
              items={categoryItems} 
              onItemClick={handleCategoryClick} 
              selectedItems={selectedCategories}
            />
          </div>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <PlatformForMarquee 
              items={serviceItems} 
              rtl={true} 
              onItemClick={handleServiceClick} 
              selectedItems={selectedServices}
            />
          </div>
          
          {/* Filter Controls */}
          {(selectedCategories.length > 0 || selectedServices.length > 0) && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}