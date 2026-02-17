import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatKina } from "@/lib/payroll-engine";
import { Users, DollarSign, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  lastCycleGross: number;
  lastCycleNet: number;
  totalCycles: number;
}

export default function Dashboard() {
  const { isStaff, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalEmployees: 0, activeEmployees: 0, lastCycleGross: 0, lastCycleNet: 0, totalCycles: 0 });

  useEffect(() => {
    async function load() {
      const [empRes, cycleRes] = await Promise.all([
        supabase.from("employees").select("id, status"),
        supabase.from("payroll_cycles").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      const employees = empRes.data ?? [];
      const cycles = cycleRes.data ?? [];
      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === "active").length,
        lastCycleGross: cycles[0] ? Number(cycles[0].total_gross) : 0,
        lastCycleNet: cycles[0] ? Number(cycles[0].total_net) : 0,
        totalCycles: cycles.length,
      });
    }
    load();
  }, []);

  const statCards = isStaff ? [
    { label: "Total Employees", value: stats.totalEmployees, icon: Users, color: "text-primary" },
    { label: "Active", value: stats.activeEmployees, icon: TrendingUp, color: "text-success" },
    { label: "Last Gross", value: formatKina(stats.lastCycleGross), icon: DollarSign, color: "text-accent" },
    { label: "Last Net", value: formatKina(stats.lastCycleNet), icon: Calculator, color: "text-secondary" },
  ] : [
    { label: "Welcome Back", value: profile?.full_name ?? "Employee", icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="page-subtitle">
          {isStaff ? "Payroll overview and employee metrics" : "Your employee portal"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {isStaff && (
        <div className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Payroll Cycles</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { period: "Cycle 1", gross: 45000, net: 38000 },
                { period: "Cycle 2", gross: 47000, net: 39500 },
                { period: "Cycle 3", gross: 46500, net: 39000 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="gross" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Gross" />
                <Bar dataKey="net" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
