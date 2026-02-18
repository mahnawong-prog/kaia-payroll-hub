import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateWorkerPayroll, generateAndStorePayslipPdf } from "@/lib/payroll-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const payrollWizardSchema = z.object({
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
});

export default function PayrollWizard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const { data: workers, isLoading } = useQuery({
    queryKey: ["payroll-workers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("worker_type", ["permanent", "temporary"])
        .eq("account_status", "approved")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const runPayroll = useMutation({
    mutationFn: async () => {
      const input = payrollWizardSchema.parse({ periodStart, periodEnd });
      const createdEntryIds: string[] = [];

      for (const worker of workers ?? []) {
        const { data: attendance, error: attendanceError } = await supabase
          .from("attendance")
          .select("*")
          .eq("worker_id", worker.id)
          .eq("status", "approved")
          .gte("clock_in", `${input.periodStart}T00:00:00.000Z`)
          .lte("clock_in", `${input.periodEnd}T23:59:59.999Z`);
        if (attendanceError) throw attendanceError;

        const result = calculateWorkerPayroll({
          worker: worker as any,
          attendance: attendance ?? [],
          isResident: (worker as any).is_resident ?? true,
        });

        const { data: entry, error: entryError } = await supabase
          .from("payroll_entries")
          .insert({
            worker_id: worker.id,
            period_start: input.periodStart,
            period_end: input.periodEnd,
            gross_pay: result.grossEarnings,
            tax: result.fortnightlyPaye,
            super: result.employeeSuper,
            deductions: result.otherDeductions,
            net_pay: result.netPay,
            status: "generated",
          })
          .select()
          .single();
        if (entryError) throw entryError;

        const payslipUrl = await generateAndStorePayslipPdf({
          payrollEntry: entry as any,
          worker: worker as any,
        });

        const { error: updateError } = await supabase
          .from("payroll_entries")
          .update({ payslip_url: payslipUrl })
          .eq("id", entry.id);
        if (updateError) throw updateError;

        createdEntryIds.push(entry.id);
      }

      await supabase.from("audit_log").insert({
        user_id: user?.id ?? null,
        action: "payroll_generated",
        target_table: "payroll_entries",
        target_id: null,
        details: {
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          generatedCount: createdEntryIds.length,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
      toast.success("Payroll generated and payslips created.");
    },
    onError: (error: any) => toast.error(error.message ?? "Payroll generation failed"),
  });

  const approveCycle = useMutation({
    mutationFn: async () => {
      const input = payrollWizardSchema.parse({ periodStart, periodEnd });
      const { data: generatedEntries, error } = await supabase
        .from("payroll_entries")
        .select("id")
        .eq("period_start", input.periodStart)
        .eq("period_end", input.periodEnd)
        .eq("status", "generated");
      if (error) throw error;

      if ((generatedEntries?.length ?? 0) === 0) {
        throw new Error("No generated payroll entries found for the selected period.");
      }

      const { error: updateError } = await supabase
        .from("payroll_entries")
        .update({
          status: "paid",
          paid_by: user?.id ?? null,
          paid_at: new Date().toISOString(),
        })
        .in("id", (generatedEntries ?? []).map((entry) => entry.id));
      if (updateError) throw updateError;

      await supabase.from("audit_log").insert({
        user_id: user?.id ?? null,
        action: "payroll_approved",
        target_table: "payroll_entries",
        target_id: null,
        details: {
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          approvedCount: generatedEntries?.length ?? 0,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
      toast.success("Payroll cycle approved and marked as paid.");
    },
    onError: (error: any) => toast.error(error.message ?? "Payroll approval failed"),
  });

  const workerCount = useMemo(() => workers?.length ?? 0, [workers]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Wizard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
            <Input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
          </div>

          <div className="text-sm text-muted-foreground">
            Approved workers in scope: {isLoading ? "-" : workerCount}
          </div>

          {isLoading && (
            <>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1"
              disabled={runPayroll.isPending || !periodStart || !periodEnd || isLoading}
              onClick={() => runPayroll.mutate()}
            >
              {runPayroll.isPending ? "Generating..." : "Generate Payroll + Payslips"}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              disabled={approveCycle.isPending || !periodStart || !periodEnd}
              onClick={() => approveCycle.mutate()}
            >
              {approveCycle.isPending ? "Approving..." : "Approve Payroll Cycle"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
