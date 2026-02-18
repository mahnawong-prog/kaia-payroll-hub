import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AttendanceOverview() {
  const { data, isLoading } = useQuery(['attendance-overview'], async () => {
    const { data, error } = await supabase.from('attendance').select('*, worker:profiles(full_name, worker_type, supervisor_id)').order('clock_in', { ascending: false });
    if (error) throw error;
    return data;
  });

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview (All Workers)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data?.map((a: any) => (
              <div key={a.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <div className="font-medium">{a.worker?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.clock_in).toLocaleString()} {a.clock_out && `- ${new Date(a.clock_out).toLocaleString()}`}</div>
                </div>
                <span className={`badge ${a.status === 'approved' ? 'bg-success' : a.status === 'pending' ? 'bg-warning' : 'bg-destructive'}`}>{a.status}</span>
              </div>
            ))}
            {data?.length === 0 && <div className="text-muted-foreground text-sm">No attendance records yet.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
