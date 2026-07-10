import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'civic_app.db');
const db = new sqlite3.Database(dbPath);

const categories = ['Pothole', 'Street Light', 'Water Leak', 'Drainage', 'Sidewalk', 'Traffic Signal', 'Waste Management', 'Other'];
const priorities = ['High', 'Medium', 'Low'];
const statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

// Distribution to add up to 521
// High: 150, Medium: 200, Low: 171 = 521
// Pending: 200, In Progress: 150, Resolved: 150, Rejected: 21 = 521

const HIGH_COUNT = 150;
const MEDIUM_COUNT = 200;
const LOW_COUNT = 171;

const PENDING_COUNT = 200;
const IN_PROGRESS_COUNT = 150;
const RESOLVED_COUNT = 150;
const REJECTED_COUNT = 21;

const TOTAL = 521;

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateReport(index) {
  let priority, status;
  
  // Distribute by priority
  if (index < HIGH_COUNT) {
    priority = 'High';
  } else if (index < HIGH_COUNT + MEDIUM_COUNT) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }
  
  // Distribute by status
  if (index < PENDING_COUNT) {
    status = 'Pending';
  } else if (index < PENDING_COUNT + IN_PROGRESS_COUNT) {
    status = 'In Progress';
  } else if (index < PENDING_COUNT + IN_PROGRESS_COUNT + RESOLVED_COUNT) {
    status = 'Resolved';
  } else {
    status = 'Rejected';
  }
  
  const category = getRandomElement(categories);
  const severity = Math.floor(Math.random() * 10) + 1;
  const riskFactor = Math.floor(Math.random() * 10) + 1;
  
  // Generate random location in Nairobi area
  const lat = -1.2821 + (Math.random() * 0.1);
  const lng = 36.8155 + (Math.random() * 0.1);
  
  const reportTitles = {
    'Pothole': ['Large pothole on street', 'Dangerous pothole at intersection', 'Pothole causing traffic hazard'],
    'Street Light': ['Broken street light', 'Street light not working', 'Malfunctioning street light'],
    'Water Leak': ['Water main burst', 'Water leak flooding road', 'Burst water pipe'],
    'Drainage': ['Blocked drainage', 'Drainage overflow', 'Clogged storm drain'],
    'Sidewalk': ['Broken sidewalk', 'Cracked pavement', 'Damaged sidewalk'],
    'Traffic Signal': ['Traffic light malfunction', 'Broken traffic signal', 'Traffic signal not working'],
    'Waste Management': ['Overflowing trash bin', 'Uncollected garbage', 'Waste disposal issue'],
    'Other': ['Infrastructure issue', 'Public facility damage', 'Road maintenance needed']
  };
  
  const title = getRandomElement(reportTitles[category] || ['Infrastructure issue']);
  
  const descriptions = [
    'This issue requires immediate attention',
    'Reported by concerned citizen',
    'Ongoing maintenance needed',
    'Safety hazard present',
    'Infrastructure degradation',
    'Requires urgent repairs',
    'Affects public safety',
    'Public convenience impacted'
  ];
  
  const description = getRandomElement(descriptions);
  
  const locations = [
    'Main Street, Nairobi',
    'Park Road, Nairobi',
    'River Road, Nairobi',
    'Koinange Street, Nairobi',
    'Luthuli Avenue, Nairobi',
    'Moi Avenue, Nairobi',
    'Tom Mboya Street, Nairobi',
    'Uhuru Highway, Nairobi',
    'Waiyaki Way, Nairobi',
    'Outer Ring Road, Nairobi',
    'Forest Road, Nairobi',
    'Industrial Area, Nairobi',
    'Nairobi CBD, Nairobi'
  ];
  
  const location = getRandomElement(locations);
  
  return {
    id: `report-${String(index + 1).padStart(4, '0')}`,
    title,
    description,
    category,
    priority,
    severity,
    risk_factor: riskFactor,
    location_address: location,
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    status,
    date_reported: new Date(2026, 3, Math.floor(Math.random() * 16) + 1).toISOString(),
    date_updated: new Date(2026, 3, Math.floor(Math.random() * 17) + 1).toISOString(),
    reported_by: `citizen${index % 1000}@example.com`
  };
}

console.log('Seeding 521 reports to database...');
console.log(`Distribution:`);
console.log(`  High Priority: ${HIGH_COUNT}`);
console.log(`  Medium Priority: ${MEDIUM_COUNT}`);
console.log(`  Low Priority: ${LOW_COUNT}`);
console.log(`  Total: ${TOTAL}`);
console.log(`  ---`);
console.log(`  Pending: ${PENDING_COUNT}`);
console.log(`  In Progress: ${IN_PROGRESS_COUNT}`);
console.log(`  Resolved: ${RESOLVED_COUNT}`);
console.log(`  Rejected: ${REJECTED_COUNT}`);
console.log(`  Total: ${TOTAL}`);
console.log('');

let addedCount = 0;
let errorCount = 0;

const insertReport = (report) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO reports 
       (id, title, description, category, priority, severity, risk_factor, 
        location_address, latitude, longitude, status, date_reported, date_updated, reported_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.id,
        report.title,
        report.description,
        report.category,
        report.priority,
        report.severity,
        report.risk_factor,
        report.location_address,
        report.latitude,
        report.longitude,
        report.status,
        report.date_reported,
        report.date_updated,
        report.reported_by
      ],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

async function seedAllReports() {
  try {
    // First clear existing reports for a clean slate
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM reports', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('Cleared existing reports');
    
    // Insert all reports sequentially to avoid database locks
    for (let i = 0; i < TOTAL; i++) {
      try {
        const report = generateReport(i);
        await insertReport(report);
        addedCount++;
        
        if ((i + 1) % 50 === 0) {
          console.log(`✓ Added ${i + 1}/${TOTAL} reports`);
        }
      } catch (err) {
        errorCount++;
        console.error(`✗ Error adding report ${i + 1}:`, err.message);
      }
    }
    
    console.log('');
    console.log(`✅ Successfully added ${addedCount} reports!`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} errors encountered`);
    }
    
    // Verify the counts
    const verifyCounts = () => {
      return new Promise((resolve) => {
        db.get('SELECT COUNT(*) as total FROM reports', (err, row) => {
          if (err) {
            console.error('Error verifying:', err);
          } else {
            console.log(`\nVerification: ${row.total} total reports in database`);
          }
          resolve();
        });
      });
    };
    
    await verifyCounts();
    db.close();
  } catch (error) {
    console.error('Fatal error:', error);
    db.close();
  }
}

seedAllReports();
