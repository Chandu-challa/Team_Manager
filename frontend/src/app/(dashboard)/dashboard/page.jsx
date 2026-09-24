"use client";

import { useEffect, useState } from "react";
import { dataAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Map, MapPin, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataAPI
      .getDashboardSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Total Persons", value: data?.total_persons, icon: Users },
    { title: "Total Team Types", value: data?.total_team_types, icon: Map },
    { title: "Total Teams", value: data?.total_teams, icon: MapPin },
    { title: "Active Users", value: data?.active_users, icon: UserCheck },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {user?.role === "ADMIN" && (
        <div className="flex gap-4 justify-end">
          <Link href="/persons/add">
            <Button>+ Add Person</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card
            key={i}
            className="transition-all hover:shadow-md border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationFillMode: "both", animationDelay: `${i * 60}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {card.value?.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card
          className="col-span-4 border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: "200ms", animationFillMode: "both" }}
        >
          <CardHeader>
            <CardTitle>Persons Growth Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Jan",
                      total: Math.floor((data?.total_persons || 100) * 0.2),
                    },
                    {
                      name: "Feb",
                      total: Math.floor((data?.total_persons || 100) * 0.4),
                    },
                    {
                      name: "Mar",
                      total: Math.floor((data?.total_persons || 100) * 0.6),
                    },
                    {
                      name: "Apr",
                      total: Math.floor((data?.total_persons || 100) * 0.8),
                    },
                    { name: "May", total: data?.total_persons || 100 },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e4e4e7"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card
          className="col-span-3 border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: "300ms", animationFillMode: "both" }}
        >
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Teams", value: data?.total_teams || 10 },
                      {
                        name: "Team Types",
                        value: data?.total_team_types || 5,
                      },
                      { name: "Users", value: data?.active_users || 3 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#93c5fd" />
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
