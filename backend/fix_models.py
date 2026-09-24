import re

with open("api/models.py", "r") as f:
    content = f.read()

# Fix the broken line
content = content.replace("unique_together = [[\\'mandal\\', \\'type\\']]", "unique_together = [['mandal', 'type']]")
content = content.replace("def __str__def __str__(self):", "def __str__(self):")

with open("api/models.py", "w") as f:
    f.write(content)
