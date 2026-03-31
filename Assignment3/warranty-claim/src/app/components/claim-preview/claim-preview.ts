import {
  Component, Input, OnInit,
  Output, EventEmitter,
  ViewChild, ElementRef,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaimService } from '../../core/services/claim';
import { Claim } from '../../models/claim.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs`;

@Component({
  selector: 'app-claim-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './claim-preview.html',
  styleUrl: './claim-preview.css'
})
export class ClaimPreviewComponent implements OnInit {
  @Input() claimId: string = '';
  @Output() close = new EventEmitter<void>();
  @ViewChild('pdfCanvas') pdfCanvas!: ElementRef<HTMLCanvasElement>;

  claim = signal<Claim | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(private claimService: ClaimService) {}

  ngOnInit() {
    console.log('Preview ngOnInit called, claimId:', this.claimId);
    if (this.claimId) {
      this.claimService.getClaimById(this.claimId).subscribe({
        next: (data: any) => {
          console.log('Claim data received:', data);
          this.claim.set(data);
          this.loading.set(false);
          setTimeout(() => this.renderPdfToCanvas(), 200);
        },
        error: (err: any) => {
          console.log('Preview error:', err);
          this.error.set('Failed to load claim details.');
          this.loading.set(false);
        }
      });
    }
  }

  closePreview() {
    this.close.emit();
  }

  buildPdf(): jsPDF {
    const doc = new jsPDF();
    const claim = this.claim()!;
    const jobDetails = claim.jobCartId?.jobDetails || [];

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CREDIT NOTE – WARRANTY CLAIM', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Issuer (Supplier):', 14, 35);
    doc.text('Keestrack NV', 14, 41);
    doc.text('Kazernelaan 161', 14, 47);
    doc.text('3530 Houthalen-Helchteren, Belgium', 14, 53);
    doc.text('VAT No.: BE 0421.595.849', 14, 59);
    doc.text('Contact: +32 (0)89 515 866', 14, 65);
    doc.text('info@keestrack.net', 14, 71);

    doc.text(`Credit Note No.: ${claim.creditNoteRef || 'N/A'}`, 120, 35);
    doc.text(`Date: ${this.formatDate(claim.claimSubmissionDate)}`, 120, 41);
    doc.text(`Original Dealer Invoice No.: ${claim.originalInvoice1 || 'DL-YYYY-XXX'}`, 120, 47);
    doc.text(`Warranty Claim Ref.: ${claim.claimNo}`, 120, 53);

    doc.setFont('helvetica', 'bold');
    doc.text('Issued To (Dealer/Distributor):', 14, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`${claim.dealerInfo?.name || 'N/A'}`, 14, 91);
    doc.text(`${claim.dealerInfo?.address || 'N/A'}`, 14, 97);
    const city = claim.dealerInfo?.city || '';
    const country = claim.dealerInfo?.stateOrCountry || '';
    if (city || country) {
      doc.text(`${city} ${country}`.trim(), 14, 103);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Reason for Credit Note:', 14, 115);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Warranty reimbursement for spare parts and service costs supplied by dealer to end customer.',
      14, 121, { maxWidth: 180 }
    );

   const tableRows: any[] = [];
const partsReplaced = (claim as any).partsReplaced || [];

if (partsReplaced.length > 0) {
  partsReplaced.forEach((part: any) => {
    tableRows.push([
      claim.claimNo,
      part.partNo || 'N/A',           // ← correct field
      part.partDescription || 'N/A',  // ← correct field
      part.qtyReplaced || 0,          // ← correct field
      `€${parseFloat(part.unitPrice || 0).toFixed(2)}`,
      `€${parseFloat(part.totalPrice || part.approvedAmount || 0).toFixed(2)}`,// ← correct field
      part.approvalStatus || claim.warrantyStatus
    ]);
  });
}else {
  // ── Fallback to jobDetails ──
  jobDetails.forEach((job: any) => {
    job.partsUsed?.forEach((part: any) => {
      tableRows.push([
        claim.claimNo,
        part.partId || part.partName || 'N/A',
        part.partName || 'N/A',
        part.quantity || 0,
        `€${parseFloat(part.unitPrice || 0).toFixed(2)}`,
        `€${parseFloat(part.totalPrice || part.approvedAmount || 0).toFixed(2)}`,
        claim.warrantyStatus
      ]);
    });
  });
}

if (tableRows.length === 0) {
  tableRows.push([
    claim.claimNo, 'N/A', 'N/A', 0, '€0.00', '€0.00', claim.warrantyStatus
  ]);
}

