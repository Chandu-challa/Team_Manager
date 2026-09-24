"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { Users, Shield, Flag, CheckCircle2, ShieldAlert, Map, MapPin, Layers, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [sumRes, covRes] = await Promise.all([
          api.api.get("/dashboard/summary/"),
          api.api.get("/dashboard/coverage/"),
        ]);
        setSummary(sumRes.data);
        setCoverage(covRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const missingAlerts = useMemo(() => {
    if (!summary) return [];
    const districtCounts = {};
    
    summary.missing_main?.forEach(m => {
      const dName = m.district__name || 'Unknown';
      if (!districtCounts[dName]) districtCounts[dName] = { name: dName, mainMissing: 0, youthMissing: 0, totalMissing: 0 };
      districtCounts[dName].mainMissing += 1;
      districtCounts[dName].totalMissing += 1;
    });

    summary.missing_youth?.forEach(m => {
      const dName = m.district__name || 'Unknown';
      if (!districtCounts[dName]) districtCounts[dName] = { name: dName, mainMissing: 0, youthMissing: 0, totalMissing: 0 };
      districtCounts[dName].youthMissing += 1;
      districtCounts[dName].totalMissing += 1;
    });

    return Object.values(districtCounts).sort((a, b) => b.totalMissing - a.totalMissing).slice(0, 6);
  }, [summary]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  if (!summary) return <div className="p-8 text-center text-destructive">Failed to load dashboard</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Geographic Master Dashboard</h1>
        <p className="text-muted-foreground">Andhra Pradesh Organization Coverage Overview</p>
      </div>

      {/* Row 1: Master Geographic Coverage */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-50 dark:bg-slate-900 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Districts</CardTitle>
            <Map className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.districts_total || 26}</div>
            <p className="text-xs text-muted-foreground mt-1">Geographic Districts</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-900 border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Constituencies</CardTitle>
            <Layers className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.constituencies_total || 175}</div>
            <p className="text-xs text-muted-foreground mt-1">Assembly Constituencies</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-900 border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mandals</CardTitle>
            <MapPin className="w-4 h-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.mandals_total}</div>
            <p className="text-xs text-muted-foreground mt-1">Administrative Mandals</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-900 border-l-4 border-l-slate-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Personnel</CardTitle>
            <Users className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_members}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {summary.total_teams} Active Teams</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Committee Coverage Metrics */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Committee Coverage Metrics</CardTitle>
            <CardDescription>Functional committee coverage across {summary.mandals_total} master mandals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold">Mandals with Main Teams</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="h-auto p-1 text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                      {summary.mandals_main_covered} / {summary.mandals_total}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Mandals Missing Main Teams</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 mt-4">
                      {summary.missing_main?.map(m => (
                        <div key={m.id} className="text-sm p-3 bg-secondary/50 rounded-md flex justify-between items-center border border-border/50">
                          <span className="font-semibold">{m.name}</span>
                          <span className="text-muted-foreground text-xs bg-background px-2 py-1 rounded-md">{m.district__name}</span>
                        </div>
                      ))}
                      {summary.missing_main?.length === 0 && <p className="text-sm text-green-600 font-medium">All mandals covered by Main Teams!</p>}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${(summary.mandals_main_covered / summary.mandals_total) * 100}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground text-right">{Math.round((summary.mandals_main_covered / summary.mandals_total) * 100) || 0}% Coverage</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold">Mandals with Youth Teams</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="h-auto p-1 text-sm font-bold text-orange-600 hover:text-orange-800 hover:bg-orange-50">
                      {summary.mandals_youth_covered} / {summary.mandals_total}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Mandals Missing Youth Teams</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 mt-4">
                      {summary.missing_youth?.map(m => (
                        <div key={m.id} className="text-sm p-3 bg-secondary/50 rounded-md flex justify-between items-center border border-border/50">
                          <span className="font-semibold">{m.name}</span>
                          <span className="text-muted-foreground text-xs bg-background px-2 py-1 rounded-md">{m.district__name}</span>
                        </div>
                      ))}
                      {summary.missing_youth?.length === 0 && <p className="text-sm text-green-600 font-medium">All mandals covered by Youth Teams!</p>}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${(summary.mandals_youth_covered / summary.mandals_total) * 100}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground text-right">{Math.round((summary.mandals_youth_covered / summary.mandals_total) * 100) || 0}% Coverage</p>
            </div>

            <div className="pt-6 border-t mt-6">
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-3">
                  {summary.mandals_fully_covered === summary.mandals_total ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-green-600" />
                  )}
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-300">Fully Covered Mandals</h4>
                    <p className="text-xs text-green-700/80 dark:text-green-400/80 mt-0.5">Both Main & Youth teams active</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-700 dark:text-green-400">{summary.mandals_fully_covered}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missing Teams Alert Section */}
        <Card className="border-t-4 border-t-destructive shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-destructive">Missing Teams Alert</CardTitle>
            </div>
            <CardDescription>Districts with the highest number of missing mandal teams requiring immediate focus.</CardDescription>
          </CardHeader>
          <CardContent>
            {missingAlerts.length > 0 ? (
              <div className="space-y-4 mt-2">
                {missingAlerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-300">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{alert.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                          {alert.mainMissing > 0 && <span className="text-red-600 dark:text-red-400">{alert.mainMissing} Main</span>}
                          {alert.youthMissing > 0 && <span className="text-orange-600 dark:text-orange-400">{alert.youthMissing} Youth</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-destructive">{alert.totalMissing}</span>
                      <span className="text-xs text-muted-foreground block">Total Missing</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900 border-dashed">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                <p className="font-medium text-green-800 dark:text-green-300">Excellent Coverage!</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">No missing teams found across any district.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

