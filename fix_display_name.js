const fs = require('fs');
let c = fs.readFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', 'utf8');

// The block to replace:
const regex = /setTeams\(\(res \|\| \[\]\)\.filter\(t => t\.is_active !== false\)\.map\(t => \{[\s\S]*?return \{ \.\.\.t, display_name: `\$\{t\.name\}\$\{loc\}`, original_name: t\.name \};\s*\}\)\);/;

if (c.match(regex)) {
  c = c.replace(regex, 'setTeams((res || []).filter(t => t.is_active !== false));');
  fs.writeFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', c);
  console.log('Success removing display_name logic');
} else {
  console.log('Regex failed');
}

// We also need to change the Combo for team to just map name directly
const comboRegex = /options=\{filteredTeams\.map\(t => \(\{ \.\.\.t, name: t\.display_name \|\| t\.name \}\)\)\}/;
if (c.match(comboRegex)) {
  c = c.replace(comboRegex, 'options={filteredTeams}');
  fs.writeFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', c);
  console.log('Success cleaning up Team Combo options');
} else {
  console.log('Regex 2 failed');
}

