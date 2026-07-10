import * as tf from '@tensorflow/tfjs';

interface TrainingSample {
  id: string;
  reportId: string;
  category: string;
  description: string;
  originalPriority: string;
  originalSeverity: number;
  originalRiskFactor: number;
  correctedPriority: string;
  correctedSeverity: number;
  correctedRiskFactor: number;
  trainedAt: string;
  trainer: string;
}

interface MLModel {
  model: tf.LayersModel;
  trainingData: TrainingSample[];
  lastTrained: string;
}

let mlModel: MLModel | null = null;

export async function initializeML(): Promise<boolean> {
  try {
    console.log('Initializing TensorFlow.js...');
    console.log('TensorFlow.js initialized');
    return true;
  } catch (error) {
    console.error('ML init failed:', error);
    return false;
  }
}

function extractTextFeatures(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const highWords = ['dangerous', 'urgent', 'emergency', 'flooding', 'damage', 'broken'];
  const medWords = ['concern', 'problem', 'issue', 'repair'];
  const lowWords = ['small', 'minor', 'cosmetic'];

  const highCount = highWords.reduce((c, w) => c + (text.includes(w) ? 1 : 0), 0);
  const medCount = medWords.reduce((c, w) => c + (text.includes(w) ? 1 : 0), 0);
  const lowCount = lowWords.reduce((c, w) => c + (text.includes(w) ? 1 : 0), 0);

  const categories = ['Pothole', 'Street Light', 'Water Leak', 'Drainage', 'Sidewalk', 'Traffic Signal', 'Waste'];
  const categoryText = text.split(':')[0]?.trim() || '';
  const categoryIndex = categories.indexOf(categoryText);
  const catFeatures = categories.map((_, i) => i === categoryIndex ? 1 : 0);

  return [
    highCount / 10,
    medCount / 10,
    lowCount / 10,
    words.length / 100,
    text.length / 500,
    ...catFeatures
  ];
}

export async function trainModel(samples: TrainingSample[]): Promise<MLModel | null> {
  try {
    if (samples.length < 3) {
      console.log('Not enough training data');
      return null;
    }

    console.log('Training with ' + samples.length + ' samples...');

    const features = samples.map(s => extractTextFeatures(s.category + ': ' + s.description));
    const priorities = samples.map(s => {
      if (s.correctedPriority === 'High') return [1, 0, 0];
      if (s.correctedPriority === 'Medium') return [0, 1, 0];
      return [0, 0, 1];
    });
    const severities = samples.map(s => s.correctedSeverity / 10);
    const riskFactors = samples.map(s => s.correctedRiskFactor / 10);

    const xTrain = tf.tensor2d(features);
    const yPriority = tf.tensor2d(priorities);
    const ySeverity = tf.tensor1d(severities);
    const yRiskFactor = tf.tensor1d(riskFactors);

    const input = tf.layers.input({ shape: [features[0].length] });
    const h1 = tf.layers.dense({ units: 64, activation: 'relu' }).apply(input);
    const d1 = tf.layers.dropout({ rate: 0.2 }).apply(h1);
    const h2 = tf.layers.dense({ units: 32, activation: 'relu' }).apply(d1);

    const pOut = tf.layers.dense({ units: 3, activation: 'softmax', name: 'priority' }).apply(h2) as tf.SymbolicTensor;
    const sOut = tf.layers.dense({ units: 1, activation: 'sigmoid', name: 'severity' }).apply(h2) as tf.SymbolicTensor;
    const rOut = tf.layers.dense({ units: 1, activation: 'sigmoid', name: 'riskFactor' }).apply(h2) as tf.SymbolicTensor;

    const model = tf.model({ inputs: input, outputs: [pOut, sOut, rOut] });
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: { priority: 'categoricalCrossentropy', severity: 'meanSquaredError', riskFactor: 'meanSquaredError' },
      metrics: { priority: 'accuracy' }
    });

    console.log('Starting training...');
    await model.fit(xTrain, [yPriority, ySeverity, yRiskFactor], {
      epochs: 20,
      batchSize: 4,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 5 === 0) console.log('Epoch ' + epoch + ': loss=' + ((logs?.loss || 0) as number).toFixed(4));
        }
      }
    });

    console.log('Training complete');
    const result: MLModel = { model, trainingData: samples, lastTrained: new Date().toISOString() };
    mlModel = result;

    xTrain.dispose();
    yPriority.dispose();
    ySeverity.dispose();
    yRiskFactor.dispose();

    return result;
  } catch (error) {
    console.error('Training failed:', error);
    return null;
  }
}

export async function classifyWithML(report: any): Promise<any> {
  try {
    if (!mlModel?.model) return null;

    const text = report.category + ': ' + report.description;
    const features = extractTextFeatures(text);
    const input = tf.tensor2d([features]);
    const preds = mlModel.model.predict(input) as tf.Tensor[];

    const pIdx = (await preds[0].argMax(1).data())[0];
    const p = pIdx === 0 ? 'High' : pIdx === 1 ? 'Medium' : 'Low';
    const s = Math.round((await preds[1].data())[0] * 10);
    const r = Math.round((await preds[2].data())[0] * 10);

    input.dispose();
    preds.forEach(pred => pred.dispose());

    return {
      priority: p,
      severity: Math.max(1, Math.min(10, s)),
      riskFactor: Math.max(1, Math.min(10, r)),
      frequency: 1
    };
  } catch (error) {
    console.error('Classification failed:', error);
    return null;
  }
}

export function getModelStats() {
  return mlModel ? {
    isTrained: true,
    trainingSamples: mlModel.trainingData.length,
    lastTrained: mlModel.lastTrained
  } : { isTrained: false, trainingSamples: 0, lastTrained: null };
}
