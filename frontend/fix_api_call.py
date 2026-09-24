import os

files = [
    "src/app/(dashboard)/teams/page.jsx",
    "src/app/(dashboard)/persons/page.jsx"
]

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = content.replace('api.api.get', 'api.get')
    content = content.replace('api.api.post', 'api.post')
    content = content.replace('api.api.delete', 'api.delete')
    content = content.replace('api.api.patch', 'api.patch')
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("Fixed api calls!")
