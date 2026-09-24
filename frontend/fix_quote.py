with open("src/app/(dashboard)/teams/page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('overflow-y-auto>', 'overflow-y-auto">')

with open("src/app/(dashboard)/teams/page.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed quote!")
