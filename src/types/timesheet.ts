export interface TimesheetEntry {
  id: string;
  workerId: string;
  date: Date;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  taskDescription: string;
  supervisorId: string;
  status: 'pending' | 'approved' | 'flagged';
  createdAt: Date;
}

export interface Payslip {
  id: string;
  workerId: string;
  periodStart: Date;
  periodEnd: Date;
  totalHours: number;
  hourlyRate: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  generatedAt: Date;
  pdfUrl?: string;
}
