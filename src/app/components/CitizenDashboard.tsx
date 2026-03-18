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
import { type IssueCategory, type Report } from "../data/mockData";
import { toast } from "sonner";
import { ReportMap } from "./ReportMap";
import { useAuth } from "../contexts/AuthContext";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export function CitizenDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as IssueCategory | "",
    location: "",
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user reports on mount
  useEffect(() => {
    fetchUserReports();
  }, [user]);

  const fetchUserReports = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-27d4a71c/reports/user/${user.email}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setUserReports(data.reports);
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
    
    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Submit report to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-27d4a71c/reports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: {
              lat: 40.7128, // Default location, will be updated with map selection
              lng: -74.0060,
              address: formData.location,
            },
            imageUrl: selectedImage,
            reportedBy: user?.email || "anonymous",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Report submitted successfully!", {
          description: `Priority: ${data.report.priority} | Severity: ${data.report.severity}/10`,
        });

        // Reset form
        setFormData({ title: "", description: "", category: "", location: "" });
        setSelectedImage(null);
        
        // Refresh user reports
        await fetchUserReports();
      } else {
        toast.error("Failed to submit report", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
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
                        placeholder="Enter address or click on map"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
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

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Submitting..." : "Submit Report"}
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
                    onLocationSelect={(lat, lng, address) => {
                      setFormData({ ...formData, location: address });
                      toast.success("Location selected", { description: address });
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Reports Tab */}
          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle>My Reported Issues</CardTitle>
                <CardDescription>
                  Track the status of your submitted reports
                </CardDescription>
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