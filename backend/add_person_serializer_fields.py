import re

with open("api/serializers.py", "r") as f:
    content = f.read()

person_serializer_regex = r"(class PersonSerializer\(serializers\.ModelSerializer\):\n    team_name = serializers\.CharField\(source='team\.name', read_only=True\)\n    team_type_name = serializers\.CharField\(source='team\.type\.name', read_only=True\))"

new_fields = r"""\1
    team_type = serializers.IntegerField(source='team.type.id', read_only=True)
    state = serializers.IntegerField(source='team.state.id', read_only=True)
    district = serializers.IntegerField(source='team.district.id', read_only=True)
    constituency = serializers.IntegerField(source='team.constituency.id', read_only=True)
    mandal = serializers.IntegerField(source='team.mandal.id', read_only=True)"""

content = re.sub(person_serializer_regex, new_fields, content)

with open("api/serializers.py", "w") as f:
    f.write(content)
print("Updated PersonSerializer")
