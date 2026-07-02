import { NextResponse } from "next/server";

export async function GET() {
  const aboutData = {
    intro: {
      brandMark: "Welcome to GlowVita Salon",
      headline: "Discover Your Perfect Salon Experience",
      description:
        "GlowVita is your trusted online platform for discovering and booking exceptional salon services. Explore verified salons near you or across the city, read authentic reviews, compare services, and schedule appointments effortlessly—all in one elegant experience.",
      supportingText:
        "From haircuts to spa treatments, finding quality beauty and wellness services has never been easier.",
    },
    purpose: {
      title: "Our Purpose",
      description:
        "We believe everyone deserves access to exceptional beauty and wellness services. GlowVita was created to bridge the gap between talented professionals and customers seeking transformative experiences, making premium self-care simple, trusted, and effortlessly within reach.",
    },
    vision: {
      title: "Our Vision",
      description:
        "We're constantly evolving to bring you better experiences, innovative features, and deeper connections with the beauty and wellness community you trust. Our journey is just beginning, and we're excited to have you with us. Join us in shaping the future of beauty and wellness services.",
    },
    whyChooseUs: {
      title: "Why Customers Choose GlowVita ?",
      description: "Discover what makes GlowVita the preferred choice for beauty and wellness enthusiasts.",
      features: [
        {
          title: "Trusted & Verified Salons",
          description: "Customers get access to high-quality, reliable salons they can book with confidence."
        },
        {
          title: "Find Salons Near You",
          description: "Discover nearby salons instantly with location-based search."
        },
        {
          title: "Fast & Easy Booking",
          description: "A smooth experience that helps users find and book services in just a few taps."
        },
        {
          title: "Real Reviews & Ratings",
          description: "Users can make informed choices based on genuine feedback from other customers."
        },
        {
          title: "Detailed Service Information",
          description: "Everything you need to know, clearly explained."
        }
      ]
    },
    audiences: [
      "Beauty Enthusiasts",
      "Salon Professionals",
      "Wellness Seekers",
      "Busy Professionals",
      "Style Conscious Individuals",
      "Self-Care Advocates",
    ],
    philosophy: [
      {
        title: "Simplicity",
        description:
          "We believe beauty services should be easy to find, book, and enjoy without unnecessary complexity.",
      },
      {
        title: "Performance",
        description:
          "We deliver fast, reliable experiences that respect your time and exceed your expectations.",
      },
      {
        title: "Trust",
        description:
          "We build confidence through transparency, verified reviews, and secure transactions every time.",
      },
    ],

  };

  return NextResponse.json({
    success: true,
    data: aboutData,
  });
}
