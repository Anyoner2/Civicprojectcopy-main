import { mockReports } from './mockData.ts';

// Generate training samples from mock reports
export function generateTrainingSamples(count: number = 10) {
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
      trainedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
      trainer: 'admin@nairobi.gov'
    });
  }

  return trainingSamples;
}

// Export training samples to JSON
export function exportTrainingSamples(samples: any[]) {
  return JSON.stringify(samples, null, 2);
}

// Import training samples from JSON
export function importTrainingSamples(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing training samples:', error);
    return [];
  }
}

// Generate sample training data
const sampleTrainingData = generateTrainingSamples(15);

console.log('Generated Training Samples:');
console.log(exportTrainingSamples(sampleTrainingData));

export { sampleTrainingData };