import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export async function generateCertificatePDF({
  attendeeName,
  eventName,
  date,
  verificationUrl,
}: {
  attendeeName: string;
  eventName: string;
  date: string;
  verificationUrl: string;
}): Promise<Blob> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  // Load a font
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Draw certificate title
  page.drawText("Certificate of Participation", {
    x: 100,
    y: 340,
    size: 28,
    font,
    color: rgb(0.2, 0.2, 0.6),
  });

  // Draw event name
  page.drawText(`Event: ${eventName}`, {
    x: 100,
    y: 290,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });

  // Draw attendee name
  page.drawText(`Awarded to: ${attendeeName}`, {
    x: 100,
    y: 250,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });

  // Draw date
  page.drawText(`Date: ${date}`, {
    x: 100,
    y: 210,
    size: 16,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 120 });
  const qrImageBytes = await fetch(qrDataUrl).then((res) => res.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  page.drawImage(qrImage, {
    x: 420,
    y: 180,
    width: 120,
    height: 120,
  });

  // Add verification text
  page.drawText("Scan to verify", {
    x: 440,
    y: 170,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  // Return as a Blob
  return new Blob([pdfBytes], { type: "application/pdf" });
}
