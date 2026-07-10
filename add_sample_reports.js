import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup
const dbPath = path.join(__dirname, 'civic_app.db');
const db = new sqlite3.Database(dbPath);

// Sample reports with different priorities
const sampleReports = [
  {
    id: 'report-001',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'Roads',
    priority: 'High',
    severity: 8,
    risk_factor: 9,
    location_address: 'Main Street, Nairobi',
    latitude: -1.2921,
    longitude: 36.8219,
    status: 'Pending',
    date_reported: '2026-04-16T10:00:00.000Z',
    date_updated: '2026-04-16T10:00:00.000Z',
    reported_by: 'citizen@example.com'
  },
  {
    id: 'report-002',
    title: 'Street light out',
    description: 'Street light not working at night',
    category: 'Lighting',
    priority: 'Medium',
    severity: 5,
    risk_factor: 6,
    location_address: 'Park Road, Nairobi',
    latitude: -1.2950,
    longitude: 36.8200,
    status: 'In Progress',
    date_reported: '2026-04-15T14:30:00.000Z',
    date_updated: '2026-04-16T09:00:00.000Z',
    reported_by: 'user@test.com'
  },
  {
    id: 'report-003',
    title: 'Small crack in sidewalk',
    description: 'Minor crack that needs repair',
    category: 'Sidewalks',
    priority: 'Low',
    severity: 3,
    risk_factor: 4,
    location_address: 'River Road, Nairobi',
    latitude: -1.2900,
    longitude: 36.8250,
    status: 'Resolved',
    date_reported: '2026-04-10T11:15:00.000Z',
    date_updated: '2026-04-14T16:00:00.000Z',
    reported_by: 'citizen2@example.com'
  },
  {
    id: 'report-004',
    title: 'Broken traffic signal',
    description: 'Traffic light malfunctioning at busy intersection',
    category: 'Traffic',
    priority: 'High',
    severity: 9,
    risk_factor: 10,
    location_address: 'Koinange Street, Nairobi',
    latitude: -1.2880,
    longitude: 36.8230,
    status: 'Pending',
    date_reported: '2026-04-16T08:45:00.000Z',
    date_updated: '2026-04-16T08:45:00.000Z',
    reported_by: 'driver@example.com'
  },
  {
    id: 'report-005',
    title: 'Overflowing trash bin',
    description: 'Public waste bin is full and needs emptying',
    category: 'Waste',
    priority: 'Medium',
    severity: 4,
    risk_factor: 5,
    location_address: 'Luthuli Avenue, Nairobi',
    latitude: -1.2930,
    longitude: 36.8180,
    status: 'Pending',
    date_reported: '2026-04-16T12:20:00.000Z',
    date_updated: '2026-04-16T12:20:00.000Z',
    reported_by: 'resident@example.com'
  }
];

console.log('Adding sample reports to database...');

let added = 0;
sampleReports.forEach((report, index) => {
  // Check if report already exists
  db.get('SELECT id FROM reports WHERE id = ?', [report.id], (err, row) => {
    if (err) {
      console.error(`Error checking report ${report.id}:`, err);
      return;
    }

    if (row) {
      console.log(`Report ${report.id} already exists, skipping...`);
      checkComplete();
      return;
    }

    // Insert new report
    db.run(`INSERT INTO reports
            (id, title, description, category, priority, severity, risk_factor,
             location_address, latitude, longitude, status, date_reported, date_updated, reported_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.id, report.title, report.description, report.category, report.priority,
        report.severity, report.risk_factor, report.location_address, report.latitude,
        report.longitude, report.status, report.date_reported, report.date_updated, report.reported_by
      ],
      function(err) {
        if (err) {
          console.error(`Error inserting report ${report.id}:`, err);
        } else {
          added++;
          console.log(`✓ Added report ${report.id} (${report.priority} priority)`);
        }
        checkComplete();
      }
    );
  });

  function checkComplete() {
    if (index === sampleReports.length - 1) {
      setTimeout(() => {
        console.log(`\n✓ Added ${added} new reports to database`);
        console.log('Priority distribution should now show:');
        console.log('- High Priority: 2 reports');
        console.log('- Medium Priority: 2 reports');
        console.log('- Low Priority: 1 report');
        db.close();
      }, 100);
    }
  }
});