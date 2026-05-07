import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { AlertCard } from "@/components/ui/alert-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/services/api";
import { 
  Users, 
  UserCog, 
  FileText, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  MessageSquare,
  Target,
  Award,
  BookOpen,
  Download,
  Filter,
  RefreshCw,
  Loader2
} from "lucide-react";
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";

interface DashboardStats {
  totalStudents: number;
  totalSupervisors: number;
  assignedStudents: number;
  unassignedStudents: number;
  pendingProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  totalChapters: number;
  approvedChapters: number;
  pendingChapters: number;
  totalMessages: number;
  activeUsers: number;
  completionRate: number;
  averageProgress: number;
}

interface KPIMetrics {
  proposalApprovalRate: number;
  averageResponseTime: number;
  studentEngagement: number;
  systemUtilization: number;
  riskStudents: number;
  onTrackStudents: number;
}

interface ActivityItem {
  id: string;
  type: "proposal" | "chapter" | "message" | "assignment" | "approval" | "rejection" | "login";
  user: {
    name: string;
    avatar?: string;
    role: "student" | "supervisor" | "admin";
  };
  title: string;
  description?: string;
  timestamp: Date;
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  category: "student" | "supervisor" | "system" | "deadline";
  title: string;
  description: string;
  timestamp: Date;
  actionLabel?: string;
  onAction?: () => void;
}

