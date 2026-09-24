with open("src/app/(dashboard)/teams/page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the broken header with a clean one
broken_header = """  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Geography Explorer</h1>
          <p className="text-muted-foreground mt-1 text-sm">Expand districts to view constituencies, mandals, and team coverage.</p>
        </div>
      </div>
      
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
        <Input 
          className="pl-10 h-11 text-base bg-white shadow-sm border-zinc-300 focus-visible:ring-indig?500" 
          placeholder="Search by District, Constituency, or Mandal name..." 
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </div>
      
      
        {user?.role === "ADMIN" && (
          <Button onClick={handleOpenAdd} className="gap-2 bg-indig?600 hover:bg-indig?700">
            <Plus className="h-4 w-4" />
            Add Geography/Team
          </Button>
        )}
      </div>"""

good_header = """  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Geography Explorer</h1>
          <p className="text-muted-foreground mt-1 text-sm">Search or expand districts to view constituencies, mandals, and team coverage.</p>
        </div>
        {user?.role === "ADMIN" && (
          <Button onClick={handleOpenAdd} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Add Geography/Team
          </Button>
        )}
      </div>
      
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
        <Input 
          className="pl-10 h-11 text-base bg-white shadow-sm border-zinc-300 focus-visible:ring-indigo-500" 
          placeholder="Search by District, Constituency, or Mandal name..." 
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </div>"""

import re
# The broken header might have weird characters like `indig?500` instead of `indigo-500` because of powershell encoding.
# Let's just do a regex replace from `return (` to `<div className="max-w-4xl">`
pattern = r'return \(\s*<div className="space-y-6">.*?<div className="max-w-4xl">'
content = re.sub(pattern, good_header + '\n\n      <div className="max-w-4xl">', content, flags=re.DOTALL)

# Let's fix ALL `indig?` to `indigo-` just in case powershell messed it up.
content = content.replace("indig?500", "indigo-500")
content = content.replace("indig?600", "indigo-600")
content = content.replace("indig?700", "indigo-700")
content = content.replace("overflow-y-aut?", "overflow-y-auto")

with open("src/app/(dashboard)/teams/page.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed JSX!")
