import re

with open("src/components/PersonForm.jsx", "r") as f:
    content = f.read()

content = content.replace("{currentLevel > 1 && (", "{currentLevel >= 1 && (")
content = content.replace("{currentLevel > 2 && (", "{currentLevel >= 2 && (")
content = content.replace("{currentLevel > 3 && (", "{currentLevel >= 3 && (")
content = content.replace("{currentLevel > 4 && (", "{currentLevel >= 4 && (")

with open("src/components/PersonForm.jsx", "w") as f:
    f.write(content)
print("Combobox logic fixed.")
