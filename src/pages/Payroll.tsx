import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { calculatePayroll, formatKina, type PayrollResult } from "@/lib/payroll-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Calculator, CheckCircle, Loader2 } from "lucide-react";

interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
  base_salary: number;
  is_resident: boolean;
}

interface EntryPreview extends PayrollResult {
  employee: Employee;
}

export default function Payroll() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [entries, setEntries] = useState<EntryPreview[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("employees").select("id, employee_number, full_name, base_salary, is_resident")
      .eq("status", "active").then(({ data }) => { if (data) setEmployees(data as Employee[]); });
  }, []);

  const runCalculations = () => {
    if (!periodStart || !periodEnd) { toast.error("Set period dates"); return; }
    const results = employees.map((emp) => {
      const result = calculatePayroll({
        baseSalary: Number(emp.base_salary),
        overtimeHours: 0,
        allowances: [],
        isResident: emp.is_resident,
      });
      return { ...result, employee: emp };
    });
    setEntries(results);
    setStep(2);
  };

  const savePayroll = async () => {
    setSaving(true);
    const { data: cycle, error: cycleErr } = await supabase.from("payroll_cycles").insert({
      period_start: periodStart,
      period_end: periodEnd,
      status: "preview",
      run_by: user?.id,
      total_gross: entries.reduce((s, e) => s + e.grossEarnings, 0),
      total_paye: entries.reduce((s, e) => s + e.fortnightlyPaye, 0),
      total_net: entries.reduce((s, e) => s + e.netPay, 0),
    }).select().single();

    if (cycleErr || !cycle) { toast.error("Failed to create cycle"); setSaving(false); return; }

    const entryRows = entries.map((e) => ({
      cycle_id: cycle.id,
      employee_id: e.employee.id,
      base_pay: e.basePay,
      overtime_hours: 0,
      overtime_pay: e.overtimePay,
      allowances: [],
      gross_earnings: e.grossEarnings,
      paye_tax: e.fortnightlyPaye,
      employee_super: e.employeeSuper,
      employer_super: e.employerSuper,
      other_deductions: e.otherDeductions,
      net_pay: e.netPay,
      calculation_log: { steps: e.calculationLog },
    }));

    const { error } = await supabase.from("payroll_entries").insert(entryRows);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Payroll cycle saved successfully!");
    setStep(3);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Run Payroll</h1>
        <p className="page-subtitle">PNG 2026 compliant payroll wizard</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {["Set Period", "Preview & Calculate", "Confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step > i + 1 ? "bg-success text-success-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className={step === i + 1 ? "font-medium text-foreground" : "text-muted-foreground"}>{s}</span>
            {i < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Payroll Period</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /></div>
              <div><Label>End Date</Label><Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /></div>
            </div>
            <p className="text-sm text-muted-foreground">{employees.length} active employees will be included</p>
            <Button onClick={runCalculations}><Calculator className="h-4 w-4 mr-2" />Calculate Payroll</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card"><p className="text-xs text-muted-foreground mb-1">Total Gross</p><p className="text-xl font-bold">{formatKina(entries.reduce((s, e) => s + e.grossEarnings, 0))}</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground mb-1">Total PAYE</p><p className="text-xl font-bold">{formatKina(entries.reduce((s, e) => s + e.fortnightlyPaye, 0))}</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground mb-1">Total Net</p><p className="text-xl font-bold">{formatKina(entries.reduce((s, e) => s + e.netPay, 0))}</p></div>
          </div>

          <div className="bg-card rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>PAYE</TableHead>
                  <TableHead>Super (6%)</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Eff. Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.employee.id}>
                    <TableCell>
                      <div><span className="font-medium">{e.employee.full_name}</span><br /><span className="text-xs text-muted-foreground font-mono">{e.employee.employee_number}</span></div>
                    </TableCell>
                    <TableCell>{formatKina(e.grossEarnings)}</TableCell>
                    <TableCell className="text-destructive">{formatKina(e.fortnightlyPaye)}</TableCell>
                    <TableCell>{formatKina(e.employeeSuper)}</TableCell>
                    <TableCell className="font-semibold">{formatKina(e.netPay)}</TableCell>
                    <TableCell>{e.effectiveTaxRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={savePayroll} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save & Submit
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Payroll Submitted!</h2>
            <p className="text-muted-foreground mb-4">The payroll cycle has been saved and is ready for approval.</p>
            <Button onClick={() => { setStep(1); setEntries([]); }}>Run Another Cycle</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
