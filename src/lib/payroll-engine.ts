// PNG 2026 Payroll Calculation Engine

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  base: number;
}

export interface PayrollInput {
  baseSalary: number; // fortnightly
  overtimeHours: number;
  overtimeRate?: number; // multiplier, default 1.5
  allowances: { name: string; amount: number }[];
  isResident: boolean;
  superRate?: number; // employee contribution rate, default 0.06
  employerSuperRate?: number; // default 0.084
  otherDeductions?: number;
}

export interface PayrollResult {
  basePay: number;
  overtimePay: number;
  totalAllowances: number;
  grossEarnings: number;
  annualizedGross: number;
  annualPaye: number;
  fortnightlyPaye: number;
  employeeSuper: number;
  employerSuper: number;
  otherDeductions: number;
  netPay: number;
  effectiveTaxRate: number;
  calculationLog: {
    step: string;
    value: number;
    detail?: string;
  }[];
}

const RESIDENT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 20000, rate: 0, base: 0 },
  { min: 20001, max: 33000, rate: 0.30, base: 0 },
  { min: 33001, max: 70000, rate: 0.35, base: 3900 },
  { min: 70001, max: 250000, rate: 0.40, base: 16850 },
  { min: 250001, max: null, rate: 0.42, base: 88850 },
];

const NON_RESIDENT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 20000, rate: 0.22, base: 0 },
  { min: 20001, max: 33000, rate: 0.30, base: 4400 },
  { min: 33001, max: 70000, rate: 0.35, base: 8300 },
  { min: 70001, max: 250000, rate: 0.40, base: 21250 },
  { min: 250001, max: null, rate: 0.42, base: 93250 },
];

export function calculateAnnualPaye(annualIncome: number, brackets: TaxBracket[]): number {
  for (const bracket of brackets) {
    const max = bracket.max ?? Infinity;
    if (annualIncome <= max) {
      const taxableInBracket = annualIncome - bracket.min + 1;
      return bracket.base + taxableInBracket * bracket.rate;
    }
  }
  return 0;
}

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const log: PayrollResult["calculationLog"] = [];
  const overtimeRate = input.overtimeRate ?? 1.5;
  const hourlyRate = input.baseSalary / 80; // 80 hours per fortnight
  const overtimePay = +(input.overtimeHours * hourlyRate * overtimeRate).toFixed(2);
  const totalAllowances = +input.allowances.reduce((s, a) => s + a.amount, 0).toFixed(2);
  const grossEarnings = +(input.baseSalary + overtimePay + totalAllowances).toFixed(2);

  log.push({ step: "Base Pay", value: input.baseSalary });
  log.push({ step: "Overtime Pay", value: overtimePay, detail: `${input.overtimeHours}hrs × K${hourlyRate.toFixed(2)} × ${overtimeRate}` });
  log.push({ step: "Allowances", value: totalAllowances });
  log.push({ step: "Gross Earnings", value: grossEarnings });

  // Annualize: fortnightly × 26
  const annualizedGross = +(grossEarnings * 26).toFixed(2);
  log.push({ step: "Annualized Gross", value: annualizedGross, detail: `K${grossEarnings} × 26 fortnights` });

  const brackets = input.isResident ? RESIDENT_BRACKETS_2026 : NON_RESIDENT_BRACKETS_2026;
  const annualPaye = +calculateAnnualPaye(annualizedGross, brackets).toFixed(2);
  const fortnightlyPaye = +(annualPaye / 26).toFixed(2);

  log.push({ step: "Annual PAYE", value: annualPaye, detail: input.isResident ? "Resident brackets" : "Non-resident brackets" });
  log.push({ step: "Fortnightly PAYE", value: fortnightlyPaye, detail: `K${annualPaye} / 26` });

  const superRate = input.superRate ?? 0.06;
  const employerSuperRate = input.employerSuperRate ?? 0.084;
  const employeeSuper = +(grossEarnings * superRate).toFixed(2);
  const employerSuper = +(grossEarnings * employerSuperRate).toFixed(2);
  const otherDeductions = input.otherDeductions ?? 0;

  log.push({ step: "Employee Super (6%)", value: employeeSuper });
  log.push({ step: "Employer Super (8.4%)", value: employerSuper });

  const netPay = +(grossEarnings - fortnightlyPaye - employeeSuper - otherDeductions).toFixed(2);
  const effectiveTaxRate = grossEarnings > 0 ? +((fortnightlyPaye / grossEarnings) * 100).toFixed(1) : 0;

  log.push({ step: "Net Pay", value: netPay });

  return {
    basePay: input.baseSalary,
    overtimePay,
    totalAllowances,
    grossEarnings,
    annualizedGross,
    annualPaye,
    fortnightlyPaye,
    employeeSuper,
    employerSuper,
    otherDeductions,
    netPay,
    effectiveTaxRate,
    calculationLog: log,
  };
}

export function formatKina(amount: number): string {
  return `K${amount.toLocaleString("en-PG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
