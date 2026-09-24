import re

with open("api/models.py", "r") as f:
    content = f.read()

# Restore missing class Meta for indexes
content = re.sub(r'(\s+)indexes = \[', r'\1class Meta:\n\1indexes = [', content)

with open("api/models.py", "w") as f:
    f.write(content)
