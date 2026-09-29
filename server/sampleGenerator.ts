import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateSamplePdf(destinationPath: string): Promise<number> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Helper for adding headers and page footer
  const addHeaderFooter = (page: any, pageNum: number, totalPages: number, sectionTitle: string) => {
    // Header line
    page.drawLine({
      start: { x: 50, y: 755 },
      end: { x: 550, y: 755 },
      thickness: 1,
      color: rgb(0.2, 0.3, 0.5),
    });
    page.drawText('APEX GLOBAL TECHNOLOGIES — POLICY & COMPLIANCE HANDBOOK', {
      x: 50,
      y: 765,
      size: 9,
      font: fontBold,
      color: rgb(0.3, 0.4, 0.6),
    });
    page.drawText(sectionTitle, {
      x: 50,
      y: 742,
      size: 8,
      font: fontOblique,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Footer line
    page.drawLine({
      start: { x: 50, y: 45 },
      end: { x: 550, y: 45 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    page.drawText('Confidential — Internal Company Distribution Only', {
      x: 50,
      y: 30,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`Page ${pageNum} of ${totalPages}`, {
      x: 480,
      y: 30,
      size: 9,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });
  };

  // PAGE 1: Overview, Eligibility & Onboarding
  const page1 = pdfDoc.addPage([600, 800]);
  addHeaderFooter(page1, 1, 4, 'Section 1: General Employment & Eligibility');

  page1.drawText('1. GENERAL EMPLOYMENT POLICIES & ELIGIBILITY', {
    x: 50,
    y: 700,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  const p1Lines = [
    { text: '1.1 Probationary Timeline and Review Milestones', isHeader: true },
    { text: 'All newly hired regular full-time employees are subject to a mandatory 90-calendar-day probationary period starting from their official commencement date. An initial 45-day check-in is conducted by the department manager, followed by a formal 90-day comprehensive evaluation.', isHeader: false },
    { text: '1.2 Core Benefits Eligibility', isHeader: true },
    { text: 'Employees become fully eligible for health, dental, and vision insurance on the 30th calendar day of active employment. Group term life insurance coverage ($100,000 baseline) commences immediately upon day one of hire.', isHeader: false },
    { text: '1.3 Paid Time Off (PTO) Accrual Schedule', isHeader: true },
    { text: 'Full-time staff accrue 1.67 days of paid time off per calendar month worked (equivalent to 20 business days per annum). Up to 5 unused PTO days may roll over into the subsequent calendar year, expiring on March 31st of that subsequent year if unused.', isHeader: false },
    { text: '1.4 Standard Working Hours and Core Collaboration Window', isHeader: true },
    { text: 'Standard full-time working hours constitute 40 hours per workweek. To facilitate cross-timezone synchronization, all team members regardless of location must observe core collaboration hours between 10:00 AM and 3:00 PM Eastern Standard Time (EST).', isHeader: false },
  ];

  let yOffset = 660;
  for (const item of p1Lines) {
    if (item.isHeader) {
      yOffset -= 15;
      page1.drawText(item.text, { x: 50, y: yOffset, size: 12, font: fontBold, color: rgb(0.15, 0.2, 0.35) });
      yOffset -= 18;
    } else {
      // Split into wrapped lines
      const words = item.text.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = fontRegular.widthOfTextAtSize(testLine, 10);
        if (width > 500) {
          page1.drawText(currentLine, { x: 50, y: yOffset, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          yOffset -= 14;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page1.drawText(currentLine, { x: 50, y: yOffset, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        yOffset -= 16;
      }
    }
  }

  // PAGE 2: Travel & Expense Policy
  const page2 = pdfDoc.addPage([600, 800]);
  addHeaderFooter(page2, 2, 4, 'Section 2: Travel, Lodging & Meal Per Diems');

  page2.drawText('2. BUSINESS TRAVEL & EXPENSE GUIDELINES', {
    x: 50,
    y: 700,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  const p2Lines = [
    { text: '2.1 Domestic Meal Per Diem Limits', isHeader: true },
    { text: 'For all business-related travel within the continental United States, the maximum non-itemized daily meal per diem is capped at exactly $75 per day ($15 breakfast, $25 lunch, $35 dinner). Alcohol is explicitly excluded from standard per diem reimbursement.', isHeader: false },
    { text: '2.2 International Travel Allowances', isHeader: true },
    { text: 'International travel daily meal allowances are capped at $120 per day. Prior written authorization from the departmental Vice President is strictly required at least 14 days in advance of booking foreign flights or accommodations.', isHeader: false },
    { text: '2.3 Hotel and Lodging Caps', isHeader: true },
    { text: 'Hotel room accommodations must not exceed $250 per night (exclusive of municipal taxes and resort fees) for tier-1 metropolitan cities (e.g., New York, San Francisco, London) and $180 per night for all other locations.', isHeader: false },
    { text: '2.4 Receipt Documentation Requirements', isHeader: true },
    { text: 'Itemized receipts are mandatory for any individual business expenditure exceeding $25.00. Credit card statement summaries are not accepted as proof of purchase without corresponding merchant receipts.', isHeader: false },
  ];

  yOffset = 660;
  for (const item of p2Lines) {
    if (item.isHeader) {
      yOffset -= 15;
      page2.drawText(item.text, { x: 50, y: yOffset, size: 12, font: fontBold, color: rgb(0.15, 0.2, 0.35) });
      yOffset -= 18;
    } else {
      const words = item.text.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = fontRegular.widthOfTextAtSize(testLine, 10);
        if (width > 500) {
          page2.drawText(currentLine, { x: 50, y: yOffset, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          yOffset -= 14;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page2.drawText(currentLine, { x: 50, y: yOffset, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        yOffset -= 16;
      }
    }
  }

  // PAGE 3: Remote Work & Equipment Stipends
  const page3 = pdfDoc.addPage([600, 800]);
  addHeaderFooter(page3, 3, 4, 'Section 3: Remote Work, Hardware & Submission Deadlines');

  page3.drawText('3. REMOTE WORK AND HARDWARE STIPENDS', {
    x: 50,
    y: 700,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  const p3Lines = [
    { text: '3.1 Home Office Setup Stipend', isHeader: true },
    { text: 'Designated remote employees receive a one-time home office setup grant of $1,500. This fund covers ergonomic chairs, desks, monitors, and peripheral hardware. Equipment remains company property during the tenure of employment.', isHeader: false },
    { text: '3.2 Monthly Internet & Connectivity Reimbursement', isHeader: true },
    { text: 'Remote employees are entitled to a monthly internet connectivity stipend of exactly $80.00. To claim this benefit, a copy of the monthly ISP billing statement must be submitted through the finance portal.', isHeader: false },
    { text: '3.3 Expense Report Filing Deadlines', isHeader: true },
    { text: 'All expense reimbursement requests must be submitted within 15 business days following the calendar month in which the expense was incurred. Claims submitted between 16 and 30 days require secondary CFO approval. Claims exceeding 30 days are automatically forfeited.', isHeader: false },
    { text: '3.4 Hardware Refresh Lifecycle', isHeader: true },
    { text: 'Standard development workstations and laptops are upgraded every 36 months. Emergency replacement requests due to hardware failure must be filed with IT Support via ticket with manager endorsement.', isHeader: false },
  ];

  yOffset = 660;
  for (const item of p3Lines) {
    if (item.isHeader) {
      yOffset -= 15;
      page3.drawText(item.text, { x: 50, y: yOffset, size: 12, font: fontBold, color: rgb(0.15, 0.2, 0.35) });
      yOffset -= 18;
    } else {
      const words = item.text.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = fontRegular.widthOfTextAtSize(testLine, 10);
        if (width > 500) {
          page3.drawText(currentLine, { x: 50, y: yOffset, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          yOffset -= 14;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page3.drawText(currentLine, { x: 50, y: yOffset, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        yOffset -= 16;
      }
    }
  }

  // PAGE 4: Compliance, Approvals & Contact
  const page4 = pdfDoc.addPage([600, 800]);
  addHeaderFooter(page4, 4, 4, 'Section 4: Compliance & Approvals Matrix');

  page4.drawText('4. COMPLIANCE & ESCALATION MATRIX', {
    x: 50,
    y: 700,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  const p4Lines = [
    { text: '4.1 Expense Approval Tiers', isHeader: true },
    { text: 'Expenses under $500: Direct Team Lead approval. Expenses between $500 and $2,500: Department Director approval. Expenses exceeding $2,500: Department Vice President and Finance Director co-approval required prior to disbursement.', isHeader: false },
    { text: '4.2 Anti-Bribery and Gift Acceptance Limits', isHeader: true },
    { text: 'Employees may not accept gifts, gratuities, or promotional hospitality from clients or vendors exceeding $75 in aggregate annual value without prior compliance officer clearance.', isHeader: false },
    { text: '4.3 Key Contact Directory for Inquiries', isHeader: true },
    { text: 'For travel inquiries: travel-desk@apexglobal.internal. For benefits and healthcare: benefits@apexglobal.internal. For ethics hotline: ethics-officer@apexglobal.internal.', isHeader: false },
  ];

  yOffset = 660;
  for (const item of p4Lines) {
    if (item.isHeader) {
      yOffset -= 15;
      page4.drawText(item.text, { x: 50, y: yOffset, size: 12, font: fontBold, color: rgb(0.15, 0.2, 0.35) });
      yOffset -= 18;
    } else {
      const words = item.text.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = fontRegular.widthOfTextAtSize(testLine, 10);
        if (width > 500) {
          page4.drawText(currentLine, { x: 50, y: yOffset, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          yOffset -= 14;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page4.drawText(currentLine, { x: 50, y: yOffset, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        yOffset -= 16;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(destinationPath, pdfBytes);
  return pdfBytes.length;
}
