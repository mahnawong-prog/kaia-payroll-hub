import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

export function usePayslips(workerId?: string) {
  const { user, primaryRole } = useAuth();
  return useQuery({
    queryKey: ["payslips", workerId ?? user?.id, primaryRole],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = db
        .from("payroll_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (workerId) {
        query = query.eq("worker_id", workerId);
      } else if (primaryRole === "worker") {
        query = query.eq("worker_id", user!.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
