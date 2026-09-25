import re

files = [
    r"D:\Team_Manager\frontend\src\app\(dashboard)\persons\page.jsx",
    r"D:\Persons\frontend\src\app\(dashboard)\persons\page.jsx"
]

bad_class = 'className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"'
good_class = 'className="flex justify-end gap-2"'

for file in files:
    try:
        with open(file, "r", encoding="utf-8") as f:
            content = f.read()
        
        if bad_class in content:
            content = content.replace(bad_class, good_class)
            with open(file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Fixed in {file}")
    except Exception as e:
        print(f"Error reading {file}: {e}")

