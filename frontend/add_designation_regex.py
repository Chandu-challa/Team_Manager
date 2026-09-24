import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

# The regex will match the <Field id="name" ... /> block
regex = r'(<Field\s+id="name".*?/>)'

designation_field = """<Field
                  id="designation"
                  label="Designation *"
                  icon={Briefcase}
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. President, Secretary"
                  error={errors.designation}
                  valid={Boolean(formData.designation)}
                />"""

new_content = re.sub(regex, r'\1\n                ' + designation_field, content, flags=re.DOTALL)

with open("src/components/PersonForm.jsx", "w") as f:
    f.write(new_content)
print("Regex replacement finished.")
