import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Calendar, DollarSign, Loader2, CheckCircle, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePayslips } from "@/hooks/usePayslips";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { generatePayslipPdf } from "@/utils/generatePayslipPdf";

export default function PayslipsPage() {
  const { user, primaryRole } = useAuth();
  const { data: payslips, isLoading } = usePayslips();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = ['ceo', 'manager', 'accountant'].includes(primaryRole);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const latestPayslip = payslips?.[0];

  const handleMarkPaid = async (payslipId: string) => {
    try {
      const { error } = await supabase
        .from('payslips')
        .update({ status: 'paid', paid_by: user?.id, paid_at: new Date().toISOString() })
        .eq('id', payslipId);
      if (error) throw error;
      toast({ title: "Payslip marked as paid" });
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDownloadPdf = (payslip: any) => {
    try {
      generatePayslipPdf({
        workerName: payslip.worker?.full_name || 'Worker',
        workerPosition: payslip.worker?.position || '',
        workerEmail: payslip.worker?.email,
        periodStart: payslip.period_start,
        periodEnd: payslip.period_end,
        totalHours: Number(payslip.total_hours),
        hourlyRate: Number(payslip.hourly_rate),
        grossPay: Number(payslip.gross_pay),
        deductions: Number(payslip.deductions),
        netPay: Number(payslip.net_pay),
        status: payslip.status,
        paidAt: payslip.paid_at,
        notes: payslip.notes,
      });
      toast({ title: "Payslip PDF downloaded" });
    } catch (err: any) {
      toast({ title: "Error generating PDF", description: err.message, variant: "destructive" });
    }
  };

  const filteredPayslips = payslips?.filter((p: any) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          {isAdmin ? "Payroll Management" : "My Payslips"}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin ? "Manage all worker payslips and payments" : "Your automatically generated payslips"}
        </p>
      </div>

      {/* Latest Payslip Summary */}
      {latestPayslip && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {isAdmin ? 'Latest Payslip' : 'Your Latest Payslip'}
                </CardTitle>
                <CardDescription>
                  {isAdmin && latestPayslip.worker?.full_name ? `${latestPayslip.worker.full_name} • ` : ''}
                  {new Date(latestPayslip.period_start).toLocaleDateString()} - {new Date(latestPayslip.period_end).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={latestPayslip.status === 'paid' ? 'bg-success' : 'bg-warning text-warning-foreground'}>
                  {latestPayslip.status === 'paid' ? 'Paid' : latestPayslip.status === 'generated' ? 'Generated' : 'Draft'}
                </Badge>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => handleDownloadPdf(latestPayslip)}>
                  <Download size={14} /> PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground">Hours</p>
                <p className="text-2xl font-bold">{Number(latestPayslip.total_hours).toFixed(1)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="text-2xl font-bold">K {Number(latestPayslip.hourly_rate).toFixed(2)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground">Gross</p>
                <p className="text-2xl font-bold">K {Number(latestPayslip.gross_pay).toLocaleString()}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="text-2xl font-bold text-destructive">K {Number(latestPayslip.deductions).toFixed(2)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary text-primary-foreground">
                <p className="text-sm opacity-80">Net Pay</p>
                <p className="text-2xl font-bold">K {Number(latestPayslip.net_pay).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payslip History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Payslip History
              </CardTitle>
              <CardDescription>All generated payslips</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Worker</TableHead>}
                  <TableHead>Period</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.map((payslip: any) => (
                  <TableRow key={payslip.id}>
                    {isAdmin && <TableCell className="font-medium">{payslip.worker?.full_name || '—'}</TableCell>}
                    <TableCell>
                      {new Date(payslip.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(payslip.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell>{Number(payslip.total_hours).toFixed(1)}</TableCell>
                    <TableCell>K {Number(payslip.gross_pay).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">K {Number(payslip.net_pay).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={payslip.status === 'paid' ? 'bg-success' : payslip.status === 'generated' ? 'bg-warning text-warning-foreground' : ''} variant={payslip.status === 'draft' ? 'secondary' : 'default'}>
                        {payslip.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="gap-1" onClick={() => handleDownloadPdf(payslip)}>
                          <Download size={14} /> PDF
                        </Button>
                        {isAdmin && payslip.status === 'generated' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-success gap-1"
                            onClick={() => handleMarkPaid(payslip.id)}
                          >
                            <CheckCircle size={14} /> Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayslips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      No payslips generated yet. Payslips are auto-generated when timesheets are approved.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Auto-generation Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-medium">Automatic Payslip Generation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Payslips are automatically generated when timesheets are approved by supervisors.
                Workers cannot edit payslips — all calculations are based on approved hours × hourly rate.
                {isAdmin && ' As an admin, you can mark generated payslips as paid after processing payment.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
