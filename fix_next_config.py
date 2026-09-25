import re

with open(r"D:\Team_Manager\frontend\next.config.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Next.js 15+ doesn't allow 'eslint' inside next.config.ts, so Vercel might be rejecting the build.
content = re.sub(r'\s*eslint:\s*\{\s*ignoreDuringBuilds:\s*true,\s*\},', '', content)

with open(r"D:\Team_Manager\frontend\next.config.ts", "w", encoding="utf-8") as f:
    f.write(content)