const CHART_COLORS = [
  "hsl(222, 47%, 30%)", 
  "hsl(38, 92%, 50%)", 
  "hsl(142, 76%, 36%)", 
  "hsl(0, 72%, 51%)",
  "hsl(262, 83%, 58%)",
  "hsl(196, 100%, 47%)"
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalSupervisors: 0,
    assignedStudents: 0,
    unassignedStudents: 0,
    pendingProposals: 0,
    approvedProposals: 0,
    rejectedProposals: 0,
    totalChapters: 0,
    approvedChapters: 0,
    pendingChapters: 0,
    totalMessages: 0,
    activeUsers: 0,
    completionRate: 0,
    averageProgress: 0,
  });

  const [kpis, setKpis] = useState<KPIMetrics>({
    proposalApprovalRate: 0,
    averageResponseTime: 0,
    studentEngagement: 0,
    systemUtilization: 0,
    riskStudents: 0,
    onTrackStudents: 0,
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Chart data states
  const [assignmentData, setAssignmentData] = useState<any[]>([]);
  const [proposalData, setProposalData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update chart data when stats change
  useEffect(() => {
    if (stats.totalStudents > 0) {
      setAssignmentData([
        { name: "Assigned", value: stats.assignedStudents, color: CHART_COLORS[2] },
        { name: "Unassigned", value: stats.unassignedStudents, color: CHART_COLORS[3] },
      ]);

      setProposalData([
        { name: "Pending", value: stats.pendingProposals, fill: CHART_COLORS[1] },
        { name: "Approved", value: stats.approvedProposals, fill: CHART_COLORS[2] },
        { name: "Rejected", value: stats.rejectedProposals, fill: CHART_COLORS[3] },
      ]);
    }
  }, [stats]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch comprehensive dashboard stats
      const { data: statsData } = await api.get('/analytics/dashboard-stats');
      setStats(statsData);

      // Fetch KPI metrics
      const { data: kpiData } = await api.get('/analytics/kpi-metrics');
      setKpis(kpiData);

      // Fetch recent activities
      const { data: activitiesData } = await api.get('/analytics/recent-activities?limit=8');
      setActivities(activitiesData);
      
      // Fetch system alerts
      const { data: alertsData } = await api.get('/analytics/system-alerts');
      setAlerts(alertsData);

      // Fetch chart data
      await fetchChartData();

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback to mock data if API fails
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      // Fetch progress distribution
      const { data: progressDist } = await api.get('/analytics/chart-data/progress-distribution');
      
      // Fetch engagement trends
      const { data: engagementTrends } = await api.get('/analytics/chart-data/engagement-trends');
      setEngagementData(engagementTrends);
      
      // Fetch monthly progress
      const { data: monthlyProgress } = await api.get('/analytics/chart-data/monthly-progress');
      setProgressData(monthlyProgress);

      // Update assignment and proposal data based on current stats
      setAssignmentData([
        { name: "Assigned", value: stats.assignedStudents, color: CHART_COLORS[2] },
        { name: "Unassigned", value: stats.unassignedStudents, color: CHART_COLORS[3] },
      ]);

      setProposalData([
        { name: "Pending", value: stats.pendingProposals, fill: CHART_COLORS[1] },
        { name: "Approved", value: stats.approvedProposals, fill: CHART_COLORS[2] },
        { name: "Rejected", value: stats.rejectedProposals, fill: CHART_COLORS[3] },
      ]);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      // Use fallback mock data
      generateMockChartData();
    }
  };

  const generateMockChartData = () => {
    setAssignmentData([
      { name: "Assigned", value: stats.assignedStudents, color: CHART_COLORS[2] },
      { name: "Unassigned", value: stats.unassignedStudents, color: CHART_COLORS[3] },
    ]);

    setProposalData([
      { name: "Pending", value: stats.pendingProposals, fill: CHART_COLORS[1] },
      { name: "Approved", value: stats.approvedProposals, fill: CHART_COLORS[2] },
      { name: "Rejected", value: stats.rejectedProposals, fill: CHART_COLORS[3] },
    ]);

    setProgressData([
      { month: "Jan", students: 45, completion: 12 },
      { month: "Feb", students: 52, completion: 18 },
      { month: "Mar", students: 48, completion: 25 },
      { month: "Apr", students: 61, completion: 32 },
      { month: "May", students: 55, completion: 28 },
      { month: "Jun", students: 67, completion: 35 },
    ]);

    setEngagementData([
      { week: "Week 1", engagement: 65, submissions: 8, messages: 120 },
      { week: "Week 2", engagement: 72, submissions: 12, messages: 145 },
      { week: "Week 3", engagement: 68, submissions: 6, messages: 98 },
      { week: "Week 4", engagement: 78, submissions: 15, messages: 167 },
      { week: "Week 5", engagement: 75, submissions: 11, messages: 134 },
      { week: "Week 6", engagement: 82, submissions: 18, messages: 189 }
    ]);
  };

  const generateMockData = () => {
    // Fallback mock data if API fails
    setStats({
      totalStudents: 50,
      totalSupervisors: 15,
      assignedStudents: 42,
      unassignedStudents: 8,
      pendingProposals: 12,
      approvedProposals: 28,
      rejectedProposals: 5,
      totalChapters: 85,
      approvedChapters: 62,
      pendingChapters: 18,
      totalMessages: 340,
      activeUsers: 38,
      completionRate: 75,
      averageProgress: 68,
    });

    setKpis({
      proposalApprovalRate: 82,
      averageResponseTime: 8,
      studentEngagement: 76,
      systemUtilization: 88,
      riskStudents: 6,
      onTrackStudents: 44,
    });

    generateMockActivities({ totalStudents: 50 });
    generateMockAlerts({ riskStudents: 6, averageResponseTime: 8, proposalApprovalRate: 82 });
    generateMockChartData();
  };

  const generateMockActivities = (statsData: any) => {
    const mockActivities: ActivityItem[] = [
      {
        id: "1",
        type: "proposal",
        user: { name: "John Doe", role: "student" },
        title: "Submitted new project proposal",
        description: "AI-Based Student Performance Prediction System",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      },
      {
        id: "2",
        type: "approval",
        user: { name: "Dr. Smith", role: "supervisor" },
        title: "Approved chapter submission",
        description: "Chapter 3: Literature Review approved for Jane Wilson",
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      },
      {
        id: "3",
        type: "assignment",
        user: { name: "Admin", role: "admin" },
        title: "Student assigned to supervisor",
        description: "Michael Brown assigned to Dr. Johnson",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: "4",
        type: "chapter",
        user: { name: "Sarah Davis", role: "student" },
        title: "Uploaded new chapter",
        description: "Chapter 4: Methodology and Implementation",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      },
      {
        id: "5",
        type: "message",
        user: { name: "Dr. Wilson", role: "supervisor" },
        title: "Sent feedback message",
        description: "Provided detailed feedback on research methodology",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      },
    ];
    setActivities(mockActivities);
  };

  const generateMockAlerts = (kpiData: KPIMetrics) => {
    const mockAlerts: Alert[] = [];

    // Critical alerts
    if (kpiData.riskStudents > 5) {
      mockAlerts.push({
        id: "alert-1",
        type: "critical",
        category: "student",
        title: "High-Risk Students Detected",
        description: `${kpiData.riskStudents} students are at risk of not completing their projects on time`,
        timestamp: new Date(),
        actionLabel: "View Details",
        onAction: () => console.log("View risk students"),
      });
    }

    // Warning alerts
    if (kpiData.averageResponseTime > 12) {
      mockAlerts.push({
        id: "alert-2",
        type: "warning",
        category: "supervisor",
        title: "Slow Response Times",
        description: `Average supervisor response time is ${kpiData.averageResponseTime} hours`,
        timestamp: new Date(),
        actionLabel: "Send Reminder",
        onAction: () => console.log("Send reminder to supervisors"),
      });
    }

    // Info alerts
    mockAlerts.push({
      id: "alert-3",
      type: "info",
      category: "system",
      title: "System Maintenance Scheduled",
      description: "Scheduled maintenance window: Sunday 2:00 AM - 4:00 AM",
      timestamp: new Date(),
    });

    // Success alerts
    if (kpiData.proposalApprovalRate > 80) {
      mockAlerts.push({
        id: "alert-4",
        type: "success",
        category: "system",
        title: "High Approval Rate",
        description: `Proposal approval rate is ${kpiData.proposalApprovalRate}% - excellent quality!`,
        timestamp: new Date(),
      });
    }

    setAlerts(mockAlerts);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive overview of the FYP supervision system
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button variant="outline" size="sm" onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            description={`${stats.assignedStudents} assigned`}
            trend={{
              value: 8.2,
              label: "vs last month",
              type: "increase"
            }}
          />
          <StatCard
            title="Active Projects"
            value={stats.approvedProposals}
            icon={<FileText className="h-5 w-5 text-green-600" />}
            description={`${stats.pendingProposals} pending review`}
            trend={{
              value: 12.5,
              label: "vs last month",
              type: "increase"
            }}
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={<Target className="h-5 w-5 text-purple-600" />}
            description="Projects completed on time"
            trend={{
              value: 3.1,
              label: "vs last month",
              type: "increase"
            }}
          />
          <StatCard
            title="System Health"
            value={`${kpis.systemUtilization}%`}
            icon={<Activity className="h-5 w-5 text-orange-600" />}
            description="Overall system utilization"
            trend={{
              value: -1.2,
              label: "vs last week",
              type: "decrease"
            }}
            variant={kpis.systemUtilization > 90 ? "success" : "default"}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Proposal Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ProgressRing progress={kpis.proposalApprovalRate} size={80}>
                  <div className="text-center">
                    <div className="text-lg font-bold">{kpis.proposalApprovalRate}%</div>
                  </div>
                </ProgressRing>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{kpis.averageResponseTime}h</div>
                <p className="text-xs text-muted-foreground mt-1">Supervisor feedback</p>
                <Badge variant={kpis.averageResponseTime < 12 ? "default" : "destructive"} className="mt-2">
                  {kpis.averageResponseTime < 12 ? "Good" : "Needs Attention"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Student Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{kpis.studentEngagement}%</div>
                <p className="text-xs text-muted-foreground mt-1">Daily active users</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+5.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">At Risk</span>
                  <Badge variant="destructive" className="text-xs">
                    {kpis.riskStudents}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">On Track</span>
                  <Badge variant="default" className="text-xs">
                    {kpis.onTrackStudents}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(kpis.onTrackStudents / stats.totalStudents) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="engagement">User Engagement</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Assignment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Student Assignments
                  </CardTitle>
                  <CardDescription>Distribution of assigned vs unassigned students</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={assignmentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {assignmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Proposal Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Proposal Overview
                  </CardTitle>
                  <CardDescription>Status breakdown of all proposals</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={proposalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Student Progress Trends
                </CardTitle>
                <CardDescription>Monthly student enrollment and project completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="students" 
                        stackId="1" 
                        stroke={CHART_COLORS[0]} 
                        fill={CHART_COLORS[0]} 
                        name="Active Students"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completion" 
                        stackId="2" 
                        stroke={CHART_COLORS[2]} 
                        fill={CHART_COLORS[2]} 
                        name="Completed Projects"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Weekly User Engagement
                </CardTitle>
                <CardDescription>Daily login activity, messages, and submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="logins" 
                        stroke={CHART_COLORS[0]} 
                        strokeWidth={2}
                        name="Daily Logins"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="messages" 
                        stroke={CHART_COLORS[1]} 
                        strokeWidth={2}
                        name="Messages Sent"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="submissions" 
                        stroke={CHART_COLORS[2]} 
                        strokeWidth={2}
                        name="Submissions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <StatCard
                title="Average Project Duration"
                value="4.2 months"
                icon={<Calendar className="h-5 w-5 text-blue-600" />}
                description="From proposal to completion"
                trend={{
                  value: -8.5,
                  label: "vs target",
                  type: "decrease"
                }}
                variant="success"
              />
              <StatCard
                title="Supervisor Workload"
                value="6.8 students"
                icon={<Users className="h-5 w-5 text-purple-600" />}
                description="Average per supervisor"
                trend={{
                  value: 2.1,
                  label: "vs last semester",
                  type: "increase"
                }}
              />
              <StatCard
                title="Quality Score"
                value="87%"
                icon={<Award className="h-5 w-5 text-green-600" />}
                description="Based on feedback ratings"
                trend={{
                  value: 4.3,
                  label: "vs last month",
                  type: "increase"
                }}
                variant="success"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Activity and Alerts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityFeed activities={activities} maxItems={8} />
          <AlertCard alerts={alerts} maxItems={6} />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Add Student</div>
                    <div className="text-xs text-muted-foreground">Register new student</div>
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <UserCog className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Assign Supervisor</div>
                    <div className="text-xs text-muted-foreground">Manage assignments</div>
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Review Proposals</div>
                    <div className="text-xs text-muted-foreground">{stats.pendingProposals} pending</div>
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium">Send Announcement</div>
                    <div className="text-xs text-muted-foreground">Broadcast message</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}