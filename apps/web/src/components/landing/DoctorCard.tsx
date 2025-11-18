"use client";

import { Button } from "@repo/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@repo/ui/cn";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useAddDoctorToWishlistMutation, useRemoveDoctorFromWishlistMutation } from "@repo/store/services/api";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  image?: string;
  rating: number;
  consultationFee: number;
  clinicName: string;
  city: string;
  state: string;
  isFavorite?: boolean;
}

export function DoctorCard({
  id,
  name,
  specialty,
  experience,
  image,
  rating,
  consultationFee,
  clinicName,
  city,
  state,
  isFavorite: initialIsFavorite = false,
}: DoctorCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  // RTK Query mutations
  const [addDoctorToWishlist, { isLoading: isAddingToWishlist }] = useAddDoctorToWishlistMutation();
  const [removeDoctorFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveDoctorFromWishlistMutation();

  const isLoading = isAddingToWishlist || isRemovingFromWishlist;

  const handleCardClick = () => {
    router.push(`/doctors/${id}`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login to add doctors to your wishlist");
      router.push("/client-login");
      return;
    }

    try {
      if (isFavorite) {
        // Remove from wishlist
        await removeDoctorFromWishlist(id).unwrap();
        setIsFavorite(false);
        toast.success("Removed from Wishlist", {
          description: "Doctor removed from your wishlist"
        });
      } else {
        // Add to wishlist
        await addDoctorToWishlist(id).unwrap();
        setIsFavorite(true);
        toast.success("Added to Wishlist", {
          description: "Doctor added to your wishlist"
        });
      }
    } catch (error: any) {
      console.error("Failed to update wishlist:", error);
      toast.error("Wishlist Update Failed", {
        description: error?.data?.message || "Failed to update wishlist. Please try again."
      });
    }
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-md hover:shadow-md border bg-card transition-all duration-500 hover:-translate-y-2 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Upper Half: Image */}
      <div className="aspect-[4/3] relative w-full overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-500">
              {name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
        
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 text-blue-500 backdrop-blur-sm hover:bg-white/30 transition-all",
            isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={handleWishlistToggle}
          disabled={isLoading}
        >
          <Heart
            className={cn("h-4 w-4", isFavorite && "fill-current text-blue-500")}
          />
        </Button>
      </div>

      {/* Lower Half: Details */}
      <div className="p-4 flex flex-col justify-between h-fit bg-card">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {specialty}
          </p>
          <h3 className="font-bold text-base text-foreground line-clamp-1 leading-snug mb-1 group-hover:text-primary transition-colors">
            {name}
          </h3>

          <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
            {clinicName}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-foreground">
                {experience}+ years
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary">
                ₹{consultationFee.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-fit rounded-lg group-hover:text-primary transition-colors group-hover:border-primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/doctors/${id}`);
              }}
            >
              View Profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-fit rounded-lg group-hover:text-primary transition-colors group-hover:border-primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/doctors/${id}`);
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}