from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import (
    User, TeamType, Team, Person,
    StateMaster, DistrictMaster, ConstituencyMaster, MandalMaster, ConstituencyMandalMapping
)
from .serializers import (
    UserSerializer, UserCreateUpdateSerializer,
    TeamTypeSerializer, TeamSerializer,
    PersonSerializer, DashboardSummarySerializer,
    StateMasterSerializer, DistrictMasterSerializer,
    ConstituencyMasterSerializer, MandalMasterSerializer
)

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class StateMasterViewSet(viewsets.ModelViewSet):
    queryset = StateMaster.objects.all().order_by('name')
    serializer_class = StateMasterSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filterset_fields = ['is_active']

class DistrictMasterViewSet(viewsets.ModelViewSet):
    queryset = DistrictMaster.objects.all().select_related('state').order_by('name')
    serializer_class = DistrictMasterSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filterset_fields = ['state', 'is_active']
    
    def get_queryset(self):
        qs = super().get_queryset()
        state_id = self.request.query_params.get('state_id')
        if state_id:
            qs = qs.filter(state_id=state_id)
        return qs

class ConstituencyMasterViewSet(viewsets.ModelViewSet):
    queryset = ConstituencyMaster.objects.all().select_related('district').order_by('name')
    serializer_class = ConstituencyMasterSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filterset_fields = ['district', 'is_active']

    def get_queryset(self):
        qs = super().get_queryset()
        district_id = self.request.query_params.get('district_id')
        if district_id:
            qs = qs.filter(district_id=district_id)
        return qs

class MandalMasterViewSet(viewsets.ModelViewSet):
    queryset = MandalMaster.objects.all().select_related('district').order_by('name')
    serializer_class = MandalMasterSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filterset_fields = ['district', 'is_active']

    def get_queryset(self):
        qs = super().get_queryset()
        district_id = self.request.query_params.get('district_id')
        constituency_id = self.request.query_params.get('constituency_id')
        
        if district_id:
            qs = qs.filter(district_id=district_id)
        
        if constituency_id:
            # Filter strictly through the delimitation mapping
            mandal_ids = ConstituencyMandalMapping.objects.filter(
                constituency_id=constituency_id
            ).values_list('mandal_id', flat=True)
            qs = qs.filter(id__in=mandal_ids)
            
        return qs

    def create(self, request, *args, **kwargs):
        constituency_id = request.data.get('constituency_id')
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201 and constituency_id:
            mandal_id = response.data.get('id')
            ConstituencyMandalMapping.objects.create(constituency_id=constituency_id, mandal_id=mandal_id)
        return response


class TeamTypeViewSet(viewsets.ModelViewSet):
    queryset = TeamType.objects.all().order_by('level', 'name')
    serializer_class = TeamTypeSerializer
    permission_classes = [IsAdminUserOrReadOnly]

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all().select_related('type', 'state', 'district', 'constituency', 'mandal', 'parent').order_by('type__level', 'name')
    serializer_class = TeamSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filterset_fields = ['type', 'parent', 'state', 'district', 'constituency', 'mandal', 'is_active']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.filter(is_active=True).select_related('team', 'team__type').order_by('-created_at')
    serializer_class = PersonSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['team', 'team__type']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUserOrReadOnly])
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        Person.objects.filter(id__in=ids).update(is_active=False)
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUserOrReadOnly()]
        return super().get_permissions()

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


from django.db.models import Count, Q

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_members = Person.objects.filter(is_active=True).count()
        total_teams = Team.objects.filter(is_active=True).count()
        
        main_teams = Team.objects.filter(is_active=True, type__name__icontains='Main').count()
        youth_teams = Team.objects.filter(is_active=True, type__name__icontains='Youth').count()
        
        districts_total = DistrictMaster.objects.filter(is_active=True).count()
        constituencies_total = ConstituencyMaster.objects.filter(is_active=True).count()
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
        
        # Get missing mandal names
        all_mandals = list(MandalMaster.objects.filter(is_active=True).values('id', 'name', 'district__name'))
        missing_main = [m for m in all_mandals if m['id'] not in main_mandals]
        missing_youth = [m for m in all_mandals if m['id'] not in youth_mandals]
        
        data = {
            'total_members': total_members,
            'total_teams': total_teams,
            'main_teams': main_teams,
            'youth_teams': youth_teams,
            'districts_total': districts_total,
            'constituencies_total': constituencies_total,
            'mandals_total': mandals_total,
            'mandals_main_covered': mandals_main_covered,
            'mandals_youth_covered': mandals_youth_covered,
            'mandals_fully_covered': mandals_fully_covered,
            'missing_main': missing_main,
            'missing_youth': missing_youth,
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
            member_count=Count('team__persons', filter=Q(team__persons__is_active=True, team__is_active=True))
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

