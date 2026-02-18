import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFinancialTransactions() {
  return useQuery({
    queryKey: ['financial-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          worker:profiles!financial_transactions_related_worker_id_fkey(full_name),
          recorder:profiles!financial_transactions_recorded_by_fkey(full_name)
        `)
        .order('transaction_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: {
      transaction_type: 'payroll' | 'expense' | 'reimbursement' | 'bonus' | 'deduction';
      amount: number;
      description?: string;
      related_payslip_id?: string;
      related_worker_id?: string;
      recorded_by: string;
      category?: string;
      reference_number?: string;
      transaction_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transaction])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
    },
  });
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select('transaction_type, amount, transaction_date');
      if (error) throw error;

      const { data: payslips } = await supabase
        .from('payslips')
        .select('status, gross_pay, net_pay, deductions');

      const totalPayroll = payslips?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.net_pay), 0) || 0;
      const pendingPayroll = payslips?.filter(p => p.status === 'generated').reduce((sum, p) => sum + Number(p.net_pay), 0) || 0;
      const totalExpenses = transactions?.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalDeductions = payslips?.reduce((sum, p) => sum + Number(p.deductions), 0) || 0;

      return { totalPayroll, pendingPayroll, totalExpenses, totalDeductions };
    },
  });
}
