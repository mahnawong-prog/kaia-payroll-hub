import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePayslips(workerId?: string) {
  const { user, primaryRole } = useAuth();

  return useQuery({
    queryKey: ["payslips", workerId ?? user?.id, primaryRole],
    enabled: !!user?.id,
    queryFn: async () => {
      let queryBuilder = supabase
        .from("payroll_entries")
        .select("*, worker:profiles!payroll_entries_worker_id_fkey(full_name, position, worker_type, supervisor_id)")
        .order("period_end", { ascending: false });

      if (workerId) {
        queryBuilder = queryBuilder.eq("worker_id", workerId);
      } else if (primaryRole === "worker") {
        queryBuilder = queryBuilder.eq("worker_id", user!.id);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data ?? [];
    },
  });
}
