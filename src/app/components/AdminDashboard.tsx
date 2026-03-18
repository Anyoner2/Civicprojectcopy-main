import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  ArrowLeft,
  MapPin,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Search
} from "lucide-react";
import { type Report } from "../data/mockData";
import { toast } from "sonner";
import { ReportMap } from "./ReportMap";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { MLTraining } from "./MLTraining";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>({
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    rejectedReports: 0,
    averageResolutionTime: "0 days",
    highPriorityCount: 0,
    mediumPriorityCount: 0,
    lowPriorityCount: 0
  });
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);

  // Fetch reports and analytics on mount
  useEffect(() => {
    fetchReports();
    fetchAnalytics();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-27d4a71c/reports`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      } else {
        console.error("Error fetching reports:", data.error);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      // Fallback to mock data for local development
      import("../data/mockData").then(({ mockReports }) => {
        setReports(mockReports);
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-27d4a71c/analytics`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.analytics);
        setCategoryDistribution(data.categoryDistribution);
        setMonthlyTrends(data.monthlyTrends);
      } else {
        console.error("Error fetching analytics:", data.error);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Fallback to mock data for local development
      import("../data/mockData").then(({ analyticsData, categoryDistribution, monthlyTrends }) => {
        setAnalyticsData(analyticsData);
        setCategoryDistribution(categoryDistribution);
        setMonthlyTrends(monthlyTrends);
      });
    }
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesCategory = filterCategory === "all" || report.category === filterCategory;
    const matchesPriority = filterPriority === "all" || report.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesPriority && matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-27d4a71c/reports/${reportId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`Report status updated to: ${newStatus}`);
        // Refresh reports and analytics
        await fetchReports();
        await fetchAnalytics();
      } else {
        toast.error("Failed to update status", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "Pending":
        return "bg-yellow-500";
      case "Rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "border-red-500 text-red-500";
      case "Medium":
        return "border-yellow-500 text-yellow-500";
      case "Low":
        return "border-green-500 text-green-500";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex items-center gap-2">
              <MapPin className="size-6 text-blue-600" />
              <span className="text-lg font-semibold">Administrator Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">City Authority Admin</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="training">ML Training</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="map">Heat Map</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Reports</CardDescription>
                  <CardTitle className="text-3xl">{analyticsData.totalReports}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="size-4 text-green-500" />
                    <span>+12% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Pending</CardDescription>
                  <CardTitle className="text-3xl text-yellow-600">{analyticsData.pendingReports}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="size-4 text-yellow-500" />
                    <span>Awaiting action</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>In Progress</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{analyticsData.inProgressReports}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="size-4 text-blue-500" />
                    <span>Being addressed</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Resolved</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{analyticsData.resolvedReports}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="size-4 text-green-500" />
                    <span>Avg: {analyticsData.averageResolutionTime}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Priority Distribution */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                  <CardDescription>Current issue priority breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-600">High Priority</span>
                        <span className="text-sm">{analyticsData.highPriorityCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(analyticsData.highPriorityCount / analyticsData.totalReports) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-600">Medium Priority</span>
                        <span className="text-sm">{analyticsData.mediumPriorityCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(analyticsData.mediumPriorityCount / analyticsData.totalReports) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-600">Low Priority</span>
                        <span className="text-sm">{analyticsData.lowPriorityCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(analyticsData.lowPriorityCount / analyticsData.totalReports) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent High Priority Issues</CardTitle>
                  <CardDescription>Issues requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports
                      .filter((r) => r.priority === "High")
                      .slice(0, 4)
                      .map((report) => (
                        <div key={report.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <AlertCircle className="size-5 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{report.title}</p>
                            <p className="text-xs text-gray-500">{report.location.address}</p>
                          </div>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                      ))}
                    {reports.filter((r) => r.priority === "High").length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No high priority issues</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Reports</CardTitle>
                <CardDescription>Search and filter infrastructure reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 size-4 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Pothole">Pothole</SelectItem>
                      <SelectItem value="Street Light">Street Light</SelectItem>
                      <SelectItem value="Water Leak">Water Leak</SelectItem>
                      <SelectItem value="Drainage">Drainage</SelectItem>
                      <SelectItem value="Sidewalk">Sidewalk</SelectItem>
                      <SelectItem value="Traffic Signal">Traffic Signal</SelectItem>
                      <SelectItem value="Waste Management">Waste Management</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Reports ({filteredReports.length})</CardTitle>
                <CardDescription>Manage and update report statuses</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No reports found</p>
                    <p className="text-sm text-gray-500">Reports submitted by citizens will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Reported</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{report.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getPriorityColor(report.priority)}>
                                {report.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                              {report.location.address}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(report.dateReported).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                defaultValue={report.status}
                                onValueChange={(value) => handleStatusUpdate(report.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Resolved">Resolved</SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ML Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <MLTraining />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Category Distribution</CardTitle>
                  <CardDescription>Breakdown by issue type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {categoryDistribution.map((entry) => (
                          <Cell key={entry.id} fill={COLORS[categoryDistribution.indexOf(entry) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Reports by Category</CardTitle>
                  <CardDescription>Total count per category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" isAnimationActive={false}>
                        {categoryDistribution.map((entry) => (
                          <Cell key={entry.id} fill="#3b82f6" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Report Trends</CardTitle>
                  <CardDescription>6-month reporting trend analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="reports" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        name="Reports" 
                        isAnimationActive={false}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Heat Map Tab */}
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Issue Heat Map</CardTitle>
                <CardDescription>
                  Geographical visualization of reported infrastructure issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportMap reports={reports} height="600px" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}