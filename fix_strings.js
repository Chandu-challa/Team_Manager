const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  // Revert the block completely
  c = c.replace(/const parts = \[\];[\s\S]*?return \{ \.\.\.t, display_name.*? \};/, 
    "const parts = [];\n" +
    "  if (t.state_name) parts.push(t.state_name);\n" +
    "  if (t.district_name) parts.push(t.district_name);\n" +
    "  if (t.constituency_name) parts.push(t.constituency_name);\n" +
    "  if (t.mandal_name) parts.push(t.mandal_name);\n" +
    "  const loc = parts.length > 0 ? ` - ${parts.join(' > ')}` : '';\n" +
    "  return { ...t, display_name: `${t.name}${loc}`" + (file.includes('PersonForm') ? ", original_name: t.name" : "") + " };"
  );
  fs.writeFileSync(file, c);
}

fix('D:/Persons/frontend/src/app/(dashboard)/persons/page.jsx');
fix('D:/Persons/frontend/src/components/PersonForm.jsx');
