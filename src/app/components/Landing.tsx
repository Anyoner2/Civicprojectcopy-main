import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MapPin, AlertCircle, TrendingUp, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.type === "admin" ? "/admin" : "/citizen";
      // Don't auto-redirect - let them stay on landing if they want
      // This gives them a chance to logout or navigate manually
    }
  }, [isAuthenticated, user]);

  const handleViewDashboard = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(user?.type === "admin" ? "/admin" : "/citizen");
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-8 text-blue-600" />
            <span className="text-xl font-semibold">Nairobi Civic Report</span>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 flex items-center">
                  Welcome, {user?.name}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
                <Button onClick={handleViewDashboard}>
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/signup")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Machine Learning Crowdsourcing Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Automated Reporting and Prioritization of Urban Infrastructure Issues
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={handleViewDashboard}>
              View Dashboard
            </Button>
          </div>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mt-4">
              * Please log in to submit reports and access dashboards
            </p>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Card>
            <CardHeader>
              <AlertCircle className="size-10 text-blue-600 mb-2" />
              <CardTitle>Smart Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                ML-powered automatic categorization of infrastructure issues using text and image analysis
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="size-10 text-green-600 mb-2" />
              <CardTitle>Priority Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Intelligent prioritization based on severity, frequency, location, and risk factors
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="size-10 text-red-600 mb-2" />
              <CardTitle>Location Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                GPS-based reporting with heat maps for identifying problem areas and patterns
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="size-10 text-purple-600 mb-2" />
              <CardTitle>Crowdsourced Data</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Community-driven reporting with real-time status updates and notifications
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* System Architecture Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Three-Tier Architecture</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Presentation Layer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Citizen submission interface</li>
                  <li>• Administrator dashboard</li>
                  <li>• Analytics and visualizations</li>
                  <li>• Mobile-responsive design</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Layer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• User authentication</li>
                  <li>• Report validation</li>
                  <li>• ML classification</li>
                  <li>• Priority computation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Layer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• User database</li>
                  <li>• Report repository</li>
                  <li>• ML model storage</li>
                  <li>• Analytics records</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 Nairobi Civic Report Platform. Powered by Machine Learning for Smart Cities.
          </p>
        </div>
      </footer>
    </div>
  );
}