import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, State, District, Person

# Create Admin User
if not User.objects.filter(email='admin@example.com').exists():
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpassword',
        full_name='System Admin',
        role='ADMIN'
    )
    print("Admin user created: admin@example.com / adminpassword")

# Create Regular User
if not User.objects.filter(email='user@example.com').exists():
    user = User.objects.create_user(
        username='user',
        email='user@example.com',
        password='userpassword',
        full_name='Regular User',
        role='USER'
    )
    print("Regular user created: user@example.com / userpassword")

# Create States and Districts
states_data = {
    'Andhra Pradesh': ['Nellore', 'Tirupati', 'Chittoor'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
    'Karnataka': ['Bangalore', 'Mysore', 'Mangalore'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
}

for state_name, districts in states_data.items():
    state, created = State.objects.get_or_create(
        state_name=state_name, 
        defaults={'state_code': state_name[:2].upper()}
    )
    if created:
        print(f"Created state: {state_name}")
    
    for idx, district_name in enumerate(districts):
        dist, d_created = District.objects.get_or_create(
            state=state,
            district_name=district_name,
            defaults={'district_code': f"{state.state_code}{idx}"}
        )
        if d_created:
            print(f"Created district: {district_name}")

print("Seed data applied successfully.")
