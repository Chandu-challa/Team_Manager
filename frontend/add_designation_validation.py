import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

# Add validation logic
validation_regex = r'(if \(!formData\.name\.trim\(\)\) newErrors\.name = "Name is required\.";\s*else if \(formData\.name\.length < 3\) newErrors\.name = "Name must be at least 3 characters\.";)'

new_validation = r'\1\n\n    if (!formData.designation?.trim()) newErrors.designation = "Designation is required.";'

content = re.sub(validation_regex, new_validation, content)

with open("src/components/PersonForm.jsx", "w") as f:
    f.write(content)
print("Validation added.")
