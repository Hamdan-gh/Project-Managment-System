import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/contexts/NotificationContext";
import { api } from "@/services/api";
import { Users, FileText, CheckCircle, Clock, XCircle, MessageSquare, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SupervisorStats {
  totalStudents: number;
  pendingProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  unreadMessages: number;
}

interface RecentProposal {
  id: string;
  title: string;
  status: string;
  student_name: string;
  submitted_at: string;
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SupervisorStats>({
    totalStudents: 0,
    pendingProposals: 0,
    approvedProposals: 0,
    rejectedProposals: 0,
    unreadMessages: 0,
  });
  const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([]);
  const [supervisorId, setSupervisorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSupervisorData();
    }
  }, [user]);

  const fetchSupervisorData = async () => {
    try {
      setIsLoading(true);
      
      // Get assigned students
      const { data: students } = await api.get('/users/supervisor/students');

      // Get proposals
      const { data: proposals } = await api.get('/proposals');

      const pendingProposals = proposals.filter((p: any) => p.status === "pending").length;
      const approvedProposals = proposals.filter((p: any) => p.status === "approved").length;
      const rejectedProposals = proposals.filter((p: any) => p.status === "rejected").length;

      // Get unread messages
      const { data: unreadData } = await api.get('/messages/unread');
      const unreadMessages = unreadData.count;

      // Get recent proposals with student names (ensure student is populated)
      const recentProposalsWithNames = proposals
        .filter((p: any) => p.student) // Only include proposals with student data
        .slice(0, 5)
        .map((proposal: any) => ({
          id: proposal._id,
          title: proposal.title,
          status: proposal.status,
          student_name: proposal.student?.name || 'Unknown Student',
          submitted_at: proposal.createdAt,
        }));

      setStats({
        totalStudents: students.length,
        pendingProposals,
        approvedProposals,
        rejectedProposals,
        unreadMessages,
      });

      setRecentProposals(recentProposalsWithNames);
      
      // Refresh notifications when dashboard is loaded
      await refreshNotifications();
    } catch (error) {
      console.error("Error fetching supervisor data:", error);
      // Set default values on error
      setStats({
        totalStudents: 0,
        pendingProposals: 0,
        approvedProposals: 0,
        rejectedProposals: 0,
        unreadMessages: 0,
      });
      setRecentProposals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supervisor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your students and their project proposals
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Students"
            value={isLoading ? "..." : stats.totalStudents}
            icon={<Users className="h-5 w-5" />}
            description="Assigned students"
          />
          <StatCard
            title="Pending Review"
            value={isLoading ? "..." : stats.pendingProposals}
            icon={<Clock className="h-5 w-5" />}
            description="Awaiting feedback"
          />
          <StatCard
            title="Approved"
            value={isLoading ? "..." : stats.approvedProposals}
            icon={<CheckCircle className="h-5 w-5" />}
            description="Accepted proposals"
          />
          <StatCard
            title="Unread Messages"
            value={isLoading ? "..." : stats.unreadMessages}
            icon={<MessageSquare className="h-5 w-5" />}
            description="From students"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-elevated cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/supervisor/students")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">View Students</p>
                  <p className="text-sm text-muted-foreground">Manage assigned students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/supervisor/proposals")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="font-semibold">Review Proposals</p>
                  <p className="text-sm text-muted-foreground">{isLoading ? "Loading..." : `${stats.pendingProposals} pending review`}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/supervisor/announcements")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-info/20 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="font-semibold">Post Announcement</p>
                  <p className="text-sm text-muted-foreground">Notify your students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Proposals */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Proposals
            </CardTitle>
            <CardDescription>Latest submissions from your students</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading proposals...</p>
              </div>
            ) : recentProposals.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No proposals yet</p>
                <p className="text-sm text-muted-foreground">
                  Proposals from your students will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{proposal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {proposal.student_name} • {new Date(proposal.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(proposal.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && recentProposals.length > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate("/supervisor/proposals")}
              >
                View All Proposals
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
