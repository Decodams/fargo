import { jsPDF } from 'jspdf';
import { useLocation } from 'react-router-dom';

export function useBookingTicket() {
  const { state } = useLocation();
  const { reference, name, services, date, mode, total, prepay, bank_name, account_number, account_name } = state || {};

  const generatePDF = () => {
    if (!reference || !name) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // === HEADER ===
    doc.setFillColor(26, 22, 18); // ink-900
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Accent line
    doc.setFillColor(184, 90, 78); // rose-500
    doc.rect(0, 50, pageWidth, 2, 'F');

    // Company name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(250, 247, 242); // cream-50
    doc.text('FARGO', margin, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(176, 161, 146); // ink-300
    doc.text('UNISEX SALON & SPA', margin, 30);

    // Booking label right-aligned
    doc.setFontSize(8);
    doc.setTextColor(138, 119, 102); // ink-400
    doc.text('BOOKING CONFIRMATION', pageWidth - margin, 22, { align: 'right' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(250, 247, 242);
    doc.text(reference, pageWidth - margin, 32, { align: 'right' });

    // === BODY ===
    let y = 62;

    // Status badge
    const statusLabel = prepay ? 'PAYMENT PENDING' : 'CONFIRMED';
    const statusColor: [number, number, number] = prepay ? [217, 119, 6] : [22, 163, 74];
    doc.setFillColor(...statusColor);
    doc.roundedRect(margin, y, 42, 8, 1, 1, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(statusLabel, margin + 21, y + 5.5, { align: 'center' });
    y += 16;

    // Section: Booking Details
    doc.setFillColor(245, 240, 232); // cream-100
    doc.roundedRect(margin, y, contentWidth, 58, 2, 2, 'F');
    y += 8;

    const leftCol = margin + 6;
    const rightCol = margin + contentWidth / 2 + 6;

    // Row 1: Customer & Date
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(138, 119, 102);
    doc.text('CUSTOMER', leftCol, y);
    doc.text('DATE & TIME', rightCol, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 22, 18);
    doc.text(name, leftCol, y);
    const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    doc.text(`${formattedDate}  ${formattedTime}`, rightCol, y);
    y += 12;

    // Row 2: Mode & Payment
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(138, 119, 102);
    doc.text('SERVICE MODE', leftCol, y);
    doc.text('PAYMENT', rightCol, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 22, 18);
    doc.text(mode === 'in_salon' ? 'In Salon' : 'Home Service', leftCol, y);
    doc.text(`₦${total?.toLocaleString()} (${prepay ? 'Bank Transfer' : 'Pay After'})`, rightCol, y);
    y += 14;

    // Services list
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(138, 119, 102);
    doc.text('SERVICES', leftCol, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 22, 18);
    const servicesText = services?.join('  ·  ') || 'N/A';
    const lines = doc.splitTextToSize(servicesText, contentWidth - 12);
    doc.text(lines, leftCol, y);
    y += lines.length * 4 + 10;

    // === PAYMENT DETAILS (for bank transfer) ===
    if (prepay) {
      y += 4;
      doc.setFillColor(254, 243, 199); // amber-50
      doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'F');
      doc.setDrawColor(251, 191, 36); // amber-400
      doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'S');
      y += 7;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('BANK TRANSFER DETAILS', leftCol, y);
      y += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(113, 63, 18);
      doc.text(`${bank_name || 'Moniepoint'}  |  Acct: ${account_number || '5308789513'}  |  ${account_name || 'Fargo Unisex Salon and Spa'}`, leftCol, y);
      y += 5;
      doc.setFontSize(7);
      doc.setTextColor(161, 98, 7);
      doc.text('Please present this ticket or reference number upon arrival.', leftCol, y);
    }

    // === FOOTER ===
    const footerY = 262;
    doc.setFillColor(26, 22, 18);
    doc.rect(0, footerY, pageWidth, 35, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(176, 161, 146);
    doc.text('FARGO UNISEX SALON & SPA', margin, footerY + 8);
    doc.text('No 8 Dr Billy Okoye Boulevard By Revenue House/Immigration Awka Anambra State', margin, footerY + 14);
    doc.text('Phone: 09012101020  |  Email: Fargounisexsalon@gmail.com', margin, footerY + 20);
    doc.setTextColor(107, 90, 74);
    doc.text('Thank you for choosing Fargo. See you soon.', margin, footerY + 28);

    doc.save(`Fargo_Booking_${reference}.pdf`);
  };

  return { generatePDF };
}
