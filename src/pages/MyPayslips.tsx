import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatKina } from "@/lib/payroll-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt } from "lucide-react";

interface PayslipEntry {
  id: string;
  gross_earnings: number;
  paye_tax: number;
  employee_super: number;
  net_pay: number;
  created_at: string;
  payroll_cycles: { period_start: string; period_end: string; status: string } | null;
}

export default function MyPayslips() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<PayslipEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("payroll_entries")
      .select("id, gross_earnings, paye_tax, employee_super, net_pay, created_at, payroll_cycles(period_start, period_end, status)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setEntries(data as unknown as PayslipEntry[]);
      });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">My Payslips</h1>
        <p className="page-subtitle">Your payroll history</p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No payslips available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>PAYE</TableHead>
                <TableHead>Super</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.payroll_cycles?.period_start} → {e.payroll_cycles?.period_end}</TableCell>
                  <TableCell>{formatKina(Number(e.gross_earnings))}</TableCell>
                  <TableCell className="text-destructive">{formatKina(Number(e.paye_tax))}</TableCell>
                  <TableCell>{formatKina(Number(e.employee_super))}</TableCell>
                  <TableCell className="font-semibold">{formatKina(Number(e.net_pay))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
