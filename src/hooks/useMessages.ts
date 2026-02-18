import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useContacts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chat-contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all users this person has exchanged messages with
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .not('receiver_id', 'is', null);

      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', user.id);

      const contactIds = new Set<string>();
      sentMessages?.forEach(m => m.receiver_id && contactIds.add(m.receiver_id));
      receivedMessages?.forEach(m => contactIds.add(m.sender_id));

      if (contactIds.size === 0) {
        // If no contacts yet, show supervisor or assigned workers
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .limit(20);
        return profiles || [];
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(contactIds));

      return profiles || [];
    },
    enabled: !!user,
  });
}

export function useConversation(contactId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', user?.id, contactId],
    queryFn: async () => {
      if (!user || !contactId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!contactId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user || !contactId) return;

    const channel = supabase
      .channel(`messages-${user.id}-${contactId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as any;
          if (
            (msg.sender_id === user.id && msg.receiver_id === contactId) ||
            (msg.sender_id === contactId && msg.receiver_id === user.id)
          ) {
            queryClient.invalidateQueries({ queryKey: ['messages', user.id, contactId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, contactId, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderId, receiverId, content, isBroadcast, broadcastToRole }: {
      senderId: string;
      receiverId?: string;
      content: string;
      isBroadcast?: boolean;
      broadcastToRole?: 'ceo' | 'manager' | 'supervisor' | 'worker' | 'accountant';
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: senderId,
          receiver_id: receiverId || null,
          content,
          is_broadcast: isBroadcast || false,
          broadcast_to_role: broadcastToRole || null,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['chat-contacts'] });
    },
  });
}
