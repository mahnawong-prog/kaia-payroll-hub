import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const db = supabase as any;

const clockSchema = z.object({ worker_id: z.string().uuid() });
const clockOutSchema = z.object({ attendance_id: z.string().uuid() });
const attendanceDecisionSchema = z.object({
  attendance_id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  notes: z.string().max(1000).optional(),
  clock_in: z.string().datetime().optional(),
  clock_out: z.string().datetime().optional(),
});

export function useAttendance() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["attendance", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await db
        .from("attendance")
        .select("*")
        .eq("worker_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTeamAttendance() {
  const { user, isSupervisor } = useAuth();
  return useQuery({
    queryKey: ["team-attendance", user?.id],
    enabled: !!user?.id && isSupervisor,
    queryFn: async () => {
      const { data, error } = await db
        .from("attendance")
        .select("*, worker:profiles(id, full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useClockIn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const parsed = clockSchema.parse({ worker_id: user?.id });
      const payload = { worker_id: parsed.worker_id, clock_in: new Date().toISOString(), status: "pending" };
      const { data, error } = await db.from("attendance").insert(payload).select().single();
      if (error) throw error;
      await db.from("audit_log").insert({ user_id: user?.id, action: "clock_in", target_table: "attendance", target_id: data.id, details: payload });
      return data;
    },
    onSuccess: () => {
      toast.success("Clock in recorded.");
      queryClient.invalidateQueries({ queryKey: ["attendance", user?.id] });
    },
    onError: (error: any) => toast.error(error.message ?? "Clock in failed"),
  });
}

export function useClockOut() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attendanceId: string) => {
      const parsed = clockOutSchema.parse({ attendance_id: attendanceId });
      const nowIso = new Date().toISOString();
      const { data, error } = await db
        .from("attendance")
        .update({ clock_out: nowIso, status: "pending" })
        .eq("id", parsed.attendance_id)
        .eq("worker_id", user?.id ?? "")
        .select()
        .single();
      if (error) throw error;
      await db.from("audit_log").insert({ user_id: user?.id, action: "clock_out", target_table: "attendance", target_id: data.id, details: { clock_out: nowIso } });
      return data;
    },
    onSuccess: () => {
      toast.success("Clock out recorded.");
      queryClient.invalidateQueries({ queryKey: ["attendance", user?.id] });
    },
    onError: (error: any) => toast.error(error.message ?? "Clock out failed"),
  });
}

export function useReviewAttendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: z.infer<typeof attendanceDecisionSchema>) => {
      const parsed = attendanceDecisionSchema.parse(payload);
      const updates: Record<string, any> = {
        status: parsed.status,
        notes: parsed.notes ?? null,
        approved_by: user?.id ?? null,
        approved_at: new Date().toISOString(),
      };
      if (parsed.clock_in) updates.clock_in = parsed.clock_in;
      if (parsed.clock_out) updates.clock_out = parsed.clock_out;

      const { data, error } = await db
        .from("attendance")
        .update(updates)
        .eq("id", parsed.attendance_id)
        .select()
        .single();
      if (error) throw error;
      await db.from("audit_log").insert({ user_id: user?.id, action: `attendance_${parsed.status}`, target_table: "attendance", target_id: parsed.attendance_id, details: updates });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-attendance", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance updated.");
    },
    onError: (error: any) => toast.error(error.message ?? "Failed to update attendance"),
  });
}
