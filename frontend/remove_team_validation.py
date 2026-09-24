import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

content = content.replace('if (!formData.team) newErrors.team = "Team is required.";', "")

with open("src/components/PersonForm.jsx", "w") as f:
    f.write(content)
print("Removed formData.team validation check")
