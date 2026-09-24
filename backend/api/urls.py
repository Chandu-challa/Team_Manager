from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    TeamTypeViewSet, TeamViewSet, PersonViewSet, UserViewSet, 
    AuthViewSet, DashboardViewSet, StateMasterViewSet, DistrictMasterViewSet, 
    ConstituencyMasterViewSet, MandalMasterViewSet
)

router = DefaultRouter()
router.register(r'states', StateMasterViewSet, basename='state')
router.register(r'districts', DistrictMasterViewSet, basename='district')
router.register(r'constituencies', ConstituencyMasterViewSet, basename='constituency')
router.register(r'mandals', MandalMasterViewSet, basename='mandal')
router.register(r'team-types', TeamTypeViewSet, basename='teamtype')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'persons', PersonViewSet, basename='person')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', AuthViewSet.as_view({'get': 'me'}), name='auth_me'),
    path('dashboard/summary/', DashboardViewSet.as_view({'get': 'summary'}), name='dashboard_summary'),
    path('dashboard/team-strength/', DashboardViewSet.as_view({'get': 'team_strength'}), name='dashboard_team_strength'),
    path('dashboard/coverage/', DashboardViewSet.as_view({'get': 'coverage'}), name='dashboard_coverage'),
    path('dashboard/recent-activity/', DashboardViewSet.as_view({'get': 'recent_activity'}), name='dashboard_recent_activity'),
    path('', include(router.urls)),
]
