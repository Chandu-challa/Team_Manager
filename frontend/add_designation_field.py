import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

name_field = """                <Field
                  id="name"
                  label="Full Name"
                  icon={User}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  valid={isNameValid}
                  placeholder="e.g. John Doe"
                  autoComplete="name"
                />"""

designation_field = """                <Field
                  id="name"
                  label="Full Name"
                  icon={User}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  valid={isNameValid}
                  placeholder="e.g. John Doe"
                  autoComplete="name"
                />
                <Field
                  id="designation"
                  label="Designation"
                  icon={Briefcase}
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. President, Secretary"
                />"""

content = content.replace(name_field, designation_field)

with open("src/components/PersonForm.jsx", "w") as f:
    f.write(content)
print("Added designation field to PersonForm")
