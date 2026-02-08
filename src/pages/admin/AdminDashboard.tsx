import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import { Users, UserCog, FileText, UserPlus, CheckCircle, Clock, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface DashboardStats {
  totalStudents: number;
  totalSupervisors: number;
  assignedStudents: number;
  unassignedStudents: number;
  pendingProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
}

const CHART_COLORS = ["hsl(222, 47%, 30%)", "hsl(38, 92%, 50%)", "hsl(142, 76%, 36%)", "hsl(0, 72%, 51%)"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalSupervisors: 0,
    assignedStudents: 0,
    unassignedStudents: 0,
    pendingProposals: 0,
    approvedProposals: 0,
    rejectedProposals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/users/stats');
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const assignmentData = [
    { name: "Assigned", value: stats.assignedStudents, color: CHART_COLORS[2] },
    { name: "Unassigned", value: stats.unassignedStudents, color: CHART_COLORS[3] },
  ];

  const proposalData = [
    { name: "Pending", value: stats.pendingProposals },
    { name: "Approved", value: stats.approvedProposals },
    { name: "Rejected", value: stats.rejectedProposals },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of the FYP supervision system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="h-5 w-5" />}
            description="Registered students"
          />
          <StatCard
            title="Total Supervisors"
            value={stats.totalSupervisors}
            icon={<UserCog className="h-5 w-5" />}
            description="Active supervisors"
          />
          <StatCard
            title="Assigned Students"
            value={stats.assignedStudents}
            icon={<UserPlus className="h-5 w-5" />}
            description={`${stats.unassignedStudents} unassigned`}
          />
          <StatCard
            title="Total Proposals"
            value={stats.pendingProposals + stats.approvedProposals + stats.rejectedProposals}
            icon={<FileText className="h-5 w-5" />}
            description="All submissions"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Assignment Status */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Student Assignments</CardTitle>
              <CardDescription>Distribution of assigned vs unassigned students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assignmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {assignmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Status */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Proposal Overview</CardTitle>
              <CardDescription>Status breakdown of all proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={proposalData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingProposals}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approvedProposals}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rejectedProposals}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
