import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get the correct URL for static assets (images)
export const getAssetUrl = (path: string) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production with separate backend, use the API base URL
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const baseUrl = apiUrl.replace('/api', ''); // Remove /api suffix
    return `${baseUrl}/assets/${cleanPath}`;
  }
  
  // In development or same-domain deployment, use relative path
  return `/${cleanPath}`;
};
