"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Map, Loader2, CheckCircle2 } from "lucide-react";

export default function GeographyMaster() {
  const [level, setLevel] = useState("district");
  
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  
  const [bulkNames, setBulkNames] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  useEffect(() => {
    api.api.get("/states/").then(res => setStates(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedState) {
      api.api.get(`/districts/?state_id=${selectedState}`).then(res => setDistricts(res.data)).catch(console.error);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      api.api.get(`/constituencies/?district_id=${selectedDistrict}`).then(res => setConstituencies(res.data)).catch(console.error);
    }
  }, [selectedDistrict]);

  const handleLevelChange = (val) => {
    setLevel(val);
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedConstituency("");
    setBulkNames("");
    setSuccessMsg("");
  };

  const handleSubmit = async () => {
    if (!bulkNames.trim()) return;
    
    const names = bulkNames.split("\n").map(n => n.trim()).filter(n => n);
    if (names.length === 0) return;

    setLoading(true);
    setSuccessMsg("");
    let successCount = 0;

    try {
      for (const name of names) {
        if (level === "district") {
          if (!selectedState) continue;
          await api.api.post("/districts/", { name, state: selectedState });
        } else if (level === "constituency") {
          if (!selectedDistrict) continue;
          await api.api.post("/constituencies/", { name, district: selectedDistrict });
        } else if (level === "mandal") {
          if (!selectedConstituency || !selectedDistrict) continue;
          // Note: our Mandal creation might just need district, but mapping requires constituency.
          const res = await api.api.post("/mandals/", { name, district: selectedDistrict, constituency_id: selectedConstituency });
          // If you want to automatically link to constituency via ConstituencyMandalMapping, 
          // you'd do it here if there's an API for it, or just rely on the API doing it.
        }
        successCount++;
      }
      setSuccessMsg(`Successfully created ${successCount} ${level}(s)!`);
      setBulkNames("");
    } catch (err) {
      console.error(err);
      alert("An error occurred. Make sure the names are unique.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!bulkNames.trim()) return false;
    if (level === "district" && !selectedState) return false;
    if (level === "constituency" && !selectedDistrict) return false;
    if (level === "mandal" && (!selectedDistrict || !selectedConstituency)) return false;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex flex-col mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Geography Master</h1>
        <p className="text-muted-foreground">Bulk add locations to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-zinc-500" /> Add Locations
          </CardTitle>
          <CardDescription>
            Select the geographic level and the parent region, then enter all names at once (one per line).
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Level to Create</Label>
            <Select value={level} onValueChange={handleLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select level..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="district">Districts</SelectItem>
                <SelectItem value="constituency">Constituencies</SelectItem>
                <SelectItem value="mandal">Mandals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(level === "district" || level === "constituency" || level === "mandal") && (
              <div className="space-y-2">
                <Label>Parent State</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger><SelectValue placeholder="Select State..." /></SelectTrigger>
                  <SelectContent>
                    {states.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(level === "constituency" || level === "mandal") && (
              <div className="space-y-2">
                <Label>Parent District</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                  <SelectTrigger><SelectValue placeholder="Select District..." /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {level === "mandal" && (
              <div className="space-y-2">
                <Label>Parent Constituency</Label>
                <Select value={selectedConstituency} onValueChange={setSelectedConstituency} disabled={!selectedDistrict}>
                  <SelectTrigger><SelectValue placeholder="Select Const..." /></SelectTrigger>
                  <SelectContent>
                    {constituencies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Bulk Add Names</Label>
            <p className="text-xs text-muted-foreground mb-2">Enter all names at once, one per line.</p>
            <Textarea 
              rows={8} 
              placeholder={`e.g.\nName 1\nName 2\nName 3`}
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              className="resize-none"
            />
          </div>
          
          {successMsg && (
            <div className="p-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 border-t pt-6 bg-zinc-50 dark:bg-zinc-900/50">
          <Button variant="outline" onClick={() => { setBulkNames(""); setSuccessMsg(""); }}>Clear</Button>
          <Button disabled={!isFormValid() || loading} onClick={handleSubmit}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Bulk Create"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

