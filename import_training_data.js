import fs from 'fs';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup
const dbPath = path.join(__dirname, 'civic_app.db');
const db = new sqlite3.Database(dbPath);

// Load training samples from JSON
const trainingSamples = JSON.parse(fs.readFileSync('training_samples.json', 'utf8'));

console.log(`Found ${trainingSamples.length} training samples to import`);

// Insert training samples into database
let imported = 0;
trainingSamples.forEach((sample, index) => {
  db.run(`INSERT OR IGNORE INTO training_data
          (id, report_id, corrected_priority, corrected_severity, corrected_risk_factor, trained_at, trainer)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      sample.id,
      sample.reportId,
      sample.correctedPriority,
      sample.correctedSeverity,
      sample.correctedRiskFactor,
      sample.trainedAt,
      sample.trainer || 'admin@nairobi.gov'
    ],
    function(err) {
      if (err) {
        console.error(`Error importing sample ${sample.id}:`, err);
      } else if (this.changes > 0) {
        imported++;
      }

      // Close database after all samples are processed
      if (index === trainingSamples.length - 1) {
        console.log(`✓ Imported ${imported} training samples into database`);
        db.close();
      }
    }
  );
});