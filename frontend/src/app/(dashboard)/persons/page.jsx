"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, useCallback } from "react";
import { dataAPI } from "@/lib/api";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Search, Download, Trash2, Edit, FilterX, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { Phone, Mail, UserRound, MapPin as MapPinIcon, Briefcase, } from "lucide-react";



export default function PersonsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [persons, setPersons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Cascading Filters
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [constituenciesList, setConstituenciesList] = useState([]);
  const [mandalsList, setMandalsList] = useState([]);
  
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [constituencyId, setConstituencyId] = useState("");
  const [mandalId, setMandalId] = useState("");

  useEffect(() => {
    dataAPI.getStates().then(s => setStatesList(s.filter(x => x.is_active)));
  }, []);

  useEffect(() => {
    if (stateId) dataAPI.getDistricts(stateId).then(d => setDistrictsList(d.filter(x => x.is_active)));
    else setDistrictsList([]);
  }, [stateId]);

  useEffect(() => {
    if (districtId) dataAPI.getConstituencies(districtId).then(c => setConstituenciesList(c.filter(x => x.is_active)));
    else setConstituenciesList([]);
  }, [districtId]);

  useEffect(() => {
    if (districtId && constituencyId) dataAPI.getMandals(districtId, constituencyId).then(m => setMandalsList(m.filter(x => x.is_active)));
    else setMandalsList([]);
  }, [districtId, constituencyId]);

  const fetchPersons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (search) params.append("search", search);
      
      const response = await api.get(`/persons/?${params.toString()}`);
      
      let results = response.data.results || response.data;
      if (mandalId) results = results.filter(p => String(p.mandal) === String(mandalId));
      else if (constituencyId) results = results.filter(p => String(p.constituency) === String(constituencyId));
      else if (districtId) results = results.filter(p => String(p.district) === String(districtId));
      else if (stateId) results = results.filter(p => String(p.state) === String(stateId));
      
      setPersons(results);
      setTotal(response.data.count || results.length);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch persons");
    } finally {
      setLoading(false);
    }
  }, [page, search, stateId, districtId, constituencyId, mandalId]);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  const handleExportCSV = () => {
    if (persons.length === 0) return toast.error("No data to export");
    const headers = ["ID", "Name", "Designation", "Phone", "Email", "State", "District", "Constituency", "Mandal", "Team Type"];
    const csvContent = [
      headers.join(","),
      ...persons.map(p => [
        p.id, `"${p.name}"`, `"${p.designation}"`, p.phone, p.email,
        p.state, p.district, p.constituency, p.mandal, `"${p.team_type_name}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Persons_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this person?")) return;
    try {
      await api.delete(`/persons/${id}/`);
      toast.success("Person deleted successfully");
      fetchPersons();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete person");
    }
  };

  const handleReset = () => {
    setSearch("");
    setStateId("");
    setDistrictId("");
    setConstituencyId("");
    setMandalId("");
    setPage(1);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
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

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/80">
              <TableRow>
                <TableHead className="w-[280px]">Person</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="min-w-[300px]">Geographic Assignment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="flex items-center space-x-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-3 w-[100px]" /></div></div></TableCell>
                    <TableCell><div className="space-y-2"><Skeleton className="h-4 w-[120px]" /><Skeleton className="h-3 w-[140px]" /></div></TableCell>
                    <TableCell><Skeleton className="h-8 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : persons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No persons found matching the selected geographic hierarchy.
                  </TableCell>
                </TableRow>
              ) : (
                persons.map((person) => (
                  <TableRow key={person.id} className="group cursor-pointer hover:bg-zinc-50" onClick={() => { setSelectedPerson(person); setIsDetailsOpen(true); }}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border shadow-sm">
                          <AvatarImage src={person.photo} alt={person.name} className="object-cover" />
                          <AvatarFallback className="bg-indigo-50 text-indigo-700 font-semibold">{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-zinc-900">{person.name}</div>
                          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{person.designation || 'No Designation'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-zinc-700">{person.phone}</div>
                      <div className="text-xs text-zinc-500">{person.email || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit bg-indigo-50 text-indigo-700 border-indigo-200">
                          {person.team_type_name || 'Unassigned'}
                        </Badge>
                        <div className="text-xs text-zinc-500 font-medium">
                          {person.team_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/persons/${person.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50")} onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4" />
                        </Link>
                        {user?.role === "ADMIN" && (
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(person.id); }} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
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
}
