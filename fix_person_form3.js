const fs = require('fs');
let c = fs.readFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', 'utf8');

// Replace the geographic Combos to only show N-1 levels
c = c.replace(/currentLevel >= 1 &&/g, 'currentLevel > 1 &&');
c = c.replace(/currentLevel >= 2 &&/g, 'currentLevel > 2 &&');
c = c.replace(/currentLevel >= 3 &&/g, 'currentLevel > 3 &&');
c = c.replace(/currentLevel >= 4 &&/g, 'currentLevel > 4 &&');

// Fix isTeamEnabled
c = c.replace(
  /const isTeamEnabled = [\s\S]*?\(currentLevel < 4 \|\| formData\.mandal\);/,
  `const isTeamEnabled = 
                      formData.team_type &&
                      (currentLevel <= 1 || formData.state) &&
                      (currentLevel <= 2 || formData.district) &&
                      (currentLevel <= 3 || formData.constituency);`
);

// We should also change the placeholder of the Team dropdown to reflect the expected selection
// If currentLevel == 1, placeholder should be "Select state team..."
// Actually "Select team..." is fine, but maybe we can be smarter.
// Let's leave placeholder as "Select team..."

fs.writeFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', c);
console.log('Success fixing PersonForm N-1 logic!');
