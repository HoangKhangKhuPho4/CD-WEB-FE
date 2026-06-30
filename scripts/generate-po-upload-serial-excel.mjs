/**
 * Tạo file Excel ~50 mã Serial để test upload PO / IMEI.
 * Chạy: node scripts/generate-po-upload-serial-excel.mjs
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const feRoot = join(__dirname, "..");
const beDocs = join(feRoot, "..", "CD-WEB-BE", "docs");
const outName = "test-po-upload-serial-50.xlsx";
const COUNT = 50;

function makeSerial(index) {
  const n = String(index).padStart(6, "0");
  return `BK26SN${n}`;
}

mkdirSync(beDocs, { recursive: true });

const rows = [
  ["STT", "Serial", "Ghi chú"],
  ...Array.from({ length: COUNT }, (_, i) => {
    const idx = i + 1;
    return [idx, makeSerial(idx), `Mã test upload PO #${idx}`];
  }),
];

const sheet = XLSX.utils.aoa_to_sheet(rows);
sheet["!cols"] = [{ wch: 6 }, { wch: 18 }, { wch: 28 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, sheet, "DanhSach_Serial");

const outPath = join(beDocs, outName);
XLSX.writeFile(wb, outPath);

console.log(`Đã tạo ${COUNT} mã Serial → ${outPath}`);
