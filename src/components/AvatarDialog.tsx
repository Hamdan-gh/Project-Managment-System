import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

interface AvatarDialogProps {
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    avatarPath?: string;
  } | null;
  children: React.ReactNode;
}

export function AvatarDialog({ user, children }: AvatarDialogProps) {
  const [open, setOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'https://project-management-backend-in20.onrender.com/api';

  const getAvatarUrl = () => {
    if (user?.avatarPath) {
      // If it's already a full URL (Cloudinary), return it directly
      if (user.avatarPath.startsWith('http')) {
        return user.avatarPath;
      }
      
      // Otherwise, construct URL for backend endpoint (legacy support)
      if (user._id) {
        const baseUrl = API_URL.replace(/\/api$/, '');
        return `${baseUrl}/api/users/avatar/${user._id}`;
      }
    }
    return undefined;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{user?.name || "User Profile"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {avatarUrl ? (
              <div className="relative w-full max-w-sm aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src={avatarUrl}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load avatar image:', avatarUrl);
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-center">
                          <svg class="mx-auto h-24 w-24 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p class="mt-4 text-muted-foreground">Could not load image</p>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-full max-w-sm aspect-square rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center">
                  <UserIcon className="mx-auto h-24 w-24 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No profile picture</p>
                </div>
              </div>
            )}
            {user?.email && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
