import Database from 'better-sqlite3';
import fs from 'fs';

// Open database
const db = new Database('./civic_app.db');

// Read existing training samples
const existingTraining = JSON.parse(fs.readFileSync('./training_samples.json', 'utf-8'));
const existingReportIds = new Set(existingTraining.map(t => t.reportId));
const nextId = existingTraining.length + 1;

console.log(`📊 Found ${existingTraining.length} existing training samples`);

// Fetch all reports
const allReports = db.prepare('SELECT * FROM reports ORDER BY RANDOM() LIMIT 300').all();
console.log(`📝 Fetched ${allReports.length} reports from database`);

// Helper function to get column value (handles camelCase/snake_case)
function getColumnValue(obj, camelCase, snakeCase) {
  return obj[camelCase] !== undefined ? obj[camelCase] : obj[snakeCase];
}

// Helper function to determine corrected priority based on description and category
function determineCorrectedPriority(description, category, originalPriority) {
  const text = (description + ' ' + category).toLowerCase();
  
  const highKeywords = ['urgent', 'emergency', 'danger', 'accident', 'stuck', 'flooding', 'collapse', 'blocked', 'severe', 'critical'];
  const mediumKeywords = ['issue', 'problem', 'broken', 'damage', 'repair needed', 'leak', 'hazard'];
  
  if (highKeywords.some(k => text.includes(k))) return 'High';
  if (mediumKeywords.some(k => text.includes(k))) return 'Medium';
  return 'Low';
}

// Helper function to determine corrected severity (1-10)
function determineCorrectedSeverity(description, category) {
  const text = (description + ' ' + category).toLowerCase();
  
  if (text.includes('flood') || text.includes('collapse') || text.includes('accident')) return 9;
  if (text.includes('stuck') || text.includes('severe') || text.includes('emergency')) return 8;
  if (text.includes('broken') || text.includes('damage')) return 6;
  if (text.includes('crack') || text.includes('leak')) return 5;
  if (text.includes('minor') || text.includes('small')) return 3;
  return 5;
}

// Helper function to determine corrected risk factor (1-10)
function determineCorrectedRiskFactor(category, description) {
  const text = (description + ' ' + category).toLowerCase();
  
  // High risk categories/descriptions
  if (text.includes('pothole') && text.includes('traffic')) return 9;
  if (text.includes('light') && text.includes('night')) return 8;
  if (text.includes('water') && text.includes('flood')) return 9;
  if (text.includes('signal') || text.includes('traffic')) return 8;
  if (text.includes('drainage')) return 7;
  if (text.includes('waste')) return 5;
  if (text.includes('sidewalk')) return 6;
  
  return 6;
}

// Generate new training samples
const newSamples = [];
let addedCount = 0;

for (const report of allReports) {
  if (addedCount >= 150) break;
  
  const reportId = getColumnValue(report, 'id', 'id');
  
  // Skip if already in training data
  if (existingReportIds.has(reportId)) {
    continue;
  }
  
  const title = getColumnValue(report, 'title', 'title') || 'Infrastructure Issue';
  const description = getColumnValue(report, 'description', 'description') || '';
  const category = getColumnValue(report, 'category', 'category') || 'Other';
  const originalPriority = getColumnValue(report, 'priority', 'priority') || 'Medium';
  const originalSeverity = parseInt(getColumnValue(report, 'severity', 'severity') || 5);
  const originalRiskFactor = parseInt(getColumnValue(report, 'riskFactor', 'risk_factor') || 5);
  
  const correctedPriority = determineCorrectedPriority(description, category, originalPriority);
  const correctedSeverity = determineCorrectedSeverity(description, category);
  const correctedRiskFactor = determineCorrectedRiskFactor(category, description);
  
  const sample = {
    id: `training-${nextId + addedCount}`,
    reportId: reportId,
    category: category,
    description: `${title}. ${description}`.substring(0, 200),
    originalPriority: originalPriority,
    originalSeverity: originalSeverity,
    originalRiskFactor: originalRiskFactor,
    correctedPriority: correctedPriority,
    correctedSeverity: correctedSeverity,
    correctedRiskFactor: correctedRiskFactor,
    trainedAt: new Date().toISOString(),
    trainer: 'auto-generated@system'
  };
  
  newSamples.push(sample);
  addedCount++;
}

console.log(`✅ Generated ${addedCount} new training samples`);

// Combine and save
const allSamples = [...existingTraining, ...newSamples];
fs.writeFileSync('./training_samples.json', JSON.stringify(allSamples, null, 2));

console.log(`💾 Updated training_samples.json with ${allSamples.length} total samples`);
console.log(`📈 Before: ${existingTraining.length} samples → After: ${allSamples.length} samples`);

db.close();
