import fs from 'fs';
import path from 'path';

const data = JSON.parse(fs.readFileSync(path.resolve('training_samples.json'), 'utf8'));

function extractFeatures(sample) {
  const text = `${sample.category}: ${sample.description}`;
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/);
  const highWords = ['dangerous', 'urgent', 'emergency', 'flooding', 'damage', 'broken'];
  const medWords = ['concern', 'problem', 'issue', 'repair'];
  const lowWords = ['small', 'minor', 'cosmetic'];

  const highCount = highWords.reduce((count, word) => count + (textLower.includes(word) ? 1 : 0), 0);
  const medCount = medWords.reduce((count, word) => count + (textLower.includes(word) ? 1 : 0), 0);
  const lowCount = lowWords.reduce((count, word) => count + (textLower.includes(word) ? 1 : 0), 0);

  const categories = ['Pothole', 'Street Light', 'Water Leak', 'Drainage', 'Sidewalk', 'Traffic Signal', 'Waste'];
  const categoryText = (sample.category || '').trim();
  const categoryIndex = categories.indexOf(categoryText);
  const catFeatures = categories.map((_, index) => (index === categoryIndex ? 1 : 0));

  return [
    highCount / 10,
    medCount / 10,
    lowCount / 10,
    words.length / 100,
    text.length / 500,
    ...catFeatures,
  ];
}

function dot(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

function trainLinearRegression(features, targets) {
  const weights = Array(features[0].length).fill(0);
  let bias = 0;
  const learningRate = 0.01;
  const epochs = 3000;

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    let gradW = Array(weights.length).fill(0);
    let gradB = 0;

    for (let i = 0; i < features.length; i += 1) {
      const prediction = bias + dot(weights, features[i]);
      const error = prediction - targets[i];
      gradB += error;
      for (let j = 0; j < weights.length; j += 1) {
        gradW[j] += error * features[i][j];
      }
    }

    const scale = 2 / features.length;
    for (let j = 0; j < weights.length; j += 1) {
      weights[j] -= learningRate * gradW[j] * scale;
    }
    bias -= learningRate * gradB * scale;
  }

  return { coefficients: weights, intercept: bias };
}

function trainPriorityModel(features, priorities) {
  const classes = ['High', 'Medium', 'Low'];
  const classFeatures = classes.map((label) => features.filter((_, index) => priorities[index] === label));
  const coefficients = classFeatures.map((group) => {
    const mean = Array(features[0].length).fill(0);
    if (group.length === 0) {
      return mean;
    }
    group.forEach((vector) => {
      vector.forEach((value, index) => {
        mean[index] += value;
      });
    });
    return mean.map((value) => value / group.length);
  });

  return {
    classes,
    coefficients,
    intercepts: Array(classes.length).fill(0),
  };
}

const features = data.map(extractFeatures);
const priorities = data.map((sample) => sample.correctedPriority);
const severities = data.map((sample) => sample.correctedSeverity);
const risks = data.map((sample) => sample.correctedRiskFactor);

const priorityModel = trainPriorityModel(features, priorities);
const severityModel = trainLinearRegression(features, severities);
const riskModel = trainLinearRegression(features, risks);

const artifact = {
  priority: priorityModel,
  severity: severityModel,
  risk: riskModel,
};

const outDir = path.resolve('colab_model_artifacts');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'model_artifact.json'), JSON.stringify(artifact, null, 2));

console.log('Trained model artifact written to colab_model_artifacts/model_artifact.json');
