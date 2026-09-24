"use client";

import { useEffect, useState } from "react";
import { dataAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapIcon, Plus, Edit, Trash, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthContext";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TeamTypeMaster() {
  const { user } = useAuth();
  const [teamTypes, setTeamTypes] = useState([]);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    level: 0,
    description: "",
    is_active: true,
  });

  const fetchTeamTypes = async () => {
    try {
      const res = await dataAPI.getTeamTypes();
      setTeamTypes(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeamTypes();
  }, []);

  const handleOpenAdd = () => {
    setEditingType(null);
    setFormData({ name: "", level: 0, description: "", is_active: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tt) => {
    setEditingType(tt);
    setFormData({
      name: tt.name,
      level: tt.level,
      description: tt.description || "",
      is_active: tt.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await dataAPI.updateTeamType(editingType.id, formData);
      } else {
        await dataAPI.createTeamType(formData);
      }
      setIsModalOpen(false);
      fetchTeamTypes();
    } catch (error) {
      alert("Error saving Team Type: " + (error.response?.data?.name?.[0] || error.message));
    }
  };

  const filteredTypes = teamTypes.filter(tt => 
    tt.name.toLowerCase().includes(search.toLowerCase()) || 
    (tt.description && tt.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {user?.role === "ADMIN" && (
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Team Type
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Team Type..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto bg-white dark:bg-zinc-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Team Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  {user?.role === "ADMIN" && <TableHead className="text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypes.map((tt) => (
                  <TableRow key={tt.id} className="group">
                    <TableCell className="text-muted-foreground">{tt.id}</TableCell>
                    <TableCell className="font-medium">{tt.name}</TableCell>
                    <TableCell>{tt.level}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{tt.description || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          tt.is_active
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {tt.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {user?.role === "ADMIN" && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(tt)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={user?.role === "ADMIN" ? 6 : 5} className="h-24 text-center text-muted-foreground">
                      No team types found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? "Edit Team Type" : "Add Team Type"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Type Name <span className="text-red-500">*</span></label>
              <Input 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. State, District"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hierarchy Level</label>
              <Input 
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: parseInt(e.target.value) || 0})}
                placeholder="e.g. 10"
              />
              <p className="text-xs text-muted-foreground">Higher number = lower in hierarchy (e.g. State=10, District=20)</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Optional description"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="is_active"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              <label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Active Status
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
