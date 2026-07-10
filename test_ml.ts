// Test ML Integration
import { initializeML, trainModel } from './ml_model.js';

// Test data
const testTrainingData = [
  {
    id: "training-test-1",
    reportId: "report-test-1",
    category: "Pothole",
    description: "Large dangerous pothole causing vehicle damage",
    originalPriority: "Medium",
    originalSeverity: 5,
    originalRiskFactor: 6,
    correctedPriority: "High",
    correctedSeverity: 9,
    correctedRiskFactor: 8,
    trainedAt: new Date().toISOString(),
    trainer: "test-admin"
  },
  {
    id: "training-test-2",
    reportId: "report-test-2",
    category: "Street Light",
    description: "Street light completely out for weeks",
    originalPriority: "Low",
    originalSeverity: 3,
    originalRiskFactor: 4,
    correctedPriority: "Medium",
    correctedSeverity: 6,
    correctedRiskFactor: 7,
    trainedAt: new Date().toISOString(),
    trainer: "test-admin"
  },
  {
    id: "training-test-3",
    reportId: "report-test-3",
    category: "Water Leak",
    description: "Small water leak from pipe",
    originalPriority: "Low",
    originalSeverity: 2,
    originalRiskFactor: 3,
    correctedPriority: "Low",
    correctedSeverity: 4,
    correctedRiskFactor: 5,
    trainedAt: new Date().toISOString(),
    trainer: "test-admin"
  }
];

async function testML() {
  console.log('🧪 Testing ML Integration...\n');

  // Test initialization
  console.log('1. Testing ML initialization...');
  const initialized = await initializeML();
  if (initialized) {
    console.log('✅ ML initialization successful\n');
  } else {
    console.log('❌ ML initialization failed\n');
    return;
  }

  // Test training
  console.log('2. Testing model training...');
  const model = await trainModel(testTrainingData);
  if (model) {
    console.log('✅ Model training successful\n');
    console.log('Model stats:', {
      trainingSamples: model.trainingData.length,
      lastTrained: model.lastTrained
    });
  } else {
    console.log('❌ Model training failed\n');
  }

  console.log('🎉 ML integration test completed!');
}

// Run test
testML().catch(console.error);