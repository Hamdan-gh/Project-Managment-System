import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user?: {
    _id?: string;
    name?: string;
    avatarPath?: string;
  } | null;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ user, className, fallbackClassName }: UserAvatarProps) {
  const API_URL = import.meta.env.VITE_API_URL || 'https://project-management-backend-in20.onrender.com/api';

  const getAvatarUrl = () => {
    // Only return URL if user has an avatar
    if (user?._id && user?.avatarPath) {
      return `${API_URL}/users/avatar/${user._id}`;
    }
    return undefined; // Return undefined instead of null to prevent image loading
  };

  const avatarUrl = getAvatarUrl();

  return (
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
}
