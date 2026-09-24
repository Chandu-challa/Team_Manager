import re

with open("api/models.py", "r") as f:
    lines = f.readlines()

new_lines = []
skip_next = False
in_team_class = False

for line in lines:
    if line.startswith('class Team(models.Model):'):
        in_team_class = True
    elif line.startswith('class '):
        in_team_class = False
        
    if "class Meta:" in line and not in_team_class:
        skip_next = True
        continue
    if skip_next and "unique_together" in line:
        skip_next = False
        continue
    skip_next = False
    
    new_lines.append(line)

with open("api/models.py", "w") as f:
    f.writelines(new_lines)
