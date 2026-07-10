import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyReportWithColabModel } from './colab_model.js';

test('classifies a civic report using the exported Colab artifact or fallback', async () => {
  const result = await classifyReportWithColabModel({
    title: 'Large pothole on Moi Avenue',
    description: 'Dangerous pothole causing traffic accidents near Tom Mboya Street intersection',
    category: 'Pothole',
  });

  assert.ok(result.priority);
  assert.ok(result.severity >= 1 && result.severity <= 10);
  assert.ok(result.riskFactor >= 1 && result.riskFactor <= 10);
});
