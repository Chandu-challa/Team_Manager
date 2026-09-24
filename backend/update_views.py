import os
import re

file_path = "api/views.py"

with open(file_path, "r") as f:
    content = f.read()

new_viewset = """
from django.db.models import Count, Q

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_members = Person.objects.filter(is_active=True).count()
        total_teams = Team.objects.filter(is_active=True).count()
        districts_total = DistrictMaster.objects.filter(is_active=True).count()
        mandals_total = MandalMaster.objects.filter(is_active=True).count()
        
        # Districts covered: distinct district_ids from active teams of type district (level=2)
        districts_covered = Team.objects.filter(
            is_active=True, type__level=2, district__isnull=False
        ).values('district').distinct().count()
        
        # Mandals covered: distinct mandal_ids from active teams of type mandal (level=4)
        mandals_covered = Team.objects.filter(
            is_active=True, type__level=4, mandal__isnull=False
        ).values('mandal').distinct().count()
        
        members_without_team = Person.objects.filter(is_active=True, team__isnull=True).count()
        
        teams = Team.objects.filter(is_active=True).annotate(
            member_count=Count('persons', filter=Q(persons__is_active=True))
        )
        teams_meeting_minimum = sum(1 for t in teams if t.member_count >= 20)
        understaffed_teams = sum(1 for t in teams if t.member_count < 20)
        
        data = {
            'total_members': total_members,
            'total_teams': total_teams,
            'districts_total': districts_total,
            'districts_covered': districts_covered,
            'mandals_total': mandals_total,
            'mandals_covered': mandals_covered,
            'teams_meeting_minimum': teams_meeting_minimum,
            'understaffed_teams': understaffed_teams,
            'members_without_team': members_without_team,
        }
        return Response(data)

    @action(detail=False, methods=['get'], url_path='team-strength')
    def team_strength(self, request):
        teams = Team.objects.filter(is_active=True).annotate(
            member_count=Count('persons', filter=Q(persons__is_active=True))
        )
        
        strength_30_plus = sum(1 for t in teams if t.member_count >= 30)
        strength_20_29 = sum(1 for t in teams if 20 <= t.member_count < 30)
        strength_10_19 = sum(1 for t in teams if 10 <= t.member_count < 20)
        strength_1_9 = sum(1 for t in teams if 1 <= t.member_count < 10)
        strength_0 = sum(1 for t in teams if t.member_count == 0)
        
        data = {
            '30+ Members': strength_30_plus,
            '20-29 Members': strength_20_29,
            '10-19 Members': strength_10_19,
            '1-9 Members': strength_1_9,
            '0 Members': strength_0,
        }
        return Response(data)

    @action(detail=False, methods=['get'])
    def coverage(self, request):
        # Members by district
        # We find members by their team's district.
        districts = DistrictMaster.objects.filter(is_active=True).annotate(
            member_count=Count('teams__persons', filter=Q(teams__persons__is_active=True, teams__is_active=True))
        ).order_by('-member_count')
        
        members_by_district = [{'name': d.name, 'members': d.member_count} for d in districts if d.member_count > 0]
        
        # Team distribution
        team_distribution = {
            'State Teams': Team.objects.filter(is_active=True, type__level=1).count(),
            'District Teams': Team.objects.filter(is_active=True, type__level=2).count(),
            'Constituency Teams': Team.objects.filter(is_active=True, type__level=3).count(),
            'Mandal Teams': Team.objects.filter(is_active=True, type__level=4).count(),
        }
        
        return Response({
            'members_by_district': members_by_district,
            'team_distribution': team_distribution
        })

    @action(detail=False, methods=['get'], url_path='recent-activity')
    def recent_activity(self, request):
        recent_persons = Person.objects.filter(is_active=True).select_related('team').order_by('-created_at')[:5]
        recent_teams = Team.objects.filter(is_active=True).order_by('-created_at')[:5]
        
        activity = []
        for p in recent_persons:
            activity.append({
                'type': 'person',
                'title': 'New person registered',
                'description': p.full_name,
                'team': p.team.name if p.team else 'Unassigned',
                'date': p.created_at
            })
            
        for t in recent_teams:
            activity.append({
                'type': 'team',
                'title': 'New team created',
                'description': t.name,
                'team': '',
                'date': t.created_at
            })
            
        activity.sort(key=lambda x: x['date'], reverse=True)
        return Response(activity[:10])
"""

# Replace the old DashboardViewSet
content = re.sub(r'class DashboardViewSet\(viewsets\.ViewSet\):[\s\S]*?(?=$)', new_viewset, content)

with open(file_path, "w") as f:
    f.write(content)
print("Updated views.py")
