import { jsPDF } from 'jspdf';

export interface ProductReceiptData {
  reference: string;
  status: string;
  payment_status: string;
  total_price: number;
  delivery_method: 'walk_in' | 'delivery' | string;
  delivery_fee: number;
  customer_name: string;
  created_at: string;
  items: { product_name: string; price: number; quantity: number }[];
}

export function useProductReceipt() {
  const generatePDF = (order: ProductReceiptData, bankName = 'Moniepoint', accountNumber = '5308789513', accountName = 'Fargo Unisex Salon and Spa') => {
    if (!order?.reference) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // === HEADER ===
    doc.setFillColor(26, 22, 18); // ink-900
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setFillColor(184, 90, 78); // rose-500
    doc.rect(0, 50, pageWidth, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(250, 247, 242); // cream-50
    doc.text('FARGO', margin, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(176, 161, 146); // ink-300
    doc.text('UNISEX SALON & SPA', margin, 30);

    doc.setFontSize(8);
    doc.setTextColor(138, 119, 102); // ink-400
    doc.text('PAYMENT RECEIPT', pageWidth - margin, 22, { align: 'right' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(250, 247, 242);
    doc.text(order.reference, pageWidth - margin, 32, { align: 'right' });

    // === BODY ===
    let y = 62;

    // Confirmed badge
    doc.setFillColor(22, 163, 74); // green
    doc.roundedRect(margin, y, 40, 8, 1, 1, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CONFIRMED', margin + 20, y + 5.5, { align: 'center' });
    y += 16;

    // Customer + summary
    doc.setFillColor(245, 240, 232); // cream-100
    doc.roundedRect(margin, y, contentWidth, 40, 2, 2, 'F');
    y += 8;

    const leftCol = margin + 6;
    const rightCol = margin + contentWidth / 2 + 6;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(138, 119, 102);
    doc.text('CUSTOMER', leftCol, y);
    doc.text('DELIVERY', rightCol, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 22, 18);
    doc.text(order.customer_name || 'N/A', leftCol, y);
    doc.text(order.delivery_method === 'delivery' ? 'Home Delivery' : 'Salon Pickup', rightCol, y);
    y += 12;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(138, 119, 102);
    doc.text('DATE', leftCol, y);
    doc.text('PAYMENT', rightCol, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 22, 18);
    doc.text(order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A', leftCol, y);
    doc.text('Bank Transfer', rightCol, y);
    y += 16;

    // Items table
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(138, 119, 102);
    doc.text('ITEMS', leftCol, y);
    y += 5;

    doc.setFillColor(245, 240, 232);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 22, 18);
    doc.text('Item', leftCol, y + 8);
    doc.text('Qty', rightCol, y + 8, { align: 'right' });
    doc.text('Amount', margin + contentWidth, y + 8, { align: 'right' });
    y += 20;

    doc.setTextColor(26, 22, 18);
    doc.setFont('helvetica', 'normal');
    const itemRows = order.items?.length ? order.items : [];
    for (const item of itemRows) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(9);
      const nameLines = doc.splitTextToSize(item.product_name, contentWidth / 2);
      doc.text(nameLines, leftCol, y);
      doc.text(String(item.quantity), rightCol, y, { align: 'right' });
      doc.text(`₦${(item.price * item.quantity).toLocaleString()}`, margin + contentWidth, y, { align: 'right' });
      y += nameLines.length * 4.5 + 5;
    }

    // Totals
    y += 4;
    const totalX = margin + contentWidth;
    const subTotal = order.total_price - (order.delivery_fee || 0);
    if (order.delivery_fee > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 90, 74);
      doc.text('Subtotal', totalX, y, { align: 'right' });
      doc.text(`₦${subTotal.toLocaleString()}`, totalX, y + 4, { align: 'right' });
      y += 8;
      doc.text('Delivery', totalX, y, { align: 'right' });
      doc.text(`₦${order.delivery_fee.toLocaleString()}`, totalX, y + 4, { align: 'right' });
      y += 9;
    }
    doc.setDrawColor(184, 90, 78);
    doc.line(totalX - 50, y - 1, totalX, y - 1);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(26, 22, 18);
    doc.text('Total', totalX, y, { align: 'right' });
    doc.text(`₦${order.total_price.toLocaleString()}`, totalX, y + 5, { align: 'right' });
    y += 14;

    // Payment status note
    doc.setFillColor(220, 252, 231); // green-50
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
    doc.setDrawColor(22, 163, 74);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'S');
    y += 7;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text('PAYMENT CONFIRMED', leftCol, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text('Thank you for your purchase. Show this receipt or your reference when picking up / on delivery.', leftCol, y);

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
    doc.text('Bank transfer — Moniepoint 5308789513 (Fargo Unisex Salon and Spa)', margin, footerY + 28);

    doc.save(`Fargo_Receipt_${order.reference}.pdf`);
  };

  return { generatePDF };
}