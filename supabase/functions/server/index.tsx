import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-27d4a71c/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/make-server-27d4a71c/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    // Validate role
    if (role !== "citizen" && role !== "admin") {
      return c.json({ success: false, error: "Invalid role. Must be 'citizen' or 'admin'." }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.error("Signup error:", error);
      return c.json({ success: false, error: error.message }, 400);
    }
    
    console.log(`User created: ${email} as ${role}`);
    return c.json({ 
      success: true, 
      user: {
        email: data.user?.email,
        name,
        role
      }
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Login endpoint
app.post("/make-server-27d4a71c/login", async (c) => {
  try {
    const { email, password, role } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error);
      return c.json({ success: false, error: "Invalid email or password" }, 401);
    }
    
    // Get user metadata to check role
    const userRole = data.user?.user_metadata?.role;
    const userName = data.user?.user_metadata?.name;
    
    // Verify the user is logging in with the correct role
    if (userRole !== role) {
      console.error(`Role mismatch: User ${email} has role ${userRole} but tried to login as ${role}`);
      return c.json({ 
        success: false, 
        error: `This account is registered as a ${userRole}. Please select the correct account type.` 
      }, 403);
    }
    
    console.log(`User logged in: ${email} as ${role}`);
    return c.json({ 
      success: true, 
      user: {
        email: data.user?.email,
        name: userName,
        role: userRole
      },
      accessToken: data.session?.access_token
    });
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Verify session endpoint
app.get("/make-server-27d4a71c/verify-session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "No access token provided" }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    const { data, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !data.user) {
      return c.json({ success: false, error: "Invalid or expired session" }, 401);
    }
    
    return c.json({ 
      success: true, 
      user: {
        email: data.user.email,
        name: data.user.user_metadata?.name,
        role: data.user.user_metadata?.role
      }
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit a new report
app.post("/make-server-27d4a71c/reports", async (c) => {
  try {
    const body = await c.req.json();
    
    // Generate unique ID
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // ML Classification - Simulate ML algorithm for priority and severity
    const mlResults = await classifyReportWithTraining(body);
    
    const report = {
      id: reportId,
      ...body,
      priority: mlResults.priority,
      severity: mlResults.severity,
      frequency: mlResults.frequency,
      riskFactor: mlResults.riskFactor,
      status: "Pending",
      dateReported: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };
    
    // Store report in KV store
    await kv.set(reportId, report);
    
    console.log(`Report created: ${reportId}`);
    return c.json({ success: true, report });
  } catch (error) {
    console.error("Error creating report:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all reports
app.get("/make-server-27d4a71c/reports", async (c) => {
  try {
    const reports = await kv.getByPrefix("report-");
    console.log(`Fetched ${reports.length} reports`);
    return c.json({ success: true, reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get reports by user
app.get("/make-server-27d4a71c/reports/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const allReports = await kv.getByPrefix("report-");
    const userReports = allReports.filter((report: any) => report.reportedBy === userId);
    console.log(`Fetched ${userReports.length} reports for user ${userId}`);
    return c.json({ success: true, reports: userReports });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update report status
app.put("/make-server-27d4a71c/reports/:id", async (c) => {
  try {
    const reportId = c.req.param("id");
    const { status } = await c.req.json();
    
    const report = await kv.get(reportId);
    if (!report) {
      return c.json({ success: false, error: "Report not found" }, 404);
    }
    
    const updatedReport = {
      ...report,
      status,
      dateUpdated: new Date().toISOString(),
    };
    
    await kv.set(reportId, updatedReport);
    console.log(`Report ${reportId} status updated to ${status}`);
    return c.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error("Error updating report:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get analytics
app.get("/make-server-27d4a71c/analytics", async (c) => {
  try {
    const reports = await kv.getByPrefix("report-");
    
    const analytics = {
      totalReports: reports.length,
      pendingReports: reports.filter((r: any) => r.status === "Pending").length,
      inProgressReports: reports.filter((r: any) => r.status === "In Progress").length,
      resolvedReports: reports.filter((r: any) => r.status === "Resolved").length,
      rejectedReports: reports.filter((r: any) => r.status === "Rejected").length,
      highPriorityCount: reports.filter((r: any) => r.priority === "High").length,
      mediumPriorityCount: reports.filter((r: any) => r.priority === "Medium").length,
      lowPriorityCount: reports.filter((r: any) => r.priority === "Low").length,
      averageResolutionTime: calculateAverageResolutionTime(reports),
    };
    
    // Category distribution
    const categoryDistribution = calculateCategoryDistribution(reports);
    
    // Monthly trends
    const monthlyTrends = calculateMonthlyTrends(reports);
    
    return c.json({ 
      success: true, 
      analytics,
      categoryDistribution,
      monthlyTrends
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit training data - Admin corrects ML classification
app.post("/make-server-27d4a71c/training", async (c) => {
  try {
    const { reportId, correctedPriority, correctedSeverity, correctedRiskFactor } = await c.req.json();
    
    // Get the original report
    const report = await kv.get(reportId);
    if (!report) {
      return c.json({ success: false, error: "Report not found" }, 404);
    }
    
    // Create training data entry
    const trainingId = `training-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trainingData = {
      id: trainingId,
      reportId,
      title: report.title,
      description: report.description,
      category: report.category,
      originalPriority: report.priority,
      originalSeverity: report.severity,
      originalRiskFactor: report.riskFactor,
      correctedPriority,
      correctedSeverity,
      correctedRiskFactor,
      trainedAt: new Date().toISOString(),
    };
    
    // Save training data
    await kv.set(trainingId, trainingData);
    
    // Update the report with corrected values
    const updatedReport = {
      ...report,
      priority: correctedPriority,
      severity: correctedSeverity,
      riskFactor: correctedRiskFactor,
      isTrained: true,
      dateUpdated: new Date().toISOString(),
    };
    await kv.set(reportId, updatedReport);
    
    console.log(`Training data created: ${trainingId}`);
    return c.json({ success: true, trainingData, updatedReport });
  } catch (error) {
    console.error("Error creating training data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all training data
app.get("/make-server-27d4a71c/training", async (c) => {
  try {
    const trainingData = await kv.getByPrefix("training-");
    console.log(`Fetched ${trainingData.length} training samples`);
    return c.json({ success: true, trainingData, count: trainingData.length });
  } catch (error) {
    console.error("Error fetching training data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get ML model statistics
app.get("/make-server-27d4a71c/ml-stats", async (c) => {
  try {
    const reports = await kv.getByPrefix("report-");
    const trainingData = await kv.getByPrefix("training-");
    
    const trainedReports = reports.filter((r: any) => r.isTrained);
    const untrainedReports = reports.filter((r: any) => !r.isTrained);
    
    // Calculate accuracy based on training corrections
    let accuracySum = 0;
    trainingData.forEach((td: any) => {
      const priorityMatch = td.originalPriority === td.correctedPriority ? 1 : 0;
      accuracySum += priorityMatch;
    });
    
    const accuracy = trainingData.length > 0 
      ? ((accuracySum / trainingData.length) * 100).toFixed(1) 
      : "0";
    
    const stats = {
      totalReports: reports.length,
      trainedReports: trainedReports.length,
      untrainedReports: untrainedReports.length,
      trainingDataSamples: trainingData.length,
      modelAccuracy: `${accuracy}%`,
      lastTrainedAt: trainingData.length > 0 
        ? trainingData[trainingData.length - 1].trainedAt 
        : null,
    };
    
    return c.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching ML stats:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Retrain model - Use training data to improve classification
app.post("/make-server-27d4a71c/retrain", async (c) => {
  try {
    const trainingData = await kv.getByPrefix("training-");
    
    if (trainingData.length === 0) {
      return c.json({ 
        success: false, 
        error: "No training data available. Please train some reports first." 
      }, 400);
    }
    
    // Store model metadata
    const modelId = `model-${Date.now()}`;
    const modelData = {
      id: modelId,
      version: Date.now(),
      trainingSamples: trainingData.length,
      trainedAt: new Date().toISOString(),
      trainingData: trainingData.map((td: any) => ({
        category: td.category,
        descriptionLength: td.description.length,
        keywords: extractKeywords(td.description),
        correctedPriority: td.correctedPriority,
        correctedSeverity: td.correctedSeverity,
        correctedRiskFactor: td.correctedRiskFactor,
      })),
    };
    
    await kv.set("ml-model-current", modelData);
    
    console.log(`Model retrained with ${trainingData.length} samples`);
    return c.json({ 
      success: true, 
      message: `Model successfully retrained with ${trainingData.length} samples`,
      model: modelData 
    });
  } catch (error) {
    console.error("Error retraining model:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Enhanced ML Classification Algorithm with Training Data
async function classifyReportWithTraining(report: any) {
  try {
    // Try to get trained model
    const model = await kv.get("ml-model-current");
    
    if (model && model.trainingData && model.trainingData.length > 0) {
      // Use trained model for classification
      return classifyWithTrainedModel(report, model);
    } else {
      // Fall back to rule-based classification
      return classifyReport(report);
    }
  } catch (error) {
    console.error("Error in trained classification:", error);
    return classifyReport(report);
  }
}

function classifyWithTrainedModel(report: any, model: any) {
  const description = report.description.toLowerCase();
  const category = report.category;
  const keywords = extractKeywords(description);
  
  // Find similar training samples
  const similarSamples = model.trainingData.filter((sample: any) => {
    return sample.category === category;
  });
  
  if (similarSamples.length === 0) {
    // No similar samples, use rule-based
    return classifyReport(report);
  }
  
  // Calculate weighted average from similar samples
  let totalPriorityScore = 0;
  let totalSeverity = 0;
  let totalRiskFactor = 0;
  let weights = 0;
  
  similarSamples.forEach((sample: any) => {
    // Calculate similarity based on keyword overlap
    const keywordOverlap = keywords.filter((k: string) => 
      sample.keywords.includes(k)
    ).length;
    
    const weight = keywordOverlap + 1; // At least weight of 1
    
    const priorityScore = 
      sample.correctedPriority === "High" ? 3 : 
      sample.correctedPriority === "Medium" ? 2 : 1;
    
    totalPriorityScore += priorityScore * weight;
    totalSeverity += sample.correctedSeverity * weight;
    totalRiskFactor += sample.correctedRiskFactor * weight;
    weights += weight;
  });
  
  const avgPriorityScore = totalPriorityScore / weights;
  const avgSeverity = Math.round(totalSeverity / weights);
  const avgRiskFactor = Math.round(totalRiskFactor / weights);
  
  const priority = 
    avgPriorityScore >= 2.5 ? "High" : 
    avgPriorityScore >= 1.5 ? "Medium" : "Low";
  
  return {
    priority,
    severity: avgSeverity,
    riskFactor: avgRiskFactor,
    frequency: 1,
  };
}

function extractKeywords(text: string): string[] {
  const stopWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "is", "are", "was", "were"];
  const words = text.toLowerCase().split(/\s+/);
  return words
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 10); // Top 10 keywords
}

// ML Classification Algorithm
function classifyReport(report: any) {
  // Simple ML simulation based on category and description keywords
  let severity = 5; // default medium severity
  let riskFactor = 5;
  let frequency = 1;
  let priority: "High" | "Medium" | "Low" = "Medium";
  
  const description = report.description.toLowerCase();
  const category = report.category;
  
  // Severity scoring based on keywords
  const highSeverityKeywords = ["dangerous", "urgent", "emergency", "flooding", "damage", "broken", "large", "deep"];
  const mediumSeverityKeywords = ["concern", "problem", "issue", "need", "repair"];
  
  if (highSeverityKeywords.some(keyword => description.includes(keyword))) {
    severity = Math.min(10, severity + 3);
    riskFactor = Math.min(10, riskFactor + 2);
  } else if (mediumSeverityKeywords.some(keyword => description.includes(keyword))) {
    severity = Math.min(10, severity + 1);
  }
  
  // Category-based scoring
  const highRiskCategories = ["Pothole", "Water Leak", "Traffic Signal"];
  const mediumRiskCategories = ["Street Light", "Drainage", "Sidewalk"];
  
  if (highRiskCategories.includes(category)) {
    riskFactor = Math.min(10, riskFactor + 2);
    severity = Math.min(10, severity + 1);
  } else if (mediumRiskCategories.includes(category)) {
    riskFactor = Math.min(10, riskFactor + 1);
  }
  
  // Calculate priority based on severity and risk
  const priorityScore = (severity + riskFactor) / 2;
  if (priorityScore >= 7) {
    priority = "High";
  } else if (priorityScore >= 4) {
    priority = "Medium";
  } else {
    priority = "Low";
  }
  
  return { priority, severity, frequency, riskFactor };
}

function calculateAverageResolutionTime(reports: any[]) {
  const resolvedReports = reports.filter((r: any) => r.status === "Resolved");
  if (resolvedReports.length === 0) return "0 days";
  
  let totalDays = 0;
  resolvedReports.forEach((report: any) => {
    const reported = new Date(report.dateReported);
    const updated = new Date(report.dateUpdated);
    const days = Math.floor((updated.getTime() - reported.getTime()) / (1000 * 60 * 60 * 24));
    totalDays += days;
  });
  
  const avgDays = (totalDays / resolvedReports.length).toFixed(1);
  return `${avgDays} days`;
}

function calculateCategoryDistribution(reports: any[]) {
  const categories = ["Pothole", "Street Light", "Water Leak", "Drainage", "Sidewalk", "Traffic Signal", "Waste Management"];
  return categories.map((cat, idx) => ({
    id: `cat-${cat.toLowerCase().replace(/\s+/g, '')}`,
    name: cat,
    value: reports.filter((r: any) => r.category === cat).length
  }));
}

function calculateMonthlyTrends(reports: any[]) {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const monthCounts: any = {};
  
  months.forEach(month => {
    monthCounts[month] = 0;
  });
  
  reports.forEach((report: any) => {
    const date = new Date(report.dateReported);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[date.getMonth()];
    if (monthCounts[monthName] !== undefined) {
      monthCounts[monthName]++;
    }
  });
  
  return months.map((month, idx) => ({
    id: `month-${month.toLowerCase()}`,
    month,
    reports: monthCounts[month]
  }));
}

Deno.serve(app.fetch);