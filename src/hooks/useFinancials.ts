import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export function useFinancialTransactions() {
  return useQuery({
    queryKey: ['financial-transactions'],
    queryFn: async () => {
      const { data, error } = await db
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: any) => {
      const { data, error } = await db
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
      const { data: transactions, error } = await db
        .from('financial_transactions')
        .select('transaction_type, amount, transaction_date');
      if (error) throw error;

      const { data: entries } = await db
        .from('payroll_entries')
        .select('status, gross_pay, net_pay, deductions');

      const totalPayroll = entries?.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.net_pay), 0) || 0;
      const pendingPayroll = entries?.filter((p: any) => p.status === 'generated').reduce((sum: number, p: any) => sum + Number(p.net_pay), 0) || 0;
      const totalExpenses = transactions?.filter((t: any) => t.transaction_type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;
      const totalDeductions = entries?.reduce((sum: number, p: any) => sum + Number(p.deductions || 0), 0) || 0;

      return { totalPayroll, pendingPayroll, totalExpenses, totalDeductions };
    },
  });
}
