import re

file_path = "api/views.py"
with open(file_path, "r") as f:
    content = f.read()

new_logic = """
        mandals_fully_covered = len(main_mandals.intersection(youth_mandals))
        
        # Get missing mandal names
        all_mandals = list(MandalMaster.objects.filter(is_active=True).values('id', 'name', 'district__name'))
        missing_main = [m for m in all_mandals if m['id'] not in main_mandals][:50]
        missing_youth = [m for m in all_mandals if m['id'] not in youth_mandals][:50]
        
        data = {
            'total_members': total_members,
            'total_teams': total_teams,
            'main_teams': main_teams,
            'youth_teams': youth_teams,
            'mandals_total': mandals_total,
            'mandals_main_covered': mandals_main_covered,
            'mandals_youth_covered': mandals_youth_covered,
            'mandals_fully_covered': mandals_fully_covered,
            'missing_main': missing_main,
            'missing_youth': missing_youth,
        }
"""

content = re.sub(
    r'        mandals_fully_covered = len\(main_mandals\.intersection\(youth_mandals\)\).*?\'mandals_fully_covered\': mandals_fully_covered,[\s\r\n]*\}',
    new_logic,
    content,
    flags=re.DOTALL
)

with open(file_path, "w") as f:
    f.write(content)
print("Updated dashboard API with missing mandals list")
