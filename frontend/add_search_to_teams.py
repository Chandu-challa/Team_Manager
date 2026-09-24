import re

with open("src/app/(dashboard)/teams/page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the lazy loading with global props and search logic

new_components = """// Sub-components for Hierarchy Explorer
const MandalNode = ({ mandal, existingTeamsList, searchQuery }) => {
  const teams = existingTeamsList.filter(t => t.mandal_id === mandal.id);
  const hasMain = teams.some(t => t.type_name.toLowerCase().includes("main"));
  const hasYouth = teams.some(t => t.type_name.toLowerCase().includes("youth"));

  // Check search query
  const matchesSearch = !searchQuery || mandal.name.toLowerCase().includes(searchQuery.toLowerCase());
  if (!matchesSearch) return null; // Hide if doesn't match and there's a query

  return (
    <div className="pl-6 py-2 border-l border-zinc-200 ml-3 mt-1 flex items-center justify-between hover:bg-zinc-50 transition-colors rounded-r-md">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
        {mandal.name} Mandal
      </div>
      <div className="flex gap-2 pr-2">
        <Badge variant="outline" className={hasMain ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
          {hasMain ? "? Main Team" : "? Main Team"}
        </Badge>
        <Badge variant="outline" className={hasYouth ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
          {hasYouth ? "? Youth Team" : "? Youth Team"}
        </Badge>
      </div>
    </div>
  );
};

const ConstituencyNode = ({ constituency, allMandals, existingTeamsList, searchQuery, forceOpen }) => {
  const [userOpen, setUserOpen] = useState(false);
  const mandals = allMandals.filter(m => m.constituency === constituency.id);
  
  // A constituency matches if its name matches, OR if any of its mandals match
  const selfMatches = !searchQuery || constituency.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchingMandals = mandals.filter(m => m.name.toLowerCase().includes(searchQuery?.toLowerCase() || ''));
  
  const matchesSearch = !searchQuery || selfMatches || matchingMandals.length > 0;
  
  if (!matchesSearch) return null;

  const isOpen = (searchQuery && matchingMandals.length > 0) || userOpen || forceOpen;

  return (
    <div className="pl-6 mt-2">
      <div 
        onClick={() => setUserOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-zinc-50 rounded-md cursor-pointer border border-transparent hover:border-zinc-200 transition-colors"
      >
        {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
        <span className="font-semibold text-sm text-zinc-800">{constituency.name} Constituency</span>
      </div>
      {isOpen && (
        <div className="mt-1">
          {mandals.map(m => <MandalNode key={m.id} mandal={m} existingTeamsList={existingTeamsList} searchQuery={selfMatches ? "" : searchQuery} />)}
          {mandals.length === 0 && <div className="pl-8 text-xs text-zinc-400 py-1">No mandals found.</div>}
        </div>
      )}
    </div>
  );
};

const DistrictNode = ({ district, allConstituencies, allMandals, existingTeamsList, searchQuery }) => {
  const [userOpen, setUserOpen] = useState(false);
  const constituencies = allConstituencies.filter(c => c.district === district.id);
  
  const selfMatches = !searchQuery || district.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchingConstituencies = constituencies.filter(c => c.name.toLowerCase().includes(searchQuery?.toLowerCase() || ''));
  const districtMandals = allMandals.filter(m => m.district === district.id);
  const matchingMandals = districtMandals.filter(m => m.name.toLowerCase().includes(searchQuery?.toLowerCase() || ''));
  
  const matchesSearch = !searchQuery || selfMatches || matchingConstituencies.length > 0 || matchingMandals.length > 0;
  
  if (!matchesSearch) return null;

  const isOpen = (searchQuery && (matchingConstituencies.length > 0 || matchingMandals.length > 0)) || userOpen;

  return (
    <div className="border rounded-lg mb-3 bg-white shadow-sm overflow-hidden">
      <div 
        onClick={() => setUserOpen(!isOpen)}
        className="flex items-center gap-2 p-3 bg-zinc-50 hover:bg-zinc-100 cursor-pointer border-b border-transparent transition-colors"
      >
        {isOpen ? <ChevronDown className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-5 h-5 text-zinc-400" />}
        <span className="font-bold text-base text-indigo-900">{district.name} District</span>
      </div>
      {isOpen && (
        <div className="p-2 pb-4 bg-white">
          {constituencies.map(c => (
            <ConstituencyNode 
              key={c.id} 
              constituency={c} 
              allMandals={allMandals} 
              existingTeamsList={existingTeamsList} 
              searchQuery={selfMatches ? "" : searchQuery}
              forceOpen={selfMatches && searchQuery ? true : false}
            />
          ))}
          {constituencies.length === 0 && <div className="pl-8 text-sm text-zinc-400 py-2">No constituencies found.</div>}
        </div>
      )}
    </div>
  );
};"""

old_components_pattern = r'// Sub-components for Hierarchy Explorer.*?export default function TeamMaster'
content = re.sub(old_components_pattern, new_components + '\n\nexport default function TeamMaster', content, flags=re.DOTALL)

# Add search state to TeamMaster
add_search_pattern = r'(// For explorer\n  const \[allDistricts, setAllDistricts\] = useState\(\[\]\);)'
content = re.sub(add_search_pattern, r'\1\n  const [allConstituencies, setAllConstituencies] = useState([]);\n  const [allMandals, setAllMandals] = useState([]);\n  const [globalSearch, setGlobalSearch] = useState("");\n  import { Search } from "lucide-react";', content)

# But wait, import { Search } from "lucide-react" might fail if it's already there or in wrong place.
# Actually I'll just append it to the lucide-react import at top.
content = content.replace('Plus, CheckCircle2, AlertTriangle, Loader2, ChevronRight, ChevronDown, MapPin', 'Plus, CheckCircle2, AlertTriangle, Loader2, ChevronRight, ChevronDown, MapPin, Search')
content = content.replace('import { Search } from "lucide-react";', '') # remove if accidentally added

# Update fetchData to fetch all constituencies and mandals
old_fetch_data = r'''      if \(activeStates\.length > 0\) \{
        const dRes = await dataAPI\.getDistricts\(activeStates\[0\]\.id\);
        setAllDistricts\(dRes\.filter\(d => d\.is_active\)\);
      \}'''

new_fetch_data = """      if (activeStates.length > 0) {
        const stateId = activeStates[0].id;
        const dRes = await dataAPI.getDistricts(stateId);
        setAllDistricts(dRes.filter(d => d.is_active));
        
        // Fetch ALL constituencies and mandals for this state for the global search tree
        const cRes = await api.api.get(`/constituencies/?state=${stateId}&limit=1000`);
        const mRes = await api.api.get(`/mandals/?state=${stateId}&limit=1000`);
        
        // Sometimes DRF returns paginated results in .data.results
        setAllConstituencies(cRes.data.results || cRes.data || []);
        setAllMandals(mRes.data.results || mRes.data || []);
      }"""
content = re.sub(old_fetch_data, new_fetch_data, content)

# Add search input UI
old_header = r'(<h1 className="text-3xl font-bold tracking-tight">Master Geography Explorer</h1>\n          <p className="text-muted-foreground mt-1 text-sm">Expand districts to view constituencies, mandals, and team coverage.</p>\n        </div>)'
new_header = r"""\1
      </div>
      
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
        <Input 
          className="pl-10 h-11 text-base bg-white shadow-sm border-zinc-300 focus-visible:ring-indigo-500" 
          placeholder="Search by District, Constituency, or Mandal name..." 
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </div>
      
      <div className="flex justify-between items-center hidden">"""
content = re.sub(old_header, new_header, content)
content = content.replace('<div className="flex justify-between items-center hidden">', '') # just a trick to close it if we modified the layout
# Wait, let's do this cleaner.

# Let's replace the whole header block.
old_full_header = r'<div className="flex justify-between items-center">\n        <div>\n          <h1 className="text-3xl font-bold tracking-tight">Master Geography Explorer</h1>\n          <p className="text-muted-foreground mt-1 text-sm">Expand districts to view constituencies, mandals, and team coverage.</p>\n        </div>\n        \{user\?\.role === "ADMIN" && \(\n          <Button onClick=\{handleOpenAdd\} className="gap-2 bg-indigo-600 hover:bg-indigo-700">\n            <Plus className="h-4 w-4" />\n            Add Geography/Team\n          </Button>\n        \)\}\n      </div>'

new_full_header = """<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Geography Explorer</h1>
          <p className="text-muted-foreground mt-1 text-sm">Search or expand districts to view team coverage.</p>
        </div>
        {user?.role === "ADMIN" && (
          <Button onClick={handleOpenAdd} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Add Geography/Team
          </Button>
        )}
      </div>
      
      <div className="relative max-w-full">
        <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
        <Input 
          className="pl-10 h-11 text-base bg-white shadow-sm border-zinc-300 focus-visible:ring-indigo-500" 
          placeholder="Search for a District, Constituency, or Mandal..." 
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </div>"""
content = re.sub(old_full_header, new_full_header, content)

# Update the rendering of DistrictNode
old_district_render = r'<DistrictNode key=\{district\.id\} district=\{district\} existingTeamsList=\{teams\} />'
new_district_render = '<DistrictNode key={district.id} district={district} allConstituencies={allConstituencies} allMandals={allMandals} existingTeamsList={teams} searchQuery={globalSearch} />'
content = content.replace(old_district_render, new_district_render)

# Remove the weird unicode chars added by copy paste earlier if any
content = content.replace('o"', '?').replace('o-', '?')

with open("src/app/(dashboard)/teams/page.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Search added successfully!")
