import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function AttendanceOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['attendance-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, worker:profiles!attendance_worker_id_fkey(full_name)')
        .order('clock_in', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl md:text-3xl font-bold">Attendance Overview</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Workers Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(data ?? []).map((a: any) => (
              <div key={a.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <div className="font-medium">{a.worker?.full_name ?? 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.clock_in).toLocaleString()}
                    {a.clock_out && ` — ${new Date(a.clock_out).toLocaleString()}`}
                  </div>
                </div>
                <Badge variant={a.status === 'approved' ? 'default' : a.status === 'pending' ? 'secondary' : 'destructive'}>
                  {a.status}
                </Badge>
              </div>
            ))}
            {(data ?? []).length === 0 && <div className="text-muted-foreground text-sm">No attendance records yet.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