    autoTable(doc, {
      startY: 132,
      head: [['Claim Ref', 'Part No.', 'Description', 'Qty', 'Unit Price (€)', 'Total (€)', 'Warranty Status']],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0 },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'normal');
    doc.text(
      `Total Approved amount is €${claim.totalClaimAmount || 0} and total rejected amount is €0`,
      14, finalY
    );
    doc.text(`Net Amount: €${claim.totalClaimAmount || '0.00'}`, 195, finalY + 14, { align: 'right' });
    doc.text(`VAT (21% – BE): €${((claim.totalClaimAmount || 0) * 0.21).toFixed(2)}`, 195, finalY + 20, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Total Credit Amount: €${((claim.totalClaimAmount || 0) * 1.21).toFixed(2)}`,
      195, finalY + 26, { align: 'right' }
    );

    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, finalY + 40);
    doc.setFont('helvetica', 'normal');
    doc.text('- Issued under Keestrack global warranty policy.', 14, finalY + 46);
    doc.text('- Credit note reimburses dealer for warranty costs already borne.', 14, finalY + 52);
    doc.text('- This credit will be offset against future spare parts/service invoices.', 14, finalY + 58);

    doc.setFont('helvetica', 'bold');
    doc.text('Authorized Signatory – Keestrack NV', 14, finalY + 72);

    return doc;
  }

async renderPdfToCanvas() {
  try {
    const doc = this.buildPdf();
    const pdfData = doc.output('arraybuffer');

    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;

    const page = await pdf.getPage(1);
    const canvas = this.pdfCanvas.nativeElement;
    const context = canvas.getContext('2d')!;

    // ── High resolution scale for clear reading ──
    const scale = 3.0;
    const viewport = page.getViewport({ scale });

    // ── Set actual canvas pixel size ──
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // ── Display size fits modal ──
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    }).promise;

    console.log('PDF rendered successfully!');
  } catch (err) {
    console.error('PDF render error:', err);
  }
} 
  downloadPDF() {
    const doc = this.buildPdf();
    doc.save(`credit-note-${this.claim()?.claimNo}.pdf`);
  }

  downloadCWR() {
    const claim = this.claim()!;
    const customer = claim.jobCartId?.ticketId?.customer;
    const machine = claim.jobCartId?.ticketId?.machine;
    const jobDetails = claim.jobCartId?.jobDetails || [];
const partsReplaced = (claim as any).partsReplaced || [];
const part = partsReplaced[0] || jobDetails[0]?.partsUsed?.[0];
    const rows = [
      ['CWR No.', claim.cwrNo || 'N/A'],
      ['Date', this.formatDate(claim.claimSubmissionDate)],
      ['Dealer Name', claim.dealerInfo?.name || 'N/A'],
      ['Dealer Code', ''],
      ['Customer Name', customer?.companyName || 'N/A'],
      ['Machine Model', machine?.modelType || 'N/A'],
      ['Machine Serial', machine?.serialNumber || 'N/A'],
      ['Operating Hours', `${claim.operatingHours || 0} hrs`],
      ['Failure Date', this.formatDate(claim.failureDate)],
      ['Claim Submission', this.formatDate(claim.claimSubmissionDate)],
    ['Part No.', part?.partNo || 'N/A'],
['Part Description', part?.partDescription || 'N/A'],
['Qty Replaced', part?.qtyReplaced || 0],
['Unit Price (€)', parseFloat(part?.unitPrice || 0).toFixed(2)],
['Total (€) for Part', parseFloat(part?.totalPrice || part?.approvedAmount || 0).toFixed(2)],
      ['Labor Hours Claimed', claim.laborHoursClaimed || 0],
      ['Labor Rate (€)', claim.laborRate || 0],
      ['Labor Total (€)', claim.laborTotal || 0],
      ['Travel/Other Costs', claim.travelOtherCosts || 0],
      ['Total Claim Amount', claim.totalClaimAmount || 0],
      ['Total Amount Approved', claim.totalClaimAmount || 0],
      ['Total Amount Rejected', 0],
      ['Failure Description', claim.failureDescription || 'N/A'],
      ['Corrective Action', claim.correctiveAction || 'N/A'],
      ['Warranty Status', claim.warrantyStatus || 'N/A'],
      ['Credit Note Ref', claim.creditNoteRef || 'N/A']
    ];

    const csvContent = rows
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CWR-${claim.cwrNo || claim.claimNo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}