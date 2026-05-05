import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/contexts/NotificationContext";
import { api } from "@/services/api";
import { FileText, MessageSquare, Bell, User, CheckCircle, Clock, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudentData {
  _id: string;
  name: string;
  matricNumber: string;
  department: string | null;
  level: string | null;
  supervisor_name: string | null;
  supervisor_email: string | null;
}

interface ProposalData {
  _id: string;
  title: string;
  status: string;
  feedback: string | null;
  submittedAt: string;
}

interface AnnouncementData {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      // Get current user data with supervisor populated
      const { data: userData } = await api.get('/auth/me');
      setStudentData({
        _id: userData.user._id,
        name: userData.user.name,
        matricNumber: userData.user.matricNumber || "",
        department: userData.user.department || null,
        level: userData.user.level || null,
        supervisor_name: userData.user.supervisor ? userData.user.supervisor.name : null,
        supervisor_email: userData.user.supervisor ? userData.user.supervisor.email : null,
      });

      // Get latest proposal
      const { data: proposals } = await api.get("/proposals/my");
      if (proposals.length > 0) {
        const latestProposal = proposals[0];
        setProposal({
          _id: latestProposal._id,
          title: latestProposal.title,
          status: latestProposal.status,
          feedback: latestProposal.feedback,
          submittedAt: latestProposal.createdAt,
        });
      }

      // Get announcements
      const { data: announcementsData } = await api.get("/announcements");
      setAnnouncements(announcementsData.map((ann: any) => ({
        _id: ann._id,
        title: ann.title,
        content: ann.content,
        createdAt: ann.createdAt,
        author: ann.author,
      })));

      // Mark announcements as read when viewed on dashboard
      for (const announcement of announcementsData) {
        try {
          await api.put(`/announcements/${announcement._id}/read`);
        } catch (error) {
          // Silently handle errors for marking as read
          console.error("Error marking announcement as read:", error);
        }
      }

      // Refresh notification count after marking announcements as read
      await refreshNotifications();

      // Get unread messages count
      const { data: messages } = await api.get("/messages");
      const unread = messages.filter((msg: any) => !msg.isRead && msg.receiver._id === user!._id).length;
      setUnreadMessages(unread);

    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="badge-pending">Pending Review</span>;
      case "approved":
        return <span className="badge-approved">Approved</span>;
      case "rejected":
        return <span className="badge-rejected">Rejected</span>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-warning" />;
      case "approved":
        return <CheckCircle className="h-6 w-6 text-success" />;
      case "rejected":
        return <XCircle className="h-6 w-6 text-destructive" />;
      default:
        return <FileText className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your project proposal and communications
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Proposal Status"
            value={proposal ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : "Not Submitted"}
            icon={<FileText className="h-5 w-5" />}
            description={proposal ? `Submitted ${new Date(proposal.submittedAt).toLocaleDateString()}` : "Submit your proposal"}
          />
          <StatCard
            title="Supervisor"
            value={studentData?.supervisor_name || "Not Assigned"}
            icon={<User className="h-5 w-5" />}
            description={studentData?.supervisor_name ? "View supervisor details" : "Awaiting assignment"}
          />
          <StatCard
            title="Messages"
            value={unreadMessages}
            icon={<MessageSquare className="h-5 w-5" />}
            description="Unread messages"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Supervisor Card */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Supervisor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentData?.supervisor_name ? (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {studentData.supervisor_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{studentData.supervisor_name}</p>
                    <p className="text-sm text-muted-foreground">{studentData.supervisor_email}</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 mt-1"
                      onClick={() => navigate("/student/messages")}
                    >
                      Send a message →
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">No supervisor assigned yet</p>
                  <p className="text-sm text-muted-foreground">
                    The admin will assign a supervisor to you
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposal Status Card */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Proposal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposal ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      {getStatusIcon(proposal.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{proposal.title}</p>
                      <div className="mt-1">{getStatusBadge(proposal.status)}</div>
                    </div>
                  </div>
                  {proposal.feedback && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm font-medium mb-1">Supervisor Feedback</p>
                      <p className="text-sm text-muted-foreground">{proposal.feedback}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/student/proposal")}
                  >
                    {proposal.status === "rejected" ? "Revise Proposal" : "View Details"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">No proposal submitted</p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/student/proposal")}
                  >
                    Submit Proposal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
            <CardDescription>
              Updates from your supervisor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-4 rounded-lg bg-muted/50 border"
                  >
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {announcements.length > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate("/student/announcements")}
              >
                View All Announcements
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
