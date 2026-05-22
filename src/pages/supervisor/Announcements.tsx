import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/contexts/NotificationContext";
import { api } from "@/services/api";
import { Bell, Plus, Loader2, Megaphone } from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  targetRole: string;
  createdAt: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function Announcements() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("all");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/announcements/my');
      setAnnouncements(data);
      
      // Mark all announcements as read when viewed (for supervisors viewing their own announcements)
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
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      await api.post('/announcements', {
        title: title.trim(),
        content: content.trim(),
        targetRole,
      });

      toast({
        title: "Announcement Posted",
        description: "Your announcement has been sent to students",
      });

      setDialogOpen(false);
      resetForm();
      fetchData();
      // Refresh notifications after creating announcement
      await refreshNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTargetRole("all");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Post announcements to your students
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Post an announcement to your students
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your announcement..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Audience</Label>
                  <select
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="all">All Users</option>
                    <option value="student">Students Only</option>
                  </select>
                </div>

                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Megaphone className="mr-2 h-4 w-4" />
                      Post Announcement
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Posted Announcements
            </CardTitle>
            <CardDescription>
              {announcements.length} announcement{announcements.length !== 1 ? "s" : ""} posted
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
                  Click "New Announcement" to create one
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-4 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Posted {new Date(announcement.createdAt).toLocaleDateString()} •{" "}
                          Target: {announcement.targetRole === "all" ? "All users" : announcement.targetRole}
                        </p>
                      </div>
                    </div>
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
