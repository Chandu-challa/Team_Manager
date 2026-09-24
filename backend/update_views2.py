import os
import re

file_path = "api/views.py"

with open(file_path, "r") as f:
    content = f.read()

# Replace the specific lines inside DashboardViewSet.summary
content = content.replace("teams_meeting_minimum = sum(1 for t in teams if t.member_count >= 30)", "teams_with_members = sum(1 for t in teams if t.member_count > 0)")
content = content.replace("understaffed_teams = sum(1 for t in teams if t.member_count < 20)", "empty_teams = sum(1 for t in teams if t.member_count == 0)")
content = content.replace("'teams_meeting_minimum': teams_meeting_minimum,", "'teams_with_members': teams_with_members,")
content = content.replace("'understaffed_teams': understaffed_teams,", "'empty_teams': empty_teams,")

with open(file_path, "w") as f:
    f.write(content)
print("Updated views.py for backend metrics")
