import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['account-approvals'],
    queryFn: async () => {
      // First get pending approvals
      const { data: approvals, error } = await supabase
        .from('account_approvals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Then get profiles for each user
      if (!approvals || approvals.length === 0) return [];
      
      const userIds = approvals.map(a => a.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', userIds);

      return approvals.map(a => ({
        ...a,
        user: profiles?.find(p => p.id === a.user_id) || null,
      }));
    },
  });
}

export function useApproveAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ approvalId, userId, status }: { approvalId: string; userId: string; status: 'approved' | 'rejected' }) => {
      // Update approval status
      const { error: approvalError } = await supabase
        .from('account_approvals')
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', approvalId);
      if (approvalError) throw approvalError;

      // Update profile account status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ account_status: status })
        .eq('id', userId);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
