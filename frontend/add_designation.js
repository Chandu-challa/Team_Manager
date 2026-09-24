const fs = require('fs');
let c = fs.readFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', 'utf8');

// 1. Add designation to formData
c = c.replace(
  /const \[formData, setFormData\] = useState\(\{[\s\S]*?name: "",/,
  `const [formData, setFormData] = useState({
    name: "",
    designation: "",`
);

// 2. Add designation to next state reset
c = c.replace(/next\.name = "";/, 'next.name = ""; next.designation = "";');

// 3. Add to dependencies / set form data from initialData
c = c.replace(/name: initialData\.name \|\| "",/, 'name: initialData.name || "", designation: initialData.designation || "",');

// 4. Add the Field UI element
const fieldReplacement = `                <Field
                  id="name"
                  label="Full Name"
                  icon={User}
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                
                <Field
                  id="designation"
                  label="Designation"
                  icon={Briefcase}
                  placeholder="e.g. Manager"
                  value={formData.designation}
                  onChange={handleChange}
                  error={errors.designation}
                />`;
                
c = c.replace(/<Field\s+id="name"[\s\S]*?required\s+\/>/, fieldReplacement);

// 5. Ensure Briefcase icon is imported
if (!c.includes('Briefcase')) {
  c = c.replace(/import \{([\s\S]*?User,[\s\S]*?)\} from "lucide-react";/, 'import { $1, Briefcase } from "lucide-react";');
}

fs.writeFileSync('D:/Persons/frontend/src/components/PersonForm.jsx', c);
console.log('Successfully injected Designation field into PersonForm.jsx');
