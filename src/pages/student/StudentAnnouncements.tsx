import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/contexts/NotificationContext";
import { api } from "@/services/api";
import { Bell, Loader2 } from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function StudentAnnouncements() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data);
      
      // Mark all announcements as read when the page is viewed
      for (const announcement of data) {
        try {
          await api.put(`/announcements/${announcement._id}/read`);
        } catch (error) {
          // Silently handle errors for marking as read
          console.error("Error marking announcement as read:", error);
        }
      }
      
      // Refresh notification count after marking announcements as read
      await refreshNotifications();
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Updates from your supervisor
          </p>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              All Announcements
            </CardTitle>
            <CardDescription>
              {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No announcements yet</p>
                <p className="text-sm text-muted-foreground">
                  {user ? "Announcements from your supervisor will appear here" : "No supervisor assigned"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-4 rounded-lg bg-muted/50 border"
                  >
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Posted {new Date(announcement.createdAt).toLocaleDateString()} at{" "}
                      {new Date(announcement.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
