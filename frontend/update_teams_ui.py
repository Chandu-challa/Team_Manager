import re

with open("src/app/(dashboard)/teams/page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the giant header with a compact one
old_header = r'<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">.*?<div className="max-w-4xl">'

new_header = """<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-2.5 rounded-lg border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2 h-4 w-4 text-zinc-400" />
          <Input 
            className="pl-9 h-8 text-sm bg-zinc-50/50 border-zinc-200 focus-visible:ring-indigo-500" 
            placeholder="Search District, Constituency, or Mandal..." 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
        
        {user?.role === "ADMIN" && (
          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
            <Plus className="h-3.5 w-3.5" />
            Add Entity
          </Button>
        )}
      </div>

      <div className="max-w-4xl pt-2">"""

content = re.sub(old_header, new_header, content, flags=re.DOTALL)

with open("src/app/(dashboard)/teams/page.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated Teams UI!")
