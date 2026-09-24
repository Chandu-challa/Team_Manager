import re

file_path = "api/views.py"
with open(file_path, "r") as f:
    content = f.read()

new_method = """
    def create(self, request, *args, **kwargs):
        constituency_id = request.data.get('constituency_id')
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201 and constituency_id:
            mandal_id = response.data.get('id')
            ConstituencyMandalMapping.objects.create(constituency_id=constituency_id, mandal_id=mandal_id)
        return response
"""

# Find MandalMasterViewSet and inject create method
pattern = r'(class MandalMasterViewSet\(viewsets\.ModelViewSet\):.*?)(?=class TeamTypeViewSet)'
match = re.search(pattern, content, flags=re.DOTALL)
if match:
    mandal_class_content = match.group(1)
    if "def create(" not in mandal_class_content:
        new_mandal_class_content = mandal_class_content.rstrip() + "\n" + new_method + "\n\n"
        content = content.replace(mandal_class_content, new_mandal_class_content)
        with open(file_path, "w") as f:
            f.write(content)
        print("Updated MandalMasterViewSet to handle constituency mapping.")
    else:
        print("Already has create method.")
else:
    print("Could not find MandalMasterViewSet")
