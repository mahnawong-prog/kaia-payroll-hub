import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKina } from "@/lib/payroll-engine";
import { UserCircle, Building, Calendar, DollarSign } from "lucide-react";

interface EmployeeInfo {
  employee_number: string;
  full_name: string;
  department: string | null;
  position: string | null;
  base_salary: number;
  join_date: string;
  super_fund: string | null;
  is_resident: boolean;
}

export default function MyProfile() {
  const { user } = useAuth();
  const [info, setInfo] = useState<EmployeeInfo | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("employees").select("*").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setInfo(data as unknown as EmployeeInfo); });
  }, [user]);

  if (!info) return (
    <div className="space-y-6">
      <h1 className="page-header">My Profile</h1>
      <Card><CardContent className="py-12 text-center text-muted-foreground">No employee record linked to your account</CardContent></Card>
    </div>
  );

  const details = [
    { icon: UserCircle, label: "Employee ID", value: info.employee_number },
    { icon: Building, label: "Department", value: info.department ?? "—" },
    { icon: Building, label: "Position", value: info.position ?? "—" },
    { icon: DollarSign, label: "Base Salary", value: formatKina(Number(info.base_salary)) },
    { icon: Calendar, label: "Join Date", value: info.join_date },
    { icon: Building, label: "Super Fund", value: info.super_fund ?? "NASFUND" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-header">My Profile</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-xl">{info.full_name[0]}</span>
            </div>
            <div>
              <CardTitle>{info.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{info.is_resident ? "Resident" : "Non-Resident"} Employee</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.map((d) => (
              <div key={d.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <d.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{d.label}</p>
                  <p className="text-sm font-medium">{d.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
