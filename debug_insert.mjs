import Database from 'better-sqlite3';
import { classifyReportWithColabModel } from './colab_model.js';

const db = new Database('civic_app.db');
const reportColumns = db.prepare('PRAGMA table_info(reports)').all().map((column) => column.name);
console.log('columns', reportColumns);
const mlResults = await classifyReportWithColabModel({
  title: 'Pothole in road',
  description: 'Large pothole causing traffic issues',
  category: 'Pothole',
});
console.log('mlResults', mlResults);

const insertColumns = ['id', 'title', 'description', 'category', 'location_address', 'latitude', 'longitude', 'priority', 'severity'];
const insertValues = ['x', 't', 'd', 'c', 'loc', 0, 0, mlResults.priority, mlResults.severity];
if (reportColumns.includes('riskFactor')) {
  insertColumns.push('riskFactor');
  insertValues.push(mlResults.riskFactor);
}
if (reportColumns.includes('risk_factor')) {
  insertColumns.push('risk_factor');
  insertValues.push(mlResults.riskFactor);
}
insertColumns.push('status');
insertValues.push('Pending');
console.log('insertColumns', insertColumns);
console.log('insertValues', insertValues);
const query = `INSERT INTO reports (${insertColumns.join(', ')}) VALUES (${insertColumns.map(() => '?').join(', ')})`;
console.log(query);
db.prepare(query).run(...insertValues);
console.log('insert ok');
db.close();
