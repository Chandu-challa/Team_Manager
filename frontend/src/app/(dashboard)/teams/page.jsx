"use client";

import { useEffect, useState } from "react";
import { dataAPI } from "@/lib/api";
import api from "@/lib/api"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle2, AlertTriangle, Loader2, ChevronRight, ChevronDown, MapPin, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";
import { Badge } from "@/components/ui/badge";

// Sub-components for Hierarchy Explorer
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
        <span className="font-bold text-base text-indig?900">{district.name} District</span>
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
};

export default function TeamMaster() {
  const { user } = useAuth();
  
  // Data lists
  const [teams, setTeams] = useState([]);
  const [teamTypes, setTeamTypes] = useState([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dynamic Hierarchy Form State
  const [hierarchyType, setHierarchyType] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [constituencyId, setConstituencyId] = useState("");
  const [mandalId, setMandalId] = useState("");
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState(null);
  
  // Form geographic data
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [constituenciesList, setConstituenciesList] = useState([]);
  const [mandalsList, setMandalsList] = useState([]);
  const [existingTeamsList, setExistingTeamsList] = useState([]);

  // For explorer
  const [allDistricts, setAllDistricts] = useState([]);
  const [allConstituencies, setAllConstituencies] = useState([]);
  const [allMandals, setAllMandals] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");
  

  const fetchData = async () => {
    try {
      const [tRes, ttRes, sRes] = await Promise.all([
        dataAPI.getTeams(),
        dataAPI.getTeamTypes(),
        dataAPI.getStates()
      ]);
      setTeams(tRes || []);
      setTeamTypes((ttRes || []).filter(t => t.is_active));
      const activeStates = (sRes || []).filter(s => s.is_active);
      setStatesList(activeStates);

      if (activeStates.length > 0) {
        const stateId = activeStates[0].id;
        const dRes = await dataAPI.getDistricts(stateId);
        setAllDistricts(dRes.filter(d => d.is_active));
        
        // Fetch ALL constituencies and mandals for this state for the global search tree
        const cRes = await api.get(`/constituencies/?state=${stateId}&limit=1000`);
        const mRes = await api.get(`/mandals/?state=${stateId}&limit=1000`);
        
        // Sometimes DRF returns paginated results in .data.results
        setAllConstituencies(cRes.data.results || cRes.data || []);
        setAllMandals(mRes.data.results || mRes.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch geographic lists dynamically for modal
  useEffect(() => {
    if (stateId) {
      dataAPI.getDistricts(stateId).then(res => setDistrictsList(res.filter(r => r.is_active)));
    } else {
      setDistrictsList([]);
    }
  }, [stateId]);

  useEffect(() => {
    if (districtId) {
      dataAPI.getConstituencies(districtId).then(res => setConstituenciesList(res.filter(r => r.is_active)));
    } else {
      setConstituenciesList([]);
    }
  }, [districtId]);

  useEffect(() => {
    if (districtId && constituencyId) {
      dataAPI.getMandals(districtId, constituencyId).then(res => setMandalsList(res.filter(r => r.is_active)));
    } else {
      setMandalsList([]);
    }
  }, [districtId, constituencyId]);

  useEffect(() => {
    if (mandalId) {
      api.get(`/teams/?mandal=${mandalId}`).then(res => setExistingTeamsList(res.data)).catch(console.error);
    } else {
      setExistingTeamsList([]);
    }
  }, [mandalId]);

  const handleOpenAdd = () => {
    setHierarchyType("");
    setStateId("");
    setDistrictId("");
    setConstituencyId("");
    setMandalId("");
    setNewName("");
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleHierarchyTypeChange = (e) => {
    const val = e.target.value;
    setHierarchyType(val);
    setStateId("");
    setDistrictId("");
    setConstituencyId("");
    setMandalId("");
    setNewName("");
    setMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    
    try {
      if (hierarchyType === "District") {
        await api.post("/districts/", { name: newName, state: stateId });
        setMsg({ type: "success", text: "District created successfully." });
        const dRes = await dataAPI.getDistricts(stateId);
        setDistrictsList(dRes.filter(r => r.is_active));
        fetchData(); // Refresh explorer
      } 
      else if (hierarchyType === "Constituency") {
        await api.post("/constituencies/", { name: newName, district: districtId });
        setMsg({ type: "success", text: "Constituency created successfully." });
        const cRes = await dataAPI.getConstituencies(districtId);
        setConstituenciesList(cRes.filter(r => r.is_active));
      }
      else if (hierarchyType === "Mandal") {
        await api.post("/mandals/", { name: newName, district: districtId, constituency_id: constituencyId });
        setMsg({ type: "success", text: "Mandal created successfully." });
        const mRes = await dataAPI.getMandals(districtId, constituencyId);
        setMandalsList(mRes.filter(r => r.is_active));
      }
      else if (hierarchyType === "Main Team" || hierarchyType === "Youth Team") {
        const typeObj = teamTypes.find(t => t.name.toLowerCase() === (hierarchyType === "Main Team" ? "mandal main" : "mandal youth"));
        if (!typeObj) throw new Error("Team Type not found in DB.");
        
        await dataAPI.createTeam({
          name: newName,
          type: typeObj.id,
          state: stateId,
          district: districtId,
          constituency: constituencyId,
          mandal: mandalId,
          is_active: true
        });
        setMsg({ type: "success", text: `${hierarchyType} created successfully.` });
        
        fetchData();
        const tRes = await api.get(`/teams/?mandal=${mandalId}`);
        setExistingTeamsList(tRes.data);
      }
      
      setNewName("");
    } catch (error) {
      console.error(error);
      const detail = error.response?.data;
      if (detail && typeof detail === "object") {
        if (detail.non_field_errors) setMsg({ type: "error", text: detail.non_field_errors[0] });
        else setMsg({ type: "error", text: "Already exists or invalid data." });
      } else {
        setMsg({ type: "error", text: "An error occurred." });
      }
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-2.5 rounded-lg border shadow-sm">
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

      <div className="max-w-4xl pt-2">
        {allDistricts.map(district => (
          <DistrictNode key={district.id} district={district} allConstituencies={allConstituencies} allMandals={allMandals} existingTeamsList={teams} searchQuery={globalSearch} />
        ))}
        {allDistricts.length === 0 && (
          <div className="p-8 text-center text-zinc-500 border rounded-lg border-dashed">No districts available in this state yet.</div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-xl uppercase tracking-wider text-indigo-700">
              {hierarchyType ? `ADD ${hierarchyType.toUpperCase()}` : "ADD TO GEOGRAPHY"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Level to Add</label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm shadow-sm font-medium"
                value={hierarchyType}
                onChange={handleHierarchyTypeChange}
              >
                <option value="">Select Level ?</option>
                <option value="District">District</option>
                <option value="Constituency">Constituency</option>
                <option value="Mandal">Mandal</option>
                <option value="Main Team">Main Team</option>
                <option value="Youth Team">Youth Team</option>
              </select>
            </div>

            {hierarchyType && (
              <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">State</label>
                  <select
                    className="flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm"
                    value={stateId}
                    onChange={(e) => { setStateId(e.target.value); setDistrictId(""); setConstituencyId(""); setMandalId(""); }}
                  >
                    <option value="">Select State ?</option>
                    {statesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {(hierarchyType === "Constituency" || hierarchyType === "Mandal" || hierarchyType === "Main Team" || hierarchyType === "Youth Team") && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">District</label>
                    <select
                      disabled={!stateId}
                      className="flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm disabled:opacity-50"
                      value={districtId}
                      onChange={(e) => { setDistrictId(e.target.value); setConstituencyId(""); setMandalId(""); }}
                    >
                      <option value="">Select District ?</option>
                      {districtsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}

                {(hierarchyType === "Mandal" || hierarchyType === "Main Team" || hierarchyType === "Youth Team") && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Constituency</label>
                    <select
                      disabled={!districtId}
                      className="flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm disabled:opacity-50"
                      value={constituencyId}
                      onChange={(e) => { setConstituencyId(e.target.value); setMandalId(""); }}
                    >
                      <option value="">Select Constituency ?</option>
                      {constituenciesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {(hierarchyType === "Main Team" || hierarchyType === "Youth Team") && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Mandal</label>
                    <select
                      disabled={!constituencyId}
                      className="flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm disabled:opacity-50"
                      value={mandalId}
                      onChange={(e) => setMandalId(e.target.value)}
                    >
                      <option value="">Select Mandal ?</option>
                      {mandalsList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                )}

              </div>
            )}

            {hierarchyType === "District" && stateId && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b pb-2 flex w-full">Existing Districts</label>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2 pt-1">
                  {districtsList.map(d => <div key={d.id} className="text-sm flex items-center before:content-['✓'] before:mr-2 before:text-green-600 font-medium">{d.name}</div>)}
                </div>
              </div>
            )}

            {hierarchyType === "Constituency" && districtId && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b pb-2 flex w-full">Existing Constituencies</label>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2 pt-1">
                  {constituenciesList.map(c => <div key={c.id} className="text-sm flex items-center before:content-['✓'] before:mr-2 before:text-green-600 font-medium">{c.name}</div>)}
                </div>
              </div>
            )}

            {hierarchyType === "Mandal" && constituencyId && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b pb-2 flex w-full">Existing Mandals</label>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2 pt-1">
                  {mandalsList.map(m => <div key={m.id} className="text-sm flex items-center before:content-['✓'] before:mr-2 before:text-green-600 font-medium">{m.name}</div>)}
                </div>
              </div>
            )}
            
            {(hierarchyType === "Main Team" || hierarchyType === "Youth Team") && mandalId && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b pb-2 flex w-full">Existing Teams</label>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2 pt-1">
                  {existingTeamsList.map(t => <div key={t.id} className="text-sm flex items-center before:content-['✓'] before:mr-2 before:text-green-600 font-medium">{t.name} <span className="text-xs text-muted-foreground ml-2">({t.type_name})</span></div>)}
                  {existingTeamsList.length === 0 && <span className="text-sm text-zinc-500 italic">No teams exist for this mandal yet.</span>}
                </div>
              </div>
            )}

            {msg && (
              <div className={`p-3 rounded-md flex items-center gap-2 text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                {msg.text}
              </div>
            )}

            {hierarchyType && (
              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-bold">New {hierarchyType} Name</label>
                  <Input 
                    required 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder={`e.g. Orvakal Main Team`}
                    className="h-11 bg-white border-zinc-300 focus-visible:ring-indigo-500"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading || !newName || 
                    (hierarchyType === 'District' && !stateId) ||
                    (hierarchyType === 'Constituency' && !districtId) ||
                    (hierarchyType === 'Mandal' && !constituencyId) ||
                    ((hierarchyType === 'Main Team' || hierarchyType === 'Youth Team') && !mandalId)
                  } 
                  className="w-full h-11 font-bold text-md bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : `CREATE ${hierarchyType.toUpperCase()}`}
                </Button>
              </form>
            )}
            
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
