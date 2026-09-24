import re

with open("api/models.py", "r") as f:
    content = f.read()

# Restore missing class Meta
content = re.sub(r'(\s+)constraints = \[models\.UniqueConstraint', r'\1class Meta:\n\1constraints = [models.UniqueConstraint', content)

with open("api/models.py", "w") as f:
    f.write(content)
