// Similarity detection for report consolidation
export function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  // Levenshtein distance based similarity
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

// Find potential duplicates for a report
export function findPotentialDuplicates(report, allReports, similarityThreshold = 0.7) {
  const duplicates = [];
  
  for (const otherReport of allReports) {
    // Skip same report
    if (report.id === otherReport.id) continue;
    
    // Check if same category and nearby location
    if (report.category !== otherReport.category) continue;
    
    // Calculate text similarity
    const titleSimilarity = calculateSimilarity(report.title || '', otherReport.title || '');
    const descSimilarity = calculateSimilarity(report.description || '', otherReport.description || '');
    const avgSimilarity = (titleSimilarity + descSimilarity) / 2;
    
    if (avgSimilarity >= similarityThreshold) {
      duplicates.push({
        ...otherReport,
        similarity: avgSimilarity
      });
    }
  }
  
  return duplicates.sort((a, b) => b.similarity - a.similarity);
}

// Consolidate duplicate reports into one master report with count
export function consolidateReports(reports) {
  const seen = new Set();
  const consolidated = [];
  
  for (const report of reports) {
    if (seen.has(report.id)) continue;
    
    // Find all duplicates for this report
    const duplicates = findPotentialDuplicates(report, reports, 0.7);
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
