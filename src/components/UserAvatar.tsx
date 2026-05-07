import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarDialog } from "@/components/AvatarDialog";

interface UserAvatarProps {
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    avatarPath?: string;
  } | null;
  className?: string;
  fallbackClassName?: string;
  clickable?: boolean;
}

export function UserAvatar({ user, className, fallbackClassName, clickable = true }: UserAvatarProps) {
  const API_URL = import.meta.env.VITE_API_URL || 'https://project-management-backend-in20.onrender.com/api';

  const getAvatarUrl = () => {
    // Only return URL if user has an avatar
    if (user?._id && user?.avatarPath) {
      // If it's already a full URL (Cloudinary), return it directly
      if (user.avatarPath.startsWith('http')) {
        return user.avatarPath;
      }
      
      // Otherwise, construct URL for backend endpoint
      const baseUrl = API_URL.replace(/\/api$/, '');
      return `${baseUrl}/api/users/avatar/${user._id}`;
    }
    return undefined;
  };

  const avatarUrl = getAvatarUrl();

  const avatarElement = (
    <Avatar className={className}>
      {avatarUrl && (
        <AvatarImage 
          src={avatarUrl} 
          alt={user?.name}
          onError={(e) => {
            // Hide broken image on error
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <AvatarFallback className={fallbackClassName}>
        {user?.name?.charAt(0).toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
  );

  // If clickable and user has avatar, wrap in AvatarDialog
  if (clickable && user) {
    return (
      <AvatarDialog user={user}>
        {avatarElement}
      </AvatarDialog>
    );
  }

  return avatarElement;
}
