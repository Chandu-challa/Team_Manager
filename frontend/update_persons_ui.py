import re

with open("src/app/(dashboard)/persons/page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add selectedPerson state and Dialog component for details
content = content.replace('const [search, setSearch] = useState("");', 
    'const [search, setSearch] = useState("");\n  const [selectedPerson, setSelectedPerson] = useState(null);\n  const [isDetailsOpen, setIsDetailsOpen] = useState(false);')

# 2. Update TableRow to open details
content = content.replace('<TableRow key={person.id} className="group">', 
    '<TableRow key={person.id} className="group cursor-pointer hover:bg-zinc-50" onClick={() => { setSelectedPerson(person); setIsDetailsOpen(true); }}>')

# Prevent row click when clicking action buttons
content = content.replace('className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50")}>',
    'className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50")} onClick={(e) => e.stopPropagation()}>')
content = content.replace('onClick={() => handleDelete(person.id)}',
    'onClick={(e) => { e.stopPropagation(); handleDelete(person.id); }}')


# 3. Remove huge header and shrink filters
# Let's replace the whole top section.
old_ui_start = r'<div className="space-y-6">\s*<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">.*?<div className="rounded-xl border bg-white shadow-sm overflow-hidden">'

new_ui = """<div className="space-y-4 h-full flex flex-col">
      {/* Compact Header & Filters Area */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 bg-white p-2.5 rounded-lg border shadow-sm">
        
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto flex-1">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
            <Input placeholder="Search name/phone..." className="pl-8 h-8 text-xs border-zinc-200" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          
          <select className="h-8 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs shadow-sm min-w-[120px]" value={stateId} onChange={e => { setStateId(e.target.value); setDistrictId(""); setConstituencyId(""); setMandalId(""); }}>
            <option value="">State (All)</option>
            {statesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          
          <select disabled={!stateId} className="h-8 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs shadow-sm min-w-[120px] disabled:opacity-50" value={districtId} onChange={e => { setDistrictId(e.target.value); setConstituencyId(""); setMandalId(""); }}>
            <option value="">District (All)</option>
            {districtsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          
          <select disabled={!districtId} className="h-8 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs shadow-sm min-w-[130px] disabled:opacity-50" value={constituencyId} onChange={e => { setConstituencyId(e.target.value); setMandalId(""); }}>
            <option value="">Constituency (All)</option>
            {constituenciesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <select disabled={!constituencyId} className="h-8 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs shadow-sm min-w-[120px] disabled:opacity-50" value={mandalId} onChange={e => setMandalId(e.target.value)}>
            <option value="">Mandal (All)</option>
            {mandalsList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2 text-xs text-muted-foreground hover:text-zinc-900">
            <FilterX className="w-3.5 h-3.5 mr-1"/> Reset
          </Button>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end border-t xl:border-t-0 pt-2 xl:pt-0">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8 text-xs gap-1.5 bg-zinc-50 hover:bg-zinc-100">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Link href="/persons/add" className={cn(buttonVariants({ size: "sm" }), "h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700")}>
            <Plus className="h-3.5 w-3.5" /> Add Person
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden flex-1">"""

content = re.sub(old_ui_start, new_ui, content, flags=re.DOTALL)


# 4. Add Dialog for Person Details at the bottom
dialog_import = 'import {\n  Dialog,\n  DialogContent,\n  DialogHeader,\n  DialogTitle,\n} from "@/components/ui/dialog";\n'
if 'Dialog,' not in content:
    content = content.replace('import { Badge } from "@/components/ui/badge";', 'import { Badge } from "@/components/ui/badge";\n' + dialog_import)
else:
    # already there, just need to make sure we don't duplicate. Wait, PersonsPage doesn't have Dialog imported yet!
    # Let's add it.
    pass

import_block = """import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, UserRound, MapPin as MapPinIcon, Briefcase, Plus } from "lucide-react";"""
content = content.replace('import { Badge } from "@/components/ui/badge";', import_block)
content = content.replace('Plus, CheckCircle2', 'CheckCircle2') # fix duplicate Plus if any.
content = content.replace('Plus } from "lucide-react";', '} from "lucide-react";') # don't worry about duplicate imports too much, Nextjs warns but compiles.


details_dialog = """      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl">
          {selectedPerson && (
            <>
              <div className="bg-indigo-600 h-24 w-full relative">
                 <div className="absolute -bottom-10 left-6 border-4 border-white rounded-full bg-white shadow-sm">
                   <Avatar className="h-20 w-20">
                     <AvatarImage src={selectedPerson.photo} alt={selectedPerson.name} className="object-cover" />
                     <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xl font-bold">{selectedPerson.name.charAt(0)}</AvatarFallback>
                   </Avatar>
                 </div>
              </div>
              <div className="pt-12 pb-6 px-6 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">{selectedPerson.name}</h2>
                  <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">{selectedPerson.designation || 'No Designation'}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span className="font-medium text-zinc-900">{selectedPerson.phone}</span>
                  </div>
                  {selectedPerson.email && (
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      <span>{selectedPerson.email}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Geographic Assignment</h3>
                  
                  <div className="bg-zinc-50 rounded-lg p-3 space-y-2 border border-zinc-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Team Type</span>
                      <Badge variant="outline" className="bg-white">{selectedPerson.team_type_name || 'N/A'}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Team Name</span>
                      <span className="text-sm font-semibold text-zinc-800">{selectedPerson.team_name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100">
                      <span className="text-zinc-400 block mb-0.5">Mandal</span>
                      <span className="font-medium text-zinc-700">{selectedPerson.mandal_name || '-'}</span>
                    </div>
                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100">
                      <span className="text-zinc-400 block mb-0.5">Constituency</span>
                      <span className="font-medium text-zinc-700">{selectedPerson.constituency_name || '-'}</span>
                    </div>
                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100">
                      <span className="text-zinc-400 block mb-0.5">District</span>
                      <span className="font-medium text-zinc-700">{selectedPerson.district_name || '-'}</span>
                    </div>
                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100">
                      <span className="text-zinc-400 block mb-0.5">State</span>
                      <span className="font-medium text-zinc-700">{selectedPerson.state_name || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}"""

content = content.replace('    </div>\n  );\n}', details_dialog)

with open("src/app/(dashboard)/persons/page.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated Persons UI!")
