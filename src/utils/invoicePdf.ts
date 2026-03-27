
import jsPDF from "jspdf";
import { removeVietnameseDiacritics } from "./removeVietnameseDiacritics";

// 👇 dán đoạn base64 font vào đây
// import { font } from "./Roboto-Regular"; // Bỏ comment này nếu đã có file Roboto-Regular.ts
// file này bạn tạo từ tool convert

export function generateInvoicePDF({
  customerName,
  phone,
  email,
  identityCard,
  roomOrExperience,
  checkIn,
  checkOut,
  total,
  paymentMethod,
  createdAt,
}: {
  customerName: string;
  phone: string;
  email: string;
  identityCard: string;
  roomOrExperience: string;
  checkIn: string;
  checkOut: string;
  total: string;
  paymentMethod: string;
  createdAt: string;
}) {
  const doc = new jsPDF();

  // Nếu muốn dùng font Unicode, cần tạo file Roboto-Regular.ts và import vào. Nếu không, dùng font mặc định của jsPDF.

  doc.setFontSize(18);
  doc.text("INVOICE", 105, 20, { align: "center" });

  doc.setFontSize(12);

  let y = 40;
  const lineHeight = 8;

  // Nếu tên có dấu, in ra tên không dấu
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(customerName);
  const displayName = hasVietnamese ? removeVietnameseDiacritics(customerName) : customerName;
  const hasVietnameseRoom = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(roomOrExperience);
  const displayRoom = hasVietnameseRoom ? removeVietnameseDiacritics(roomOrExperience) : roomOrExperience;
  doc.text(`Customer: ${displayName}`, 20, y); y += lineHeight;
  doc.text(`Phone: ${phone}`, 20, y); y += lineHeight;
  doc.text(`Email: ${email}`, 20, y); y += lineHeight;
  doc.text(`Identity Card: ${identityCard}`, 20, y); y += lineHeight;
  doc.text(`Home/Experience: ${displayRoom}`, 20, y); y += lineHeight;
  doc.text(`Check-in: ${checkIn}`, 20, y); y += lineHeight;
  doc.text(`Check-out: ${checkOut}`, 20, y); y += lineHeight;
  doc.text(`Total: $${total}`, 20, y); y += lineHeight;
  doc.text(`Payment Method: ${paymentMethod}`, 20, y); y += lineHeight;
  doc.text(`Invoice Date: ${createdAt}`, 20, y);

  doc.save("invoice.pdf");
}