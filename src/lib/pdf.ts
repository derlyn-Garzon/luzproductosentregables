import jsPDF from 'jspdf';
import { EntregablePublicInfo } from './types';

export async function generateDeliverablePDF(deliverable: EntregablePublicInfo): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('VisuaLink — Reporte de Entregable', 15, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`ID de Documento: ${deliverable.id}`, 15, 28);

  // Client Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(15, 45, pageWidth - 30, 35, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('ENTREGABLE PREPARADO PARA:', 20, 53);

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(deliverable.cliente_nombre, 20, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Producto: ${deliverable.nombre_producto}`, 20, 71);
  doc.text(`Fecha Límite: ${deliverable.fecha_limite}`, pageWidth - 70, 71);

  // Description
  let currentY = 90;
  if (deliverable.descripcion_breve) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Descripción del Producto:', 15, currentY);

    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    const splitDesc = doc.splitTextToSize(deliverable.descripcion_breve, pageWidth - 30);
    doc.text(splitDesc, 15, currentY);
    currentY += splitDesc.length * 5 + 10;
  } else {
    currentY += 5;
  }

  // High Resolution Image Preview
  if (deliverable.imagen_url) {
    try {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Vista Previa del Producto Visual:', 15, currentY);
      currentY += 8;

      const imgWidth = pageWidth - 30; // 180mm
      const imgHeight = 110; // 110mm max box

      doc.addImage(
        deliverable.imagen_url,
        'JPEG',
        15,
        currentY,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      currentY += imgHeight + 15;
    } catch (e) {
      console.warn('Could not embed image into PDF', e);
    }
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Documento de entrega generado automáticamente por VisuaLink. Fecha de descarga: ${new Date().toLocaleDateString('es-ES')}`,
    15,
    pageHeight - 12
  );
  doc.text('Confidencial & Acceso Protegido', pageWidth - 60, pageHeight - 12);

  doc.save(`Entregable_${deliverable.cliente_nombre.replace(/\s+/g, '_')}_${deliverable.id}.pdf`);
}
