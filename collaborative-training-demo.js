// Collaborative ML Training Demo
// This script demonstrates how multiple admins can contribute to training

const demoAdmins = [
  { email: 'sarah.mwangi@nairobi.gov', name: 'Sarah Mwangi' },
  { email: 'david.kimani@nairobi.gov', name: 'David Kimani' },
  { email: 'mary.wanjiku@nairobi.gov', name: 'Mary Wanjiku' },
  { email: 'admin@nairobi.gov', name: 'Admin User' }
];

const trainingScenarios = [
  {
    reportId: 'report-new-1',
    category: 'Pothole',
    description: 'Large crater in road causing vehicle damage',
    originalPriority: 'High',
    originalSeverity: 7,
    originalRiskFactor: 8,
    corrections: [
      { trainer: 'sarah.mwangi@nairobi.gov', priority: 'High', severity: 9, riskFactor: 9 },
      { trainer: 'david.kimani@nairobi.gov', priority: 'High', severity: 8, riskFactor: 8 },
      { trainer: 'mary.wanjiku@nairobi.gov', priority: 'High', severity: 9, riskFactor: 9 }
    ]
  },
  {
    reportId: 'report-new-2',
    category: 'Street Light',
    description: 'Multiple street lights out in residential area',
    originalPriority: 'Medium',
    originalSeverity: 4,
    originalRiskFactor: 6,
    corrections: [
      { trainer: 'sarah.mwangi@nairobi.gov', priority: 'High', severity: 7, riskFactor: 8 },
      { trainer: 'admin@nairobi.gov', priority: 'Medium', severity: 5, riskFactor: 6 }
    ]
  }
];

console.log('🤝 Collaborative ML Training Demo');
console.log('=====================================\n');

console.log('Available Admin Users:');
demoAdmins.forEach(admin => {
  console.log(`• ${admin.name} (${admin.email})`);
});

console.log('\n📊 Training Scenarios:');
trainingScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.category}: ${scenario.description}`);
  console.log(`   Original: Priority=${scenario.originalPriority}, Severity=${scenario.originalSeverity}, Risk=${scenario.originalRiskFactor}`);

  console.log('   Corrections:');
  scenario.corrections.forEach(correction => {
    const admin = demoAdmins.find(a => a.email === correction.trainer);
    console.log(`   • ${admin?.name}: Priority=${correction.priority}, Severity=${correction.severity}, Risk=${correction.riskFactor}`);
  });

  // Check for consensus
  const priorityConsensus = scenario.corrections.every(c => c.priority === scenario.corrections[0].priority);
  if (priorityConsensus && scenario.corrections.length > 1) {
    console.log(`   ✅ Consensus: ${scenario.corrections.length} admins agree on ${scenario.corrections[0].priority} priority`);
  }
});

console.log('\n🚀 How to Use Collaborative Training:');
console.log('1. Multiple admins can log in and review the same reports');
console.log('2. Each admin can provide their expert corrections');
console.log('3. The system tracks who made which corrections');
console.log('4. Consensus corrections get higher confidence');
console.log('5. Training history shows collaborative contributions');

console.log('\n📈 Benefits:');
console.log('• Diverse perspectives improve model accuracy');
console.log('• Expert knowledge from different admins');
console.log('• Quality control through peer review');
console.log('• Accountability and training transparency');

export { demoAdmins, trainingScenarios };