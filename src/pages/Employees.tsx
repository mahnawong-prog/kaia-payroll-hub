import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatKina } from "@/lib/payroll-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
  email: string | null;
  department: string | null;
  position: string | null;
  base_salary: number;
  status: string;
  is_resident: boolean;
  join_date: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", department: "", position: "",
    base_salary: "", is_resident: "true", employee_number: "",
  });

  const load = async () => {
    const { data } = await supabase.from("employees").select("*").order("employee_number");
    if (data) setEmployees(data as Employee[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = employees.filter((e) =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_number.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.full_name || !form.base_salary || !form.employee_number) {
      toast.error("Name, Employee ID, and salary are required");
      return;
    }
    const { error } = await supabase.from("employees").insert({
      full_name: form.full_name,
      email: form.email || null,
      department: form.department || null,
      position: form.position || null,
      base_salary: parseFloat(form.base_salary),
      is_resident: form.is_resident === "true",
      employee_number: form.employee_number,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Employee added");
    setDialogOpen(false);
    setForm({ full_name: "", email: "", department: "", position: "", base_salary: "", is_resident: "true", employee_number: "" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Employees</h1>
          <p className="page-subtitle">{employees.length} total employees</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Employee ID</Label><Input placeholder="KAIA-0001" value={form.employee_number} onChange={(e) => setForm({ ...form, employee_number: e.target.value })} /></div>
              <div><Label>Full Name</Label><Input placeholder="John Kila" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" placeholder="john@kaiaworks.com.pg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Department</Label><Input placeholder="Operations" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div><Label>Position</Label><Input placeholder="Engineer" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
              </div>
              <div><Label>Base Salary (Fortnightly K)</Label><Input type="number" placeholder="3000" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} /></div>
              <div><Label>Residency Status</Label>
                <Select value={form.is_resident} onValueChange={(v) => setForm({ ...form, is_resident: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Resident</SelectItem>
                    <SelectItem value="false">Non-Resident</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Employee</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search employees..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden md:table-cell">Position</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-mono text-xs">{emp.employee_number}</TableCell>
                <TableCell className="font-medium">{emp.full_name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{emp.department ?? "—"}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{emp.position ?? "—"}</TableCell>
                <TableCell>{formatKina(Number(emp.base_salary))}</TableCell>
                <TableCell>
                  <Badge variant={emp.status === "active" ? "default" : "secondary"} className={emp.status === "active" ? "bg-success/10 text-success border-success/20" : ""}>
                    {emp.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No employees found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
