// Generate training samples for ML model
const mockReports = [
  {
    id: "report-1",
    title: "Large pothole on Moi Avenue",
    description: "Dangerous pothole causing traffic accidents near Tom Mboya Street intersection",
    category: "Pothole",
    priority: "High",
    severity: 8,
    riskFactor: 9
  },
  {
    id: "report-2",
    title: "Broken street light on Luthuli Avenue",
    description: "Street light has been out for two weeks, making the area unsafe at night",
    category: "Street Light",
    priority: "Medium",
    severity: 6,
    riskFactor: 7
  },
  {
    id: "report-3",
    title: "Water leak flooding sidewalk",
    description: "Burst water pipe causing flooding and making the sidewalk impassable",
    category: "Water Leak",
    priority: "High",
    severity: 9,
    riskFactor: 8
  },
  {
    id: "report-4",
    title: "Blocked drainage causing flooding",
    description: "Drainage system clogged with debris, causing water to overflow onto the road",
    category: "Drainage",
    priority: "High",
    severity: 7,
    riskFactor: 8
  },
  {
    id: "report-5",
    title: "Cracked sidewalk in Parklands",
    description: "Uneven sidewalk with cracks that could cause tripping hazards",
    category: "Sidewalk",
    priority: "Low",
    severity: 4,
    riskFactor: 5
  },
  {
    id: "report-6",
    title: "Traffic light malfunction at roundabout",
    description: "Traffic signal stuck on red light, causing major traffic congestion",
    category: "Traffic Signal",
    priority: "High",
    severity: 8,
    riskFactor: 9
  },
  {
    id: "report-7",
    title: "Overflowing garbage bins",
    description: "Public waste bins are full and overflowing, attracting pests",
    category: "Waste Management",
    priority: "Medium",
    severity: 5,
    riskFactor: 6
  },
  {
    id: "report-8",
    title: "Small pothole on residential street",
    description: "Minor pothole that needs repair before it gets worse",
    category: "Pothole",
    priority: "Low",
    severity: 3,
    riskFactor: 4
  }
];

function generateTrainingSamples(count = 15) {
  const trainingSamples = [];

  for (let i = 0; i < count; i++) {
    // Pick a random report
    const report = mockReports[Math.floor(Math.random() * mockReports.length)];

    // Simulate some corrections (slight variations from original)
    const correctedPriority = Math.random() > 0.7 ?
      (report.priority === 'High' ? 'Medium' : report.priority === 'Medium' ? 'Low' : 'High') :
      report.priority;

    const correctedSeverity = Math.max(1, Math.min(10,
      report.severity + (Math.random() - 0.5) * 2
    ));

    const correctedRiskFactor = Math.max(1, Math.min(10,
      report.riskFactor + (Math.random() - 0.5) * 2
    ));

    trainingSamples.push({
      id: `training-${i + 1}`,
      reportId: report.id,
      category: report.category,
      description: report.description,
      originalPriority: report.priority,
      originalSeverity: report.severity,
      originalRiskFactor: report.riskFactor,
      correctedPriority,
      correctedSeverity: Math.round(correctedSeverity),
      correctedRiskFactor: Math.round(correctedRiskFactor),
      trainedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      trainer: 'admin@nairobi.gov'
    });
  }

  return trainingSamples;
}

// Generate and display training samples
const samples = generateTrainingSamples(15);

console.log('=== TRAINING SAMPLES FOR ML MODEL ===\n');
console.log(`Generated ${samples.length} training samples:\n`);

samples.forEach((sample, index) => {
  console.log(`${index + 1}. Report: ${sample.reportId}`);
  console.log(`   Category: ${sample.category}`);
  console.log(`   Original: Priority=${sample.originalPriority}, Severity=${sample.originalSeverity}, Risk=${sample.originalRiskFactor}`);
  console.log(`   Corrected: Priority=${sample.correctedPriority}, Severity=${sample.correctedSeverity}, Risk=${sample.correctedRiskFactor}`);
  console.log(`   Trained: ${new Date(sample.trainedAt).toLocaleDateString()}\n`);
});

console.log('=== SUMMARY STATISTICS ===');
const priorityChanges = samples.filter(s => s.originalPriority !== s.correctedPriority).length;
const severityChanges = samples.filter(s => s.originalSeverity !== s.correctedSeverity).length;
const riskChanges = samples.filter(s => s.originalRiskFactor !== s.correctedRiskFactor).length;

console.log(`Total samples: ${samples.length}`);
console.log(`Priority corrections: ${priorityChanges}`);
console.log(`Severity corrections: ${severityChanges}`);
console.log(`Risk factor corrections: ${riskChanges}`);
console.log(`Accuracy improvements possible: ${((priorityChanges + severityChanges + riskChanges) / (samples.length * 3) * 100).toFixed(1)}%`);

// Export to JSON file
import fs from 'fs';
fs.writeFileSync('training_samples.json', JSON.stringify(samples, null, 2));
console.log('\nTraining samples exported to: training_samples.json');