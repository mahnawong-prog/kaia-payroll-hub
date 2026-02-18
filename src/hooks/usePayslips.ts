import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePayslips(workerId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payslips', workerId || user?.id],
    queryFn: async () => {
      let query = supabase
        .from('payslips')
        .select(`
          *,
          worker:profiles!payslips_worker_id_fkey(full_name, position, employment_type)
        `)
        .order('period_end', { ascending: false });

      if (workerId) {
        query = query.eq('worker_id', workerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
