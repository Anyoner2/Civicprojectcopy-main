import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_MODEL_PATH = path.join(__dirname, 'colab_model_artifacts', 'model_artifact.json');

function extractFeatures({ title = '', description = '', category = '' }) {
  const text = `${category}: ${title} ${description}`;
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/);
  const highWords = ['dangerous', 'urgent', 'emergency', 'flooding', 'damage', 'broken'];
  const medWords = ['concern', 'problem', 'issue', 'repair'];
  const lowWords = ['small', 'minor', 'cosmetic'];

  const highCount = highWords.reduce((count, word) => count + (textLower.includes(word) ? 1 : 0), 0);
  const medCount = medWords.reduce((count, word) => count + (textLower.includes(word) ? 1 : 0), 0);
  const lowCount = lowWords.reduce((count, word) => count + (textLower.includes(word) ? 1 : 0), 0);

  const categories = ['Pothole', 'Street Light', 'Water Leak', 'Drainage', 'Sidewalk', 'Traffic Signal', 'Waste'];
  const categoryText = (category || '').trim();
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

function fallbackClassifyReport(report) {
  const text = `${report.title || ''} ${report.description || ''}`.toLowerCase();
  const highMatch = ['pothole', 'accident', 'danger', 'emergency', 'critical', 'flooding'].some((term) => text.includes(term));
  const mediumMatch = ['broken', 'damaged', 'issue', 'problem', 'leak'].some((term) => text.includes(term));

  let priority = 'Low';
  if (highMatch) priority = 'High';
  else if (mediumMatch) priority = 'Medium';

  return {
    priority,
    severity: highMatch ? 8 : mediumMatch ? 5 : 2,
    riskFactor: highMatch ? 8 : mediumMatch ? 5 : 2,
    frequency: 1,
  };
}

function softmax(values) {
  const maxValue = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - maxValue));
  const sumExp = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / sumExp);
}

function predictPriority(model, features) {
  const logits = model.coefficients.map((coefficients, index) => {
    const intercept = model.intercepts[index] || 0;
    const score = coefficients.reduce((sum, weight, featureIndex) => sum + weight * features[featureIndex], intercept);
    return score;
  });

  const probabilities = softmax(logits);
  const bestIndex = probabilities.indexOf(Math.max(...probabilities));
  return model.classes[bestIndex];
}

function predictLinear(model, features) {
  const intercept = model.intercept || 0;
  const score = model.coefficients.reduce((sum, weight, featureIndex) => sum + weight * features[featureIndex], intercept);
  return score;
}

export async function classifyReportWithColabModel(report, modelPath = DEFAULT_MODEL_PATH) {
  try {
    if (!fs.existsSync(modelPath)) {
      return fallbackClassifyReport(report);
    }

    const artifact = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    const features = extractFeatures(report);

    const priority = predictPriority(artifact.priority, features);
    const severity = Math.max(1, Math.min(10, Math.round(predictLinear(artifact.severity, features))));
    const riskFactor = Math.max(1, Math.min(10, Math.round(predictLinear(artifact.risk, features))));

    return {
      priority,
      severity,
      riskFactor,
      frequency: 1,
    };
  } catch (error) {
    console.warn('Colab model unavailable, using fallback classifier:', error.message);
    return fallbackClassifyReport(report);
  }
}
