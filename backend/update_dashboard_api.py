import os
import re

file_path = "api/views.py"

with open(file_path, "r") as f:
    content = f.read()

new_summary = """
    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_members = Person.objects.filter(is_active=True).count()
        total_teams = Team.objects.filter(is_active=True).count()
        
        main_teams = Team.objects.filter(is_active=True, type__name__icontains='Main').count()
        youth_teams = Team.objects.filter(is_active=True, type__name__icontains='Youth').count()
        
        mandals_total = MandalMaster.objects.filter(is_active=True).count()
        
        # Mandals covered by Main teams
        mandals_main_covered = Team.objects.filter(
            is_active=True, type__name__icontains='Main', mandal__isnull=False
        ).values('mandal').distinct().count()
        
        # Mandals covered by Youth teams
        mandals_youth_covered = Team.objects.filter(
            is_active=True, type__name__icontains='Youth', mandal__isnull=False
        ).values('mandal').distinct().count()
        
        # Fully covered mandals (have both Main and Youth)
        main_mandals = set(Team.objects.filter(is_active=True, type__name__icontains='Main', mandal__isnull=False).values_list('mandal', flat=True))
        youth_mandals = set(Team.objects.filter(is_active=True, type__name__icontains='Youth', mandal__isnull=False).values_list('mandal', flat=True))
        mandals_fully_covered = len(main_mandals.intersection(youth_mandals))
        
        data = {
            'total_members': total_members,
            'total_teams': total_teams,
            'main_teams': main_teams,
            'youth_teams': youth_teams,
            'mandals_total': mandals_total,
            'mandals_main_covered': mandals_main_covered,
            'mandals_youth_covered': mandals_youth_covered,
            'mandals_fully_covered': mandals_fully_covered,
        }
        return Response(data)
"""

# Replace the specific summary method inside DashboardViewSet
content = re.sub(r'    @action\(detail=False, methods=\[\'get\'\]\)\s+def summary\(self, request\):.*?return Response\(data\)', new_summary.strip('\n'), content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)
print("Updated dashboard summary API")
