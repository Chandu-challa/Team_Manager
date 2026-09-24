with open("src/app/(dashboard)/persons/page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'import { Search, Download, Trash2, Edit, FilterX, MapPin } from "lucide-react";',
    'import { Search, Download, Trash2, Edit, FilterX, MapPin, Plus } from "lucide-react";'
)

with open("src/app/(dashboard)/persons/page.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added Plus icon!")
