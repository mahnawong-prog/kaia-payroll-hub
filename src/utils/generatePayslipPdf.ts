import jsPDF from 'jspdf';

interface PayslipData {
  workerName: string;
  workerPosition: string;
  workerEmail?: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  hourlyRate: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: string;
  paidAt?: string;
  notes?: string;
}

export function generatePayslipPdf(payslip: PayslipData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header bar
  doc.setFillColor(30, 100, 50); // PNG green
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('KAIAWORKS', margin, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Workforce Management System', margin, 28);
  doc.text('Papua New Guinea', margin, 34);

  // Payslip title
  doc.setFontSize(12);
  doc.text('PAYSLIP', pageWidth - margin, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.text(`Period: ${formatDate(payslip.periodStart)} - ${formatDate(payslip.periodEnd)}`, pageWidth - margin, 28, { align: 'right' });
  doc.text(`Status: ${payslip.status.toUpperCase()}`, pageWidth - margin, 34, { align: 'right' });

  y = 55;
  doc.setTextColor(0, 0, 0);

  // Employee Details Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Details', margin, y);
  y += 2;
  doc.setDrawColor(30, 100, 50);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const details = [
    ['Name', payslip.workerName],
    ['Position', payslip.workerPosition || '—'],
    ['Email', payslip.workerEmail || '—'],
  ];

  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, y);
    y += 7;
  });

  y += 5;

  // Earnings Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Earnings Breakdown', margin, y);
  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 5, y);
  doc.text('Details', pageWidth / 2, y, { align: 'center' });
  doc.text('Amount (K)', pageWidth - margin - 5, y, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'normal');

  // Row: Hours
  doc.text('Total Hours Worked', margin + 5, y);
  doc.text(`${payslip.totalHours.toFixed(1)} hrs`, pageWidth / 2, y, { align: 'center' });
  doc.text('—', pageWidth - margin - 5, y, { align: 'right' });
  y += 8;

  // Row: Hourly Rate
  doc.text('Hourly Rate', margin + 5, y);
  doc.text('—', pageWidth / 2, y, { align: 'center' });
  doc.text(`K ${payslip.hourlyRate.toFixed(2)}`, pageWidth - margin - 5, y, { align: 'right' });
  y += 8;

  // Row: Gross Pay
  doc.text('Gross Pay', margin + 5, y);
  doc.text(`${payslip.totalHours.toFixed(1)} × K ${payslip.hourlyRate.toFixed(2)}`, pageWidth / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(`K ${payslip.grossPay.toLocaleString('en', { minimumFractionDigits: 2 })}`, pageWidth - margin - 5, y, { align: 'right' });
  y += 8;

  // Row: Deductions
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 50, 50);
  doc.text('Deductions', margin + 5, y);
  doc.text('—', pageWidth / 2, y, { align: 'center' });
  doc.text(`- K ${payslip.deductions.toFixed(2)}`, pageWidth - margin - 5, y, { align: 'right' });
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Net Pay (highlight)
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(30, 100, 50);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NET PAY', margin + 5, y + 3);
  doc.text(`K ${payslip.netPay.toLocaleString('en', { minimumFractionDigits: 2 })}`, pageWidth - margin - 5, y + 3, { align: 'right' });
  y += 20;

  // Payment info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (payslip.paidAt) {
    doc.text(`Payment Date: ${formatDate(payslip.paidAt)}`, margin, y);
    y += 6;
  }
  if (payslip.notes) {
    doc.text(`Notes: ${payslip.notes}`, margin, y);
    y += 6;
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y - 5, pageWidth - margin, y - 5);
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This is a system-generated payslip from KAIAWORKS. For queries, contact your supervisor.', pageWidth / 2, y, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y + 5, { align: 'center' });

  // Save
  const filename = `payslip_${payslip.workerName.replace(/\s+/g, '_')}_${payslip.periodStart}_${payslip.periodEnd}.pdf`;
  doc.save(filename);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
