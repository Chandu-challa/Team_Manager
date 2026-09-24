with open("src/lib/api.js", "r", encoding="utf-8") as f:
    content = f.read()

# We need to strip the URL truncation logic so absolute URLs from Django are preserved.
bad_logic_1 = """    if (response.data?.results) {
      response.data.results.forEach(p => {
        if (p.photo && typeof p.photo === 'string' && p.photo.startsWith('http')) {
          try { p.photo = new URL(p.photo).pathname; } catch (e) {}
        }
      });
    }"""
content = content.replace(bad_logic_1, "")

bad_logic_2 = """    if (p && p.photo && typeof p.photo === 'string' && p.photo.startsWith('http')) {
      try { p.photo = new URL(p.photo).pathname; } catch (e) {}
    }"""
content = content.replace(bad_logic_2, "")

with open("src/lib/api.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed photo URL logic!")
