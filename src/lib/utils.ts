import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get the correct URL for static assets (images)
export const getAssetUrl = (path: string) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // For Vercel deployment, images in public folder are served from root
  // Always use root path for static assets
  return `/${cleanPath}`;
};
