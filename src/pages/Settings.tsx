import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Lock, Eye, EyeOff, Upload, User as UserIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'https://project-management-backend-in20.onrender.com/api';

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast({
        title: "Success",
        description: "Your password has been updated successfully",
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });

      // Reload page to update avatar everywhere
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await api.delete('/users/avatar');

      setAvatarPreview(null);

      toast({
        title: "Success",
        description: "Avatar deleted successfully",
      });

      // Reload page to update avatar everywhere
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    // Only return URL if user has an avatar
    if (user?._id && user?.avatarPath) {
      return `${API_URL}/users/avatar/${user._id}`;
    }
    return undefined; // Return undefined to prevent image loading
  };

  const avatarUrl = getAvatarUrl();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        {/* Avatar Upload Card */}
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile Picture
            </CardTitle>
            <CardDescription>
              Upload a profile picture to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
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
                <AvatarFallback className="text-3xl">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingAvatar ? "Uploading..." : user?.avatarPath ? "Change Photo" : "Upload Photo"}
                </Button>

                {(user?.avatarPath || avatarPreview) && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteAvatar}
                    disabled={isUploadingAvatar}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <p className="text-xs text-muted-foreground text-center">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
