import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTimesheets(workerId?: string) {
  const { user, primaryRole } = useAuth();

  return useQuery({
    queryKey: ['timesheets', workerId || user?.id, primaryRole],
    queryFn: async () => {
      let query = supabase
        .from('timesheets')
        .select(`
          *,
          worker:profiles!timesheets_worker_id_fkey(full_name, position),
          supervisor:profiles!timesheets_supervisor_id_fkey(full_name)
        `)
        .order('date', { ascending: false });

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

export function useCreateTimesheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      worker_id: string;
      supervisor_id: string;
      date: string;
      clock_in: string;
      clock_out: string;
      task_description?: string;
    }) => {
      const { data, error } = await supabase
        .from('timesheets')
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useUpdateTimesheetStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, approvedBy }: { id: string; status: string; approvedBy?: string }) => {
      const updates: Record<string, any> = { status };
      if (status === 'approved' && approvedBy) {
        updates.approved_by = approvedBy;
        updates.approved_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from('timesheets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    },
  });
}
