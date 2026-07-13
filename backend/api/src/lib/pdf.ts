import type { ComplianceResult } from '@rased/shared';
import PDFDocument from 'pdfkit';

export function generatePdfReport(
  result: ComplianceResult,
  narrativeEn: string,
  narrativeAr: string,
): Buffer {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).font('Helvetica-Bold').text('Rased (رصد) — Compliance Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text(`Generated ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Company Summary');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').fillColor('#333');

    const summary = [
      `Total Active Employees: ${result.company_summary.total_employees}`,
      `Emirati Nationals: ${result.company_summary.national_employees}`,
      `Emiratization Rate: ${result.company_summary.percentage.toFixed(1)}%`,
      `Compliance Band: ${result.current_band}`,
      `Fine Exposure: AED ${result.fine_exposure_aed.toLocaleString()}`,
    ];

    summary.forEach((line) => {
      doc.text(`• ${line}`, { indent: 10 });
      doc.moveDown(0.2);
    });

    if (result.gap_to_next_band) {
      doc.moveDown(0.5);
      doc.text(`Gap to Next Band: Hire ${result.gap_to_next_band.employees_needed} more Emirati national(s) in ${result.gap_to_next_band.role_category} roles to reach ${result.gap_to_next_band.target_band}.`, { indent: 10 });
    }

    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Per-Category Breakdown');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#333');

    const tableTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
    doc.text('Category', 50, tableTop, { width: 120 });
    doc.text('Total', 170, tableTop, { width: 60, align: 'right' });
    doc.text('Nationals', 230, tableTop, { width: 70, align: 'right' });
    doc.text('%', 300, tableTop, { width: 50, align: 'right' });
    doc.text('Band', 350, tableTop, { width: 100, align: 'right' });
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica').fillColor('#333');
    let y = doc.y;
    result.categories.forEach((cat) => {
      doc.text(cat.role_category.replace('_', ' '), 50, y, { width: 120 });
      doc.text(String(cat.total_employees), 170, y, { width: 60, align: 'right' });
      doc.text(String(cat.national_employees), 230, y, { width: 70, align: 'right' });
      doc.text(`${cat.percentage.toFixed(1)}%`, 300, y, { width: 50, align: 'right' });
      doc.text(cat.band, 350, y, { width: 100, align: 'right' });
      y += 18;
    });

    doc.y = y + 10;
    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Recommendations');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').fillColor('#333');
    result.recommendations.forEach((r, i) => {
      doc.text(`${i + 1}. ${r}`, { indent: 10 });
      doc.moveDown(0.2);
    });

    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Report Summary (English)');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').fillColor('#333').text(narrativeEn, { indent: 10, align: 'left' });

    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('ملخص التقرير (Arabic)');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').fillColor('#333').text(narrativeAr, { indent: 10, align: 'right' });

    doc.end();
  });
}
