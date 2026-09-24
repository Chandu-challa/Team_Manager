const fs = require('fs');
let c = fs.readFileSync('D:/Persons/frontend/src/app/(dashboard)/persons/page.jsx', 'utf8');

c = c.replace(
  /<TableHead>[\s\S]*?\{renderSortHeader\("name", "Name"\)\}[\s\S]*?<\/TableHead>/,
  `$&
                <TableHead>Designation</TableHead>`
);

c = c.replace(
  /<TableCell className="font-medium">[\s\S]*?\{person\.name\}[\s\S]*?<\/TableCell>/,
  `$&
                  <TableCell>{person.designation || "-"}</TableCell>`
);

fs.writeFileSync('D:/Persons/frontend/src/app/(dashboard)/persons/page.jsx', c);
console.log('Successfully injected Designation column into persons/page.jsx');
