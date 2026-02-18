import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

export function usePayrollEntries() {
  const { user, primaryRole } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["payroll-entries", user?.id, primaryRole],
    enabled: !!user?.id,
    queryFn: async () => {
      let queryBuilder = db
        .from("payroll_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (primaryRole === "worker") {
        queryBuilder = queryBuilder.eq("worker_id", user!.id);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`payroll-entries-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "payroll_entries" }, () => {
        queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [user?.id, queryClient]);

  return query;
}
