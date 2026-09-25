with open(r"D:\Team_Manager\frontend\src\app\(dashboard)\page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("api.api.get", "api.get")

with open(r"D:\Team_Manager\frontend\src\app\(dashboard)\page.jsx", "w", encoding="utf-8") as f:
    f.write(content)
