import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Attendance = Tables<"attendance">;
type PayrollEntry = Tables<"payroll_entries">;
type UserProfile = Tables<"profiles">;

export interface PayrollResult {
  grossEarnings: number;
  fortnightlyPaye: number;
  employeeSuper: number;
  employerSuper: number;
  otherDeductions: number;
  netPay: number;
  approvedHours: number;
  overtimeHours: number;
  baseComponent: number;
  hourlyComponent: number;
}

type TaxBracket = {
  min: number;
  max: number | null;
  rate: number;
  base: number;
};

const RESIDENT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 20000, rate: 0, base: 0 },
  { min: 20001, max: 33000, rate: 0.3, base: 0 },
  { min: 33001, max: 70000, rate: 0.35, base: 3900 },
  { min: 70001, max: 250000, rate: 0.4, base: 16850 },
  { min: 250001, max: null, rate: 0.42, base: 88850 },
];

const NON_RESIDENT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 20000, rate: 0.22, base: 0 },
  { min: 20001, max: 33000, rate: 0.3, base: 4400 },
  { min: 33001, max: 70000, rate: 0.35, base: 8300 },
  { min: 70001, max: 250000, rate: 0.4, base: 21250 },
  { min: 250001, max: null, rate: 0.42, base: 93250 },
];

function calculateAnnualPaye(annualIncome: number, brackets: TaxBracket[]) {
  for (const bracket of brackets) {
    const max = bracket.max ?? Infinity;
    if (annualIncome <= max) {
      const taxableInBracket = Math.max(0, annualIncome - bracket.min + 1);
      return bracket.base + taxableInBracket * bracket.rate;
    }
  }
  return 0;
}

function getApprovedHours(attendance: Attendance[]) {
  return attendance.reduce((sum, row) => {
    if (!row.clock_in || !row.clock_out || row.status !== "approved") return sum;
    const hours = (new Date(row.clock_out).getTime() - new Date(row.clock_in).getTime()) / 3_600_000;
    return sum + Math.max(0, hours);
  }, 0);
}

export function calculateWorkerPayroll({
  worker,
  attendance,
  isResident,
  allowances = 0,
  otherDeductions = 0,
}: {
  worker: UserProfile;
  attendance: Attendance[];
  isResident: boolean;
  allowances?: number;
  otherDeductions?: number;
}): PayrollResult {
  const approvedHours = Number(getApprovedHours(attendance).toFixed(2));
  const hourlyRate = Number(worker.hourly_rate ?? 0);

  let baseComponent = 0;
  let hourlyComponent = 0;
  let overtimeHours = 0;
  let employeeSuperRate = 0;
  let employerSuperRate = 0;

  if (worker.worker_type === "temporary") {
    hourlyComponent = Number((approvedHours * hourlyRate).toFixed(2));
    const superEnabled = worker.super_enabled === true;
    employeeSuperRate = superEnabled ? 0.06 : 0;
    employerSuperRate = superEnabled ? 0.084 : 0;
  } else {
    baseComponent = Number(worker.base_salary ?? 0);
    overtimeHours = Math.max(0, approvedHours - 80);
    hourlyComponent = Number((overtimeHours * hourlyRate * 1.5).toFixed(2));
    employeeSuperRate = 0.06;
    employerSuperRate = 0.084;
  }

  const grossEarnings = Number((baseComponent + hourlyComponent + allowances).toFixed(2));
  const annualizedGross = grossEarnings * 26;
  const taxBrackets = isResident ? RESIDENT_BRACKETS_2026 : NON_RESIDENT_BRACKETS_2026;
  const annualPaye = calculateAnnualPaye(annualizedGross, taxBrackets);
  const fortnightlyPaye = Number((annualPaye / 26).toFixed(2));
  const employeeSuper = Number((grossEarnings * employeeSuperRate).toFixed(2));
  const employerSuper = Number((grossEarnings * employerSuperRate).toFixed(2));
  const netPay = Number((grossEarnings - fortnightlyPaye - employeeSuper - otherDeductions).toFixed(2));

  return {
    grossEarnings,
    fortnightlyPaye,
    employeeSuper,
    employerSuper,
    otherDeductions,
    netPay,
    approvedHours,
    overtimeHours: Number(overtimeHours.toFixed(2)),
    baseComponent,
    hourlyComponent,
  };
}

export async function generateAndStorePayslipPdf({
  payrollEntry,
  worker,
}: {
  payrollEntry: PayrollEntry;
  worker: UserProfile;
}) {
  const template = {
    basePdf: { width: 210, height: 297, padding: [10, 10, 10, 10] },
    schemas: [
      [
        { type: "text", position: { x: 12, y: 18 }, width: 180, height: 8, name: "title", fontSize: 18 },
        { type: "text", position: { x: 12, y: 32 }, width: 180, height: 6, name: "worker", fontSize: 12 },
        { type: "text", position: { x: 12, y: 42 }, width: 180, height: 6, name: "period", fontSize: 11 },
        { type: "text", position: { x: 12, y: 54 }, width: 180, height: 6, name: "gross", fontSize: 11 },
        { type: "text", position: { x: 12, y: 62 }, width: 180, height: 6, name: "tax", fontSize: 11 },
        { type: "text", position: { x: 12, y: 70 }, width: 180, height: 6, name: "super", fontSize: 11 },
        { type: "text", position: { x: 12, y: 78 }, width: 180, height: 6, name: "deductions", fontSize: 11 },
        { type: "text", position: { x: 12, y: 90 }, width: 180, height: 7, name: "net", fontSize: 14 },
      ],
    ],
  } as any;

  const inputs = [
    {
      title: "KaiaWorks Payslip",
      worker: `Worker: ${worker.full_name ?? worker.id}`,
      period: `Period: ${payrollEntry.period_start} to ${payrollEntry.period_end}`,
      gross: `Gross: K ${Number(payrollEntry.gross_pay ?? 0).toFixed(2)}`,
      tax: `Tax: K ${Number(payrollEntry.tax ?? 0).toFixed(2)}`,
      super: `Super: K ${Number(payrollEntry.super ?? 0).toFixed(2)}`,
      deductions: `Deductions: K ${Number(payrollEntry.deductions ?? 0).toFixed(2)}`,
      net: `Net Pay: K ${Number(payrollEntry.net_pay ?? 0).toFixed(2)}`,
    },
  ];

  const generatorModule = await import(/* @vite-ignore */ "@pdfme/generator");
  const pdf = await generatorModule.generate({ template, inputs });
  const fileName = `payslip-${payrollEntry.worker_id}-${payrollEntry.period_start}-${payrollEntry.period_end}.pdf`;
  const path = `generated/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("payslips")
    .upload(path, pdf, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("payslips").getPublicUrl(path);
  return data.publicUrl;
}

export function formatKina(amount: number) {
  return `K ${Number(amount ?? 0).toLocaleString("en-PG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
