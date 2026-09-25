import re

with open(r"D:\Team_Manager\frontend\src\app\(dashboard)\page.jsx", "r", encoding="utf-8") as f:
    content = f.read()

new_content = """"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Map, MapPin, Layers, Plus, ChevronRight, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentPersons, setRecentPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userRes = await api.get("/auth/me/");
        setUser(userRes.data);

        const [sumRes, personsRes] = await Promise.all([
          api.get("/dashboard/summary/"),
          api.get("/persons/?page=1&page_size=5"),
        ]);
        setSummary(sumRes.data);
        
        let persons = personsRes.data.results || personsRes.data;
        // Fix URLs for absolute paths
        persons = persons.map(p => {
          if (p.photo && !p.photo.startsWith('http')) {
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace('/api', '');
            p.photo = `${baseUrl}${p.photo}`;
          }
          return p;
        });
        setRecentPersons(persons.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-100 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-100 rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-zinc-100 rounded-xl w-full mt-8"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {greeting()}, {user?.full_name?.split(" ")[0] || user?.username || "Admin"}
          </h1>
          <p className="text-zinc-500 mt-1">Welcome back to Person Management.</p>
        </div>
        <Link href="/persons/add" className={cn(buttonVariants({ size: "lg" }), "bg-indigo-600 hover:bg-indigo-700 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]")}>
          <Plus className="w-5 h-5 mr-2" />
          Add Person
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 flex flex-col justify-between h-full relative">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3 mb-4 text-zinc-500">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm tracking-wide uppercase">Total Persons</span>
            </div>
            <div className="text-4xl font-black text-zinc-900">{summary?.total_members || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 flex flex-col justify-between h-full relative">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Map className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3 mb-4 text-zinc-500">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Map className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm tracking-wide uppercase">Total Districts</span>
            </div>
            <div className="text-4xl font-black text-zinc-900">{summary?.districts_total || 26}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 flex flex-col justify-between h-full relative">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layers className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3 mb-4 text-zinc-500">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm tracking-wide uppercase">Total Teams</span>
            </div>
            <div className="text-4xl font-black text-zinc-900">{summary?.total_teams || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 flex flex-col justify-between h-full relative">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <MapPin className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3 mb-4 text-zinc-500">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm tracking-wide uppercase">Total Mandals</span>
            </div>
            <div className="text-4xl font-black text-zinc-900">{summary?.mandals_total || 679}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Persons Section */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="text-lg font-bold text-zinc-900">Recently Added Persons</h2>
          <Link href="/persons" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center group">
            View all directory <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {recentPersons.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <UserRound className="w-12 h-12 text-zinc-200 mb-3" />
            <p className="font-medium text-zinc-900 mb-1">No persons found</p>
            <p className="text-sm">There are no persons registered in the system yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 bg-white border-b uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Photo & Name</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Contact</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">District / State</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentPersons.map((person) => (
                  <tr key={person.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border shadow-sm">
                          <AvatarImage src={person.photo} alt={person.name} className="object-cover" />
                          <AvatarFallback className="bg-indigo-50 text-indigo-700 font-semibold">
                            {person.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-zinc-900">{person.name}</div>
                          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
                            {person.designation || 'No Designation'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-900 font-medium">{person.phone}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{person.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-900 font-medium">{person.district_name || '-'}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{person.state_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-white border-zinc-200 text-zinc-700 font-medium shadow-sm">
                        {person.team_name || '-'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
"""

with open(r"D:\Team_Manager\frontend\src\app\(dashboard)\page.jsx", "w", encoding="utf-8") as f:
    f.write(new_content)
    
with open(r"D:\Persons\frontend\src\app\(dashboard)\page.jsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Dashboard fully rewritten to match UI/UX requirements!")
