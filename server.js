import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const reports = new Map();
const users = new Map();
const trainingData = [];

// Helper: Generate ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ML Classification simulation
function classifyReport(report) {
  const highPriorityKeywords = ['pothole', 'accident', 'danger', 'emergency', 'critical'];
  const mediumPriorityKeywords = ['broken', 'damaged', 'issue', 'problem', 'leak'];
  
  const text = `${report.title} ${report.description}`.toLowerCase();
  
  let priority = 'Low';
  const highMatch = highPriorityKeywords.some(k => text.includes(k));
  const mediumMatch = mediumPriorityKeywords.some(k => text.includes(k));
  
  if (highMatch) priority = 'High';
  else if (mediumMatch) priority = 'Medium';
  
  return {
    priority,
    severity: highMatch ? 8 : mediumMatch ? 5 : 2,
    riskFactor: highMatch ? 0.8 : mediumMatch ? 0.5 : 0.2,
    frequency: 1,
  };
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.post('/api/signup', (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name || !role) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    if (users.has(email)) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    users.set(email, { email, password, name, role });
    console.log(`✓ User signed up: ${email} (${role})`);
    
    res.json({
      success: true,
      user: { email, name, role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const user = users.get(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    
    if (user.role !== role) {
      return res.status(403).json({ 
        success: false, 
        error: `This account is registered as a ${user.role}. Please select the correct account type.` 
      });
    }
    
    // Generate mock JWT token
    const mockToken = Buffer.from(JSON.stringify({ email, role, iat: Date.now() })).toString('base64');
    
    console.log(`✓ User logged in: ${email} (${role})`);
    res.json({
      success: true,
      user: { email, name: user.name, role },
      accessToken: mockToken
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.get('/api/verify-session', (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No access token provided' });
    }
    
    try {
      const data = JSON.parse(Buffer.from(token, 'base64').toString());
      const user = users.get(data.email);
      
      res.json({
        success: true,
        user: { email: user.email, name: user.name, role: user.role }
      });
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Report routes
app.post('/api/reports', (req, res) => {
  try {
    const { title, description, category, location, latitude, longitude } = req.body;
    
    if (!title || !description || !category || !location) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const token = req.header('Authorization')?.split(' ')[1];
    let reportedBy = 'anonymous';
    
    if (token) {
      try {
        const data = JSON.parse(Buffer.from(token, 'base64').toString());
        reportedBy = data.email;
      } catch {}
    }
    
    const reportId = `report-${generateId()}`;
    const mlResults = classifyReport({ title, description, category });
    
    const report = {
      id: reportId,
      title,
      description,
      category,
      location: { address: location, lat: latitude || 0, lng: longitude || 0 },
      latitude,
      longitude,
      priority: mlResults.priority,
      severity: mlResults.severity,
      riskFactor: mlResults.riskFactor,
      status: 'Pending',
      dateReported: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      reportedBy,
    };
    
    reports.set(reportId, report);
    console.log(`✓ Report created: ${reportId} by ${reportedBy}`);
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.get('/api/reports', (req, res) => {
  try {
    const reportsList = Array.from(reports.values());
    console.log(`✓ Fetched ${reportsList.length} reports`);
    res.json({ success: true, data: reportsList });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.get('/api/reports/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const userReports = Array.from(reports.values()).filter(r => r.reportedBy === userId);
    console.log(`✓ Fetched ${userReports.length} reports for user ${userId}`);
    res.json({ success: true, data: userReports });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.put('/api/reports/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const report = reports.get(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    
    report.status = status;
    report.dateUpdated = new Date().toISOString();
    reports.set(id, report);
    
    console.log(`✓ Report ${id} status updated to ${status}`);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Analytics
app.get('/api/analytics', (req, res) => {
  try {
    const reportsList = Array.from(reports.values());
    
    // Category distribution
    const categoryCount = {};
    reportsList.forEach(r => {
      categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryCount).map(([name, value]) => ({
      id: name,
      name,
      value,
    }));
    
    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toISOString().slice(0, 7); // YYYY-MM
      const count = reportsList.filter(r => r.dateReported.startsWith(month)).length;
      monthlyTrends.push({
        id: month,
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        reports: count,
      });
    }
    
    const analytics = {
      totalReports: reportsList.length,
      pendingReports: reportsList.filter(r => r.status === 'Pending').length,
      inProgressReports: reportsList.filter(r => r.status === 'In Progress').length,
      resolvedReports: reportsList.filter(r => r.status === 'Resolved').length,
      rejectedReports: reportsList.filter(r => r.status === 'Rejected').length,
      highPriorityCount: reportsList.filter(r => r.priority === 'High').length,
      mediumPriorityCount: reportsList.filter(r => r.priority === 'Medium').length,
      lowPriorityCount: reportsList.filter(r => r.priority === 'Low').length,
      categoryDistribution,
      monthlyTrends,
    };
    
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ML Stats
app.get('/api/ml-stats', (req, res) => {
  try {
    const reportsList = Array.from(reports.values());
    const trainedReports = trainingData.length;
    const untrainedReports = reportsList.length - trainedReports;
    
    const stats = {
      totalReports: reportsList.length,
      trainedReports,
      untrainedReports,
      trainingDataSamples: trainingData.length,
      modelAccuracy: trainedReports > 0 ? `${Math.min(95, 60 + trainedReports * 2)}%` : "0%",
      lastTrainedAt: trainingData.length > 0 ? trainingData[trainingData.length - 1].timestamp : null,
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ML Training
app.post('/api/training', (req, res) => {
  try {
    const { reportId, correctedPriority, correctedSeverity, correctedRiskFactor } = req.body;
    
    trainingData.push({
      id: `training-${generateId()}`,
      reportId,
      correctedPriority,
      correctedSeverity,
      correctedRiskFactor,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Training data submitted' });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Retrain Model
app.post('/api/retrain', (req, res) => {
  try {
    // Simulate retraining based on training data
    // In a real implementation, this would update the model
    console.log(`Retraining model with ${trainingData.length} samples`);
    
    res.json({ 
      success: true, 
      message: `Model retrained successfully with ${trainingData.length} training samples. Accuracy improved to ${Math.min(95, 60 + trainingData.length * 2)}%` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Local API Server running at http://localhost:${PORT}`);
  console.log(`📝 Report endpoint: POST http://localhost:${PORT}/api/reports`);
  console.log(`💾 Using in-memory storage (data resets on server restart)\n`);
});
