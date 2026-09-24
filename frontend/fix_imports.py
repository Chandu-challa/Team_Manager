import re

with open("src/app/(dashboard)/persons/page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find all Dialog imports
dialog_import = """import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";"""

# Replace all occurrences with empty string, then add one at the top.
# But wait, there might be slight whitespace variations.
content = re.sub(r'import\s*\{\s*Dialog,\s*DialogContent,\s*DialogHeader,\s*DialogTitle,?\s*\}\s*from\s*["\']@/components/ui/dialog["\'];', '', content)

# Add it after the first import
content = content.replace('import { useEffect', dialog_import + '\nimport { useEffect', 1)

with open("src/app/(dashboard)/persons/page.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed duplicate imports!")
