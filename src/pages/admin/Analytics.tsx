import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/services/api";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  MessageSquare,
  FileText,
  Award,
  Loader2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface StudentAnalytics {
  id: string;
  name: string;
  matricNumber: string;
  supervisor: string;
  progress: number;
  riskLevel: "low" | "medium" | "high";
  lastActivity: Date;
  proposalStatus: "pending" | "approved" | "rejected";
  chaptersSubmitted: number;
  chaptersApproved: number;
  messagesExchanged: number;
  averageResponseTime: number;
  engagementScore: number;
}

interface DepartmentStats {
  department: string;
  totalStudents: number;
  completionRate: number;
  averageProgress: number;
  riskStudents: number;
}

interface SupervisorPerformance {
  id: string;
  name: string;
  studentsCount: number;
  averageProgress: number;
  responseTime: number;
  satisfactionScore: number;
  completionRate: number;
}

const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"
];

export default function Analytics() {
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [supervisorPerformance, setSupervisorPerformance] = useState<SupervisorPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  // Chart data states
  const [progressDistributionData, setProgressDistributionData] = useState<any[]>([]);
  const [engagementTrendData, setEngagementTrendData] = useState<any[]>([]);
  const [riskFactorsData, setRiskFactorsData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange, selectedDepartment]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch student analytics
      const { data: studentsData } = await api.get('/analytics/student-analytics');
      setStudentAnalytics(studentsData);
      
      // Fetch department statistics
      const { data: departmentsData } = await api.get('/analytics/department-stats');
      setDepartmentStats(departmentsData);
      
      // Fetch supervisor performance
      const { data: supervisorsData } = await api.get('/analytics/supervisor-performance');
      setSupervisorPerformance(supervisorsData);
      
      // Fetch chart data
      await fetchChartData();
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Fallback to mock data if API fails
      generateMockStudentAnalytics();
      generateMockDepartmentStats();
      generateMockSupervisorPerformance();
      generateMockChartData();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      // Fetch progress distribution
      const { data: progressDist } = await api.get('/analytics/chart-data/progress-distribution');
      setProgressDistributionData(progressDist);
      
      // Fetch engagement trends
      const { data: engagementTrends } = await api.get('/analytics/chart-data/engagement-trends');
      setEngagementTrendData(engagementTrends);
      
      // Generate risk factors data (this could be enhanced with real API data)
      setRiskFactorsData([
        { factor: "Low Activity", value: 8, fullMark: 10 },
        { factor: "Delayed Submissions", value: 6, fullMark: 10 },
        { factor: "Poor Communication", value: 4, fullMark: 10 },
        { factor: "Missing Deadlines", value: 7, fullMark: 10 },
        { factor: "Low Engagement", value: 5, fullMark: 10 }
      ]);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      generateMockChartData();
    }
  };

  const generateMockChartData = () => {
    setProgressDistributionData([
      { range: '0-25%', count: 5, color: CHART_COLORS[3] },
      { range: '26-50%', count: 12, color: CHART_COLORS[1] },
      { range: '51-75%', count: 18, color: CHART_COLORS[0] },
      { range: '76-100%', count: 15, color: CHART_COLORS[2] }
    ]);

    setEngagementTrendData([
      { week: "Week 1", engagement: 65, submissions: 8, messages: 120 },
      { week: "Week 2", engagement: 72, submissions: 12, messages: 145 },
      { week: "Week 3", engagement: 68, submissions: 6, messages: 98 },
      { week: "Week 4", engagement: 78, submissions: 15, messages: 167 },
      { week: "Week 5", engagement: 75, submissions: 11, messages: 134 },
      { week: "Week 6", engagement: 82, submissions: 18, messages: 189 }
    ]);

    setRiskFactorsData([
      { factor: "Low Activity", value: 8, fullMark: 10 },
      { factor: "Delayed Submissions", value: 6, fullMark: 10 },
      { factor: "Poor Communication", value: 4, fullMark: 10 },
      { factor: "Missing Deadlines", value: 7, fullMark: 10 },
      { factor: "Low Engagement", value: 5, fullMark: 10 }
    ]);
  };

  const generateMockStudentAnalytics = () => {
    const mockData: StudentAnalytics[] = [
      {
        id: "1",
        name: "John Doe",
        matricNumber: "CSC/2021/001",
        supervisor: "Dr. Smith",
        progress: 85,
        riskLevel: "low",
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
        proposalStatus: "approved",
        chaptersSubmitted: 4,
        chaptersApproved: 3,
        messagesExchanged: 45,
        averageResponseTime: 6,
        engagementScore: 92
      },
      {
        id: "2",
        name: "Jane Wilson",
        matricNumber: "CSC/2021/002",
        supervisor: "Dr. Johnson",
        progress: 45,
        riskLevel: "high",
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        proposalStatus: "approved",
        chaptersSubmitted: 2,
        chaptersApproved: 1,
        messagesExchanged: 12,
        averageResponseTime: 24,
        engagementScore: 34
      },
      {
        id: "3",
        name: "Michael Brown",
        matricNumber: "CSC/2021/003",
        supervisor: "Dr. Davis",
        progress: 72,
        riskLevel: "medium",
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 12),
        proposalStatus: "approved",
        chaptersSubmitted: 3,
        chaptersApproved: 2,
        messagesExchanged: 28,
        averageResponseTime: 12,
        engagementScore: 68
      }
    ];
    setStudentAnalytics(mockData);
  };

  const generateMockDepartmentStats = () => {
    const mockData: DepartmentStats[] = [
      {
        department: "Computer Science",
        totalStudents: 45,
        completionRate: 78,
        averageProgress: 68,
        riskStudents: 8
      },
      {
        department: "Information Technology",
        totalStudents: 32,
        completionRate: 85,
        averageProgress: 72,
        riskStudents: 4
      },
      {
        department: "Software Engineering",
        totalStudents: 28,
        completionRate: 82,
        averageProgress: 75,
        riskStudents: 3
      }
    ];
    setDepartmentStats(mockData);
  };

  const generateMockSupervisorPerformance = () => {
    const mockData: SupervisorPerformance[] = [
      {
        id: "1",
        name: "Dr. Smith",
        studentsCount: 8,
        averageProgress: 78,
        responseTime: 8,
        satisfactionScore: 4.6,
        completionRate: 85
      },
      {
        id: "2",
        name: "Dr. Johnson",
        studentsCount: 6,
        averageProgress: 65,
        responseTime: 15,
        satisfactionScore: 4.2,
        completionRate: 72
      },
      {
        id: "3",
        name: "Dr. Davis",
        studentsCount: 7,
        averageProgress: 82,
        responseTime: 6,
        satisfactionScore: 4.8,
        completionRate: 92
      }
    ];
    setSupervisorPerformance(mockData);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "low": return "text-green-600 bg-green-100 dark:bg-green-900/20";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Detailed insights into student performance and engagement
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="it">Information Technology</SelectItem>
                <SelectItem value="se">Software Engineering</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Average Progress"
            value="68%"
            icon={<Target className="h-5 w-5 text-blue-600" />}
            description="Across all active projects"
            trend={{
              value: 5.2,
              label: "vs last month",
              type: "increase"
            }}
          />
          <StatCard
            title="At-Risk Students"
            value="12"
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            description="Requiring immediate attention"
            trend={{
              value: -15.3,
              label: "vs last month",
              type: "decrease"
            }}
            variant="warning"
          />
          <StatCard
            title="Engagement Score"
            value="74%"
            icon={<Users className="h-5 w-5 text-green-600" />}
            description="Average student engagement"
            trend={{
              value: 8.7,
              label: "vs last month",
              type: "increase"
            }}
          />
          <StatCard
            title="Completion Rate"
            value="82%"
            icon={<CheckCircle className="h-5 w-5 text-purple-600" />}
            description="Projects completed on time"
            trend={{
              value: 3.1,
              label: "vs target",
              type: "increase"
            }}
            variant="success"
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Student Details</TabsTrigger>
            <TabsTrigger value="supervisors">Supervisor Performance</TabsTrigger>
            <TabsTrigger value="departments">Department Analysis</TabsTrigger>
            <TabsTrigger value="predictions">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Progress Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Progress Distribution
                  </CardTitle>
                  <CardDescription>Student progress across different ranges</CardDescription>
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
                            data={progressDistributionData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            label={({ range, count }) => `${range}: ${count}`}
                          >
                            {progressDistributionData.map((entry, index) => (
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

              {/* Engagement Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Engagement Trends
                  </CardTitle>
                  <CardDescription>Weekly engagement and activity metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={engagementTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="engagement" 
                            stroke={CHART_COLORS[0]} 
                            strokeWidth={2}
                            name="Engagement %"
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
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Performance Analysis
                </CardTitle>
                <CardDescription>Detailed breakdown of individual student metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Chapters</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentAnalytics.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.matricNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ProgressRing progress={student.progress} size={40}>
                              <span className="text-xs font-medium">{student.progress}%</span>
                            </ProgressRing>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskColor(student.riskLevel)}>
                            {student.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{student.engagementScore}%</div>
                            <div className="text-muted-foreground">{student.messagesExchanged} messages</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{student.chaptersApproved}/{student.chaptersSubmitted}</div>
                            <div className="text-muted-foreground">approved</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {student.lastActivity.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supervisors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Supervisor Performance Metrics
                </CardTitle>
                <CardDescription>Analysis of supervisor effectiveness and workload</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Avg Progress</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Satisfaction</TableHead>
                      <TableHead>Completion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supervisorPerformance.map((supervisor) => (
                      <TableRow key={supervisor.id}>
                        <TableCell className="font-medium">{supervisor.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{supervisor.studentsCount} students</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${supervisor.averageProgress}%` }}
                              />
                            </div>
                            <span className="text-sm">{supervisor.averageProgress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{supervisor.responseTime}h</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{supervisor.satisfactionScore}</span>
                            <span className="text-xs text-muted-foreground">/5.0</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={supervisor.completionRate > 80 ? "default" : "destructive"}
                          >
                            {supervisor.completionRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Department Comparison</CardTitle>
                  <CardDescription>Performance metrics across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completionRate" fill={CHART_COLORS[0]} name="Completion Rate %" />
                        <Bar dataKey="averageProgress" fill={CHART_COLORS[1]} name="Average Progress %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Statistics</CardTitle>
                  <CardDescription>Key metrics by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentStats.map((dept, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{dept.department}</h4>
                          <Badge variant="outline">{dept.totalStudents} students</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Completion</div>
                            <div className="font-medium">{dept.completionRate}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Progress</div>
                            <div className="font-medium">{dept.averageProgress}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">At Risk</div>
                            <div className="font-medium text-red-600">{dept.riskStudents}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Factor Analysis
                  </CardTitle>
                  <CardDescription>Common factors contributing to project delays</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={riskFactorsData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="factor" />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} />
                        <Radar
                          name="Risk Level"
                          dataKey="value"
                          stroke={CHART_COLORS[3]}
                          fill={CHART_COLORS[3]}
                          fillOpacity={0.3}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predictive Insights</CardTitle>
                  <CardDescription>AI-powered recommendations and predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800 dark:text-red-400">High Risk Alert</span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        3 students are predicted to miss their defense deadline based on current progress
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-400">Capacity Warning</span>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Dr. Johnson is approaching maximum capacity with 9 students
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-400">Positive Trend</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Overall engagement has increased by 15% this month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}