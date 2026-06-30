import * as XLSX from "xlsx";

const SERIAL_HEADER_RE =
  /serial|imei|mã|ma[\s._-]?quet|barcode|sn\b|so[\s._-]?serial|mã[\s._-]?thiết[\s._-]?bị/i;

const ACCEPTED_EXT = /\.(xlsx|xls|csv)$/i;

export interface ParseSerialsExcelResult {
  codes: string[];
  sheetName: string;
  columnLabel: string;
  skippedEmpty: number;
}

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return String(value).trim();
}

function looksLikeSerial(value: string): boolean {
  if (!value) return false;
  if (value.length < 4) return false;
  if (/^(serial|imei|sku|stt|no\.?|#)$/i.test(value)) return false;
  return true;
}

function findSerialColumnIndex(headerRow: string[]): number {
  const idx = headerRow.findIndex((h) => SERIAL_HEADER_RE.test(h));
  if (idx >= 0) return idx;

  let bestIdx = 0;
  let bestScore = -1;
  for (let c = 0; c < headerRow.length; c++) {
    const sample = headerRow[c];
    if (looksLikeSerial(sample) && sample.length > bestScore) {
      bestScore = sample.length;
      bestIdx = c;
    }
  }
  return bestIdx;
}

function sheetToMatrix(sheet: XLSX.WorkSheet): string[][] {
  const ref = sheet["!ref"];
  if (!ref) return [];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  return rows.map((row) =>
    (Array.isArray(row) ? row : []).map((cell) => cellToString(cell))
  );
}

function extractFromMatrix(matrix: string[][]): {
  codes: string[];
  columnLabel: string;
  skippedEmpty: number;
} {
  if (matrix.length === 0) {
    return { codes: [], columnLabel: "—", skippedEmpty: 0 };
  }

  const firstRow = matrix[0] ?? [];
  const hasHeader = firstRow.some((c) => SERIAL_HEADER_RE.test(c));
  const dataStart = hasHeader ? 1 : 0;
  const headerRow = hasHeader ? firstRow : firstRow.map((_, i) => `Cột ${i + 1}`);
  const colIdx = findSerialColumnIndex(headerRow);

  const codes: string[] = [];
  const seen = new Set<string>();
  let skippedEmpty = 0;

  for (let r = dataStart; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const raw = cellToString(row[colIdx]);
    if (!raw) {
      skippedEmpty++;
      continue;
    }
    if (!looksLikeSerial(raw)) {
      skippedEmpty++;
      continue;
    }
    const code = raw;
    if (seen.has(code)) continue;
    seen.add(code);
    codes.push(code);
  }

  const columnLabel =
    headerRow[colIdx]?.trim() || `Cột ${String.fromCharCode(65 + colIdx)}`;

  return { codes, columnLabel, skippedEmpty };
}

/**
 * Đọc file Excel trên trình duyệt, trích danh sách Serial/IMEI.
 * File không được upload lên server — chỉ parse trong RAM rồi hủy.
 */
export async function parseSerialsFromExcelFile(
  file: File
): Promise<ParseSerialsExcelResult> {
  if (!ACCEPTED_EXT.test(file.name)) {
    throw new Error("Chỉ hỗ trợ file .xlsx, .xls hoặc .csv");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File quá lớn (tối đa 5MB)");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  let best: ParseSerialsExcelResult | null = null;

  for (const sheetName of workbook.SheetNames) {
    const matrix = sheetToMatrix(workbook.Sheets[sheetName]);
    const { codes, columnLabel, skippedEmpty } = extractFromMatrix(matrix);
    if (!best || codes.length > best.codes.length) {
      best = { codes, sheetName, columnLabel, skippedEmpty };
    }
  }

  if (!best || best.codes.length === 0) {
    throw new Error(
      "Không tìm thấy mã Serial/IMEI trong file. Đặt tiêu đề cột: Serial hoặc IMEI."
    );
  }

  return best;
}
