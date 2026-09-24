with open("api/models.py", "r") as f:
    content = f.read()

content = content.replace("        indexes = [", "    class Meta:\n        indexes = [")
content = content.replace("        constraints = [models.UniqueConstraint", "    class Meta:\n        constraints = [models.UniqueConstraint")

with open("api/models.py", "w") as f:
    f.write(content)
