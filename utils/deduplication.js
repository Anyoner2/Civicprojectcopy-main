// Similarity detection for report consolidation
export function calculateLocationDistance(lat1, lon1, lat2, lon2) {
  // Calculate distance in meters using Haversine formula
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find potential duplicates based on exact location + exact category
export function findPotentialDuplicates(report, allReports, locationThresholdMeters = 50) {
  const duplicates = [];
  
  for (const otherReport of allReports) {
    // Skip same report
    if (report.id === otherReport.id) continue;
    
    // Must be exact same category
    if (report.category !== otherReport.category) continue;
    
    // Check if location is within threshold distance
    const lat1 = report.latitude || 0;
    const lon1 = report.longitude || 0;
    const lat2 = otherReport.latitude || 0;
    const lon2 = otherReport.longitude || 0;
    
    const distance = calculateLocationDistance(lat1, lon1, lat2, lon2);
    
    // Within 50 meters (same issue location)
    if (distance <= locationThresholdMeters) {
      duplicates.push({
        ...otherReport,
        distance: Math.round(distance)
      });
    }
  }
  
  return duplicates.sort((a, b) => a.distance - b.distance);
}

// Consolidate duplicate reports into one master report with count
export function consolidateReports(reports, locationThresholdMeters = 50) {
  const seen = new Set();
  const consolidated = [];
  
  for (const report of reports) {
    if (seen.has(report.id)) continue;
    
    // Find all duplicates for this report (same category + location)
    const duplicates = findPotentialDuplicates(report, reports, locationThresholdMeters);
    const duplicateIds = duplicates.map(d => d.id);
    
    // Mark all duplicates as seen
    seen.add(report.id);
    duplicateIds.forEach(id => seen.add(id));
    
    // Create consolidated report
    const consolidatedReport = {
      ...report,
      duplicateCount: duplicateIds.length + 1, // Including self
      duplicateIds: [report.id, ...duplicateIds],
      isMasterReport: true,
      consolidatedAt: new Date().toISOString()
    };
    
    consolidated.push(consolidatedReport);
  }
  
  return consolidated;
}
