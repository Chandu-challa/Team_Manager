import re

with open("backend/api/serializers.py", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r"class PersonSerializer\(serializers\.ModelSerializer\):(.*?)class Meta:"
replacement = """class PersonSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    team_type_name = serializers.CharField(source='team.type.name', read_only=True)
    team_type = serializers.IntegerField(source='team.type.id', read_only=True)
    state = serializers.IntegerField(source='team.state.id', read_only=True)
    district = serializers.IntegerField(source='team.district.id', read_only=True)
    constituency = serializers.IntegerField(source='team.constituency.id', read_only=True)
    mandal = serializers.IntegerField(source='team.mandal.id', read_only=True)
    
    state_name = serializers.CharField(source='team.state.name', read_only=True)
    district_name = serializers.CharField(source='team.district.name', read_only=True)
    constituency_name = serializers.CharField(source='team.constituency.name', read_only=True)
    mandal_name = serializers.CharField(source='team.mandal.name', read_only=True)

    class Meta:"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("backend/api/serializers.py", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated PersonSerializer!")
