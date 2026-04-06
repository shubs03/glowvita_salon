"use client";

import React from "react";
import { Star, Users, MapPin, Sparkles, Heart, Calendar } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";

interface SalonCardProps {
    id: string;
    title: string;
    location: string;
    rating: string | number;
    clients: string;
    specialty: string;
    description: string;
    growth?: string;
    image: string;
    category?: string;
    subCategories?: string[];
    className?: string;
    onRemove?: (id: string) => void;
    showRemoveButton?: boolean;
}

export const SalonCard: React.FC<SalonCardProps> = ({
    id,
    title,
    location,
    rating,
    clients,
    specialty,
    description,
    growth,
    image,
    category,
    subCategories,
    className,
    onRemove,
    showRemoveButton = false,
}) => {
    const router = useRouter();

    const handleSalonClick = () => {
        router.push(`/salon-details/${id}`);
    };

    const getIconForCategory = () => {
        if (subCategories?.includes("at-home")) return Calendar;
        if (category === "unisex") return Users;
        if (category === "women") return Heart;
        if (category === "men") return Star;
        return Sparkles;
    };

    const IconComponent = getIconForCategory();

    return (
        <div
            className={cn(
                "group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full relative flex flex-col",
                className
            )}
            onClick={handleSalonClick}
        >
            {/* Image Container */}
            <div className="relative h-48 flex-shrink-0 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Remove Button for Wishlist */}
                {showRemoveButton && onRemove && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(id);
                        }}
                        className="absolute top-3 right-3 z-20 p-2 bg-background/80 hover:bg-destructive/10 hover:text-destructive rounded-full backdrop-blur-md transition-all duration-200 shadow-sm"
                        title="Remove from wishlist"
                    >
                        <Heart className="h-4 w-4 fill-destructive text-destructive" />
                    </button>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title and Rating */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <h3 className="font-bold text-card-foreground text-base leading-tight mb-1 group-hover:text-primary transition-colors duration-300">
                            {title}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                            {specialty}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 bg-accent/50 px-2 py-1 rounded-lg ml-2 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                        <span className="text-xs font-bold text-accent-foreground">
                            {Number(rating).toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground text-xs leading-tight line-clamp-1">
                        {location}
                    </p>
                </div>

                {/* Description (Optional, hidden in listing but useful in wishlist/landing) */}
                <p className="text-muted-foreground text-[11px] mb-3 line-clamp-2 flex-1">
                    {description}
                </p>

                {/* Stats Row */}
                <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-card-foreground">
                            {clients} Clients
                        </span>
                    </div>
                    {growth && (
                        <div className="text-[10px] text-green-600 font-medium">
                            {growth}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
