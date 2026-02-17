import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatKina } from "@/lib/payroll-engine";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Cycle {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  total_gross: number;
  total_paye: number;
  total_net: number;
  created_at: string;
}

export default function PayrollHistory() {
  const [cycles, setCycles] = useState<Cycle[]>([]);

  useEffect(() => {
    supabase.from("payroll_cycles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setCycles(data as Cycle[]); });
  }, []);

  const statusColor = (s: string) => {
    const map: Record<string, string> = { draft: "bg-muted text-muted-foreground", preview: "bg-warning/10 text-warning", approved: "bg-primary/10 text-primary", paid: "bg-success/10 text-success" };
    return map[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Payroll History</h1>
        <p className="page-subtitle">All payroll cycles</p>
      </div>
      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>PAYE</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cycles.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.period_start} → {c.period_end}</TableCell>
                <TableCell><Badge className={statusColor(c.status)}>{c.status}</Badge></TableCell>
                <TableCell>{formatKina(Number(c.total_gross))}</TableCell>
                <TableCell>{formatKina(Number(c.total_paye))}</TableCell>
                <TableCell className="font-semibold">{formatKina(Number(c.total_net))}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {cycles.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payroll cycles yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
