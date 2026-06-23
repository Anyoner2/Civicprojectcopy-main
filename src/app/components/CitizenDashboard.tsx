import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ArrowLeft, MapPin, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { type IssueCategory } from "../data/mockData";
import { type Report } from "../../services/api";
import { toast } from "sonner";
import { ReportMap } from "./ReportMap";
import { AREAS } from "../data/areas";
import { useAuth } from "../contexts/AuthContext";
import { useReports } from "../../hooks/useReports";

export function CitizenDashboard() {
  const navigate = useNavigate();
  const { user, logout, accessToken } = useAuth();
  const { submitReport, isLoading: isSubmitting, error: submitError } = useReports();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as IssueCategory | "",
    location: "",
    latitude: -1.2921,
    longitude: 36.8219,
  });
  const [selectedConstituency, setSelectedConstituency] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [wardOptions, setWardOptions] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userReports, setUserReports] = useState<Report[]>([]);

  // Fetch user reports on mount
  useEffect(() => {
    if (user && accessToken) {
      fetchUserReports();
    }
  }, [user, accessToken]);

  const fetchUserReports = async () => {
    if (!user || !accessToken) return;
    
    try {
      // For now, we'll fetch all reports and filter by user
      // In production, this would use the user-specific endpoint
      const response = await fetch(
        `${(import.meta as any).env.VITE_API_URL || 'http://localhost:3000'}${(import.meta as any).env.VITE_API_PREFIX || '/api'}/reports`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        // Filter to only show current user's reports
        setUserReports(data.data?.filter((r: any) => r.reportedBy === user.email) || []);
      } else {
        console.error("Error fetching user reports:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user reports:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Detailed validation
    const missingFields: string[] = [];
    if (!formData.title?.trim()) missingFields.push("Title");
    if (!formData.description?.trim()) missingFields.push("Description");
    if (!formData.category?.trim()) missingFields.push("Category");
    if (!formData.location?.trim()) missingFields.push("Location");

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      console.log("Form data:", formData);
      return;
    }

    try {
      const report = await submitReport({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      if (report) {
        toast.success("Report submitted successfully!", {
          description: `Priority: ${report.priority} | Severity: ${report.severity}/10`,
        });

        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "" as IssueCategory | "",
          location: "",
          latitude: -1.2921,
          longitude: 36.8219,
        });
        setSelectedImage(null);
        
        // Refresh user reports
        await fetchUserReports();
      } else {
        // If submitReport returns null, show the error from the hook
        const errorMsg = submitError || "Failed to submit report. Please try again.";
        toast.error(errorMsg);
      }
    } catch (error: any) {
      toast.error("Failed to submit report", {
        description: error.message || "Please try again later",
      });
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
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="size-4" />;
      case "In Progress":
        return <Clock className="size-4" />;
      case "Pending":
        return <AlertCircle className="size-4" />;
      default:
        return null;
    }
  };

  const generateReportsCsv = (reportList: Report[]) => {
    const fields = ["id", "title", "description", "category", "priority", "status", "location", "dateReported", "dateUpdated", "reportedBy"];
    const rows = [fields.join(",")];

    reportList.forEach((report) => {
      const location = report.location?.address || "";
      const row = [
        report.id,
        report.title,
        report.description,
        report.category,
        report.priority,
        report.status,
        location,
        report.dateReported,
        report.dateUpdated,
        report.reportedBy || "",
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`);

      rows.push(row.join(","));
    });

    return rows.join("\n");
  };

  const downloadReportsCsv = (reportList: Report[]) => {
    const csvContent = generateReportsCsv(reportList);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <span className="text-lg font-semibold">Citizen Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="submit">Submit Report</TabsTrigger>
            <TabsTrigger value="tracking">My Reports</TabsTrigger>
          </TabsList>

          {/* Submit Report Tab */}
          <TabsContent value="submit">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Infrastructure Issue</CardTitle>
                  <CardDescription>
                    Provide detailed information about the issue. Our ML system will automatically classify and prioritize it.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Issue Title *</Label>
                      <Input
                        id="title"
                        placeholder="Brief description of the issue"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value as IssueCategory })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pothole">Pothole</SelectItem>
                          <SelectItem value="Street Light">Street Light</SelectItem>
                          <SelectItem value="Water Leak">Water Leak</SelectItem>
                          <SelectItem value="Drainage">Drainage</SelectItem>
                          <SelectItem value="Sidewalk">Sidewalk</SelectItem>
                          <SelectItem value="Traffic Signal">Traffic Signal</SelectItem>
                          <SelectItem value="Waste Management">Waste Management</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed information about the issue"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="Enter address or select constituency & ward"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="constituency">Constituency</Label>
                      <Select value={selectedConstituency} onValueChange={(value) => {
                        setSelectedConstituency(value);
                        // populate wards
                        const found = AREAS.find(a => a.name === value);
                        setWardOptions(found?.wards || []);
                        // reset ward selection
                        setSelectedWard("");
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select constituency" />
                        </SelectTrigger>
                        <SelectContent>
                          {AREAS.map((c) => (
                            <SelectItem value={c.name} key={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ward">Ward</Label>
                      <Select value={selectedWard} onValueChange={(value) => {
                        setSelectedWard(value);
                        const ward = wardOptions.find(w => w.name === value);
                        if (ward) {
                          const label = `${selectedConstituency} - ${ward.name}`;
                          setFormData({ ...formData, location: label, latitude: ward.lat, longitude: ward.lng });
                          toast.success("Location selected", { description: label });
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {wardOptions.length === 0 ? (
                            <SelectItem value="no-wards" disabled>No wards available</SelectItem>
                          ) : wardOptions.map((w) => (
                            <SelectItem value={w.name} key={w.name}>{w.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Upload Image (Optional)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="cursor-pointer"
                        />
                        <Upload className="size-5 text-gray-400" />
                      </div>
                      {selectedImage && (
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="mt-2 rounded-lg max-h-48 object-cover"
                        />
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Map Component */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Location</CardTitle>
                  <CardDescription>
                    Click on the map to set the issue location or use GPS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportMap
                    reports={[]}
                    height="500px"
                    center={{ lat: formData.latitude, lng: formData.longitude, label: formData.location }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Reports Tab */}
          <TabsContent value="tracking">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle>My Reported Issues</CardTitle>
                  <CardDescription>
                    Track the status of your submitted reports
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => downloadReportsCsv(userReports)} disabled={userReports.length === 0}>
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                {userReports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No reports submitted yet</p>
                    <p className="text-sm text-gray-500">Submit your first report to help improve our city infrastructure</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReports.map((report) => (
                      <Card key={report.id}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            {report.imageUrl && (
                              <img
                                src={report.imageUrl}
                                alt={report.title}
                                className="size-24 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold">{report.title}</h3>
                                  <p className="text-sm text-gray-600">{report.description}</p>
                                </div>
                                <Badge className={getStatusColor(report.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(report.status)}
                                    {report.status}
                                  </span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="size-4" />
                                  {report.location.address}
                                </span>
                                <Badge variant="outline">{report.category}</Badge>
                                <Badge variant="outline" className={
                                  report.priority === "High" ? "border-red-500 text-red-500" :
                                  report.priority === "Medium" ? "border-yellow-500 text-yellow-500" :
                                  "border-green-500 text-green-500"
                                }>
                                  {report.priority} Priority
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                Reported: {new Date(report.dateReported).toLocaleDateString()}
                                {" • "}
                                Updated: {new Date(report.dateUpdated).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}