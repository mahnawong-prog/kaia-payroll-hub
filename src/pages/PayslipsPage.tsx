import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePayrollEntries } from "@/hooks/usePayrollEntries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

export default function PayslipsPage() {
  const { primaryRole, user } = useAuth();
  const { data, isLoading } = usePayrollEntries();
  const isWorker = primaryRole === "worker";

  const entries = useMemo(() => {
    if (isWorker) return data ?? [];
    return (data ?? []).filter((entry: any) => entry.worker_id === user?.id);
  }, [data, isWorker, user?.id]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">My Payslips</h1>
        <p className="text-sm text-muted-foreground">Generated payroll statements with downloadable PDFs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <div className="py-8 text-sm text-muted-foreground">No payslips available yet.</div>
          )}

          {!isLoading && entries.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Super</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {entry.period_start} to {entry.period_end}
                    </TableCell>
                    <TableCell>K {Number(entry.gross_pay ?? 0).toFixed(2)}</TableCell>
                    <TableCell>K {Number(entry.tax ?? 0).toFixed(2)}</TableCell>
                    <TableCell>K {Number(entry.super ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="font-medium">K {Number(entry.net_pay ?? 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge>{entry.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!entry.payslip_url}
                        onClick={() => entry.payslip_url && window.open(entry.payslip_url, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
