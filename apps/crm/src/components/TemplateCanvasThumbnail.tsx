"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

interface TemplateCanvasThumbnailProps {
  imageUrl?: string;
  jsonData?: any;
  alt?: string;
}

/**
 * Resolves the best available preview image URL for a template card.
 *
 * Priority:
 *  1. `imageUrl` from the DB  — rewritten to current origin so the CRM
 *     can load images that were saved with the admin server's port.
 *  2. `jsonData.backgroundImage.src`  (Fabric.js canvas background) — same rewrite.
 *  3. null  → show placeholder icon
 *
 * Absolute URLs are rewritten to `window.location.origin + pathname` so that
 * the same image path works regardless of which port (admin vs CRM) the file
 * was originally saved with.
 */
function normalizeImageUrl(src: string): string {
  if (!src || src.startsWith("data:")) return src;
  if (src.startsWith("http")) {
    try {
      const u = new URL(src);
      // If the stored URL has a different origin (e.g. admin on :3000, CRM on :3001)
      // rewrite it to the current origin so the browser fetches from the right server.
      return `${window.location.origin}${u.pathname}`;
    } catch {
      return src;
    }
  }
  // Relative path — prefix with current origin
  return `${window.location.origin}${src.startsWith("/") ? "" : "/"}${src}`;
}

function resolvePreviewUrl(
  imageUrl?: string,
  jsonData?: any
): string | null {
  // 1. DB imageUrl
  if (imageUrl && imageUrl.trim() !== "") {
    return normalizeImageUrl(imageUrl.trim());
  }

  // 2. Extract background image src from Fabric JSON
  try {
    let parsed = jsonData;
    if (typeof jsonData === "string") {
      parsed = JSON.parse(jsonData);
    }
    const bgSrc: string | undefined = parsed?.backgroundImage?.src;
    if (bgSrc && bgSrc.trim() !== "") {
      return normalizeImageUrl(bgSrc.trim());
    }
  } catch {
    // ignore JSON parse errors
  }

  return null;
}

export default function TemplateCanvasThumbnail({
  imageUrl,
  jsonData,
  alt = "Template preview",
}: TemplateCanvasThumbnailProps) {
  const src = resolvePreviewUrl(imageUrl, jsonData);
  const [imgError, setImgError] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  const currentSrc = fallbackSrc || src;

  // No source at all
  if (!currentSrc || imgError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-2">
        <ImageIcon className="h-10 w-10 text-gray-400" />
        <span className="text-xs text-gray-400">No preview</span>
      </div>
    );
  }

  const handleError = () => {
    // If it failed on the current localhost port, try the local proxy route
    // which reads the file directly from the admin app's public directory.
    if (!fallbackSrc && src && src.includes("localhost")) {
      try {
        const proxyUrl = `/api/local-image?url=${encodeURIComponent(src)}`;
        setFallbackSrc(proxyUrl);
      } catch {
        setImgError(true);
      }
    } else {
      setImgError(true);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={handleError}
    />
  );
}
