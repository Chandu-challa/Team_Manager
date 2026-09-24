import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import Team, TeamType, StateMaster, DistrictMaster, ConstituencyMaster, MandalMaster, ConstituencyMandalMapping

# Get the team types
state_type = TeamType.objects.get(level=1)
district_type = TeamType.objects.get(level=2)
const_type = TeamType.objects.get(level=3)
mandal_type = TeamType.objects.get(level=4)

# 1. Sync States
for state in StateMaster.objects.filter(is_active=True):
    Team.objects.get_or_create(
        name=state.name,
        type=state_type,
        state=state,
        defaults={'description': f'{state.name} State Team'}
    )

# 2. Sync Districts
for district in DistrictMaster.objects.filter(is_active=True):
    Team.objects.get_or_create(
        name=district.name,
        type=district_type,
        state=district.state,
        district=district,
        defaults={'description': f'{district.name} District Team'}
    )

# 3. Sync Constituencies
for const in ConstituencyMaster.objects.filter(is_active=True):
    Team.objects.get_or_create(
        name=const.name,
        type=const_type,
        state=const.district.state,
        district=const.district,
        constituency=const,
        defaults={'description': f'{const.name} Constituency Team'}
    )

# 4. Sync Mandals
for mapping in ConstituencyMandalMapping.objects.select_related('constituency', 'mandal', 'constituency__district', 'constituency__district__state').all():
    Team.objects.get_or_create(
        name=mapping.mandal.name,
        type=mandal_type,
        state=mapping.constituency.district.state,
        district=mapping.constituency.district,
        constituency=mapping.constituency,
        mandal=mapping.mandal,
        defaults={'description': f'{mapping.mandal.name} Mandal Team'}
    )

print("Successfully synced all geographic locations to Team records!")
