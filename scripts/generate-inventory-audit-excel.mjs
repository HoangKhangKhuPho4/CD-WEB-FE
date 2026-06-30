/**
 * Báo cáo + Excel kiểm kê — danh mục Laptop & Desktop (product_type_id = 12)
 * Chạy: node scripts/generate-inventory-audit-excel.mjs
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const feRoot = join(__dirname, "..");
const beDocs = join(feRoot, "..", "CD-WEB-BE", "docs");
const feDocs = join(feRoot, "docs");
const outName = "kiem-ke-laptop-desktop-full.xlsx";
const PRODUCT_TYPE_ID = 12;

function mysqlQuery(sql) {
  const raw = execSync(`mysql -u root -B -e "USE cd_web; ${sql.replace(/\n/g, " ")}"`, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const lines = raw.trim().split("\n").filter(Boolean);
  if (lines.length <= 1) return [];
  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const cols = line.split("\t");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

const serialItems = mysqlQuery(`
SELECT
  pi.id AS MaThietBi,
  COALESCE(NULLIF(TRIM(pi.serial_number), ''), NULLIF(TRIM(pi.imei), '')) AS Serial,
  pi.serial_number AS SerialNumber,
  pi.imei AS IMEI,
  pi.status AS TrangThai,
  COALESCE(pi.location, '') AS ViTriKho,
  p.id AS MaSanPham,
  p.name AS TenSanPham,
  pv.id AS MaBienThe,
  pv.sku_code AS SKU,
  pv.variant_name AS BienThe,
  pt.name AS DanhMuc
FROM product_items pi
JOIN product_variants pv ON pv.id = pi.variant_id
JOIN products p ON p.id = pv.product_id
JOIN product_types pt ON pt.id = p.product_type_id
WHERE pt.id = ${PRODUCT_TYPE_ID}
  AND (
    (pi.serial_number IS NOT NULL AND TRIM(pi.serial_number) <> '')
    OR (pi.imei IS NOT NULL AND TRIM(pi.imei) <> '')
  )
ORDER BY p.name, pv.sku_code, Serial;
`);

const variantStock = mysqlQuery(`
SELECT
  p.name AS TenSanPham,
  pv.sku_code AS SKU,
  pv.variant_name AS BienThe,
  pv.stock_quantity AS TonHeThong_KhongSerial,
  COUNT(pi.id) AS SoThietBiCoSerial,
  SUM(CASE WHEN pi.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS Serial_AVAILABLE
FROM products p
JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN product_items pi ON pi.variant_id = pv.id
WHERE p.product_type_id = ${PRODUCT_TYPE_ID}
GROUP BY p.id, p.name, pv.id, pv.sku_code, pv.variant_name, pv.stock_quantity
ORDER BY p.name, pv.sku_code;
`);

const summary = mysqlQuery(`
SELECT
  pt.name AS DanhMuc,
  COUNT(DISTINCT p.id) AS SoSanPham,
  COUNT(DISTINCT pv.id) AS SoBienThe,
  SUM(pv.stock_quantity) AS TongStockQuantity,
  COUNT(pi.id) AS TongProductItems,
  SUM(CASE WHEN pi.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS ProductItems_AVAILABLE,
  SUM(CASE WHEN (pi.serial_number IS NOT NULL AND TRIM(pi.serial_number) <> '')
            OR (pi.imei IS NOT NULL AND TRIM(pi.imei) <> '') THEN 1 ELSE 0 END) AS CoMaSerial
FROM product_types pt
JOIN products p ON p.product_type_id = pt.id
JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN product_items pi ON pi.variant_id = pv.id
WHERE pt.id = ${PRODUCT_TYPE_ID}
GROUP BY pt.id, pt.name;
`);

const availableRows = serialItems.filter((r) => r.TrangThai === "AVAILABLE");

const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.json_to_sheet(summary.length ? summary : [{ GhiChu: "Không có dữ liệu" }]),
  "TongQuan"
);

XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.json_to_sheet(
    serialItems.length ? serialItems : [{ GhiChu: "Không có thiết bị có Serial trong danh mục này" }]
  ),
  "TatCa_Serial_DanhMuc"
);

XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.json_to_sheet(
    availableRows.length
      ? availableRows
      : [{ GhiChu: "Không có thiết bị AVAILABLE có Serial" }]
  ),
  "AVAILABLE_KiemKe"
);

XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([
    ["Serial"],
    ...availableRows.map((r) => [r.Serial]),
  ]),
  "Chi_Serial_IMPORT"
);

XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.json_to_sheet(variantStock),
  "BienThe_TonVsSerial"
);

for (const dir of [beDocs, feDocs]) {
  mkdirSync(dir, { recursive: true });
  XLSX.writeFile(wb, join(dir, outName));
}

const reportMd = `# Báo cáo Serial — Laptop & Desktop (id=${PRODUCT_TYPE_ID})

Tạo lúc: ${new Date().toISOString()}

## Tổng quan

| Chỉ số | Giá trị |
|--------|---------|
| Sản phẩm trong danh mục | ${summary[0]?.SoSanPham ?? "—"} |
| Biến thể (SKU) | ${summary[0]?.SoBienThe ?? "—"} |
| Tổng \`stock_quantity\` (sổ sách, không serial) | ${summary[0]?.TongStockQuantity ?? "—"} |
| **Thiết bị có mã Serial (\`product_items\`)** | **${summary[0]?.CoMaSerial ?? serialItems.length}** |
| Trong đó AVAILABLE (kiểm kê serial) | ${summary[0]?.ProductItems_AVAILABLE ?? availableRows.length} |

## Lưu ý quan trọng

Kiểm kê kho theo danh mục **chỉ đối chiếu \`product_items\` có Serial/IMEI trạng thái AVAILABLE**.
Các SKU có \`stock_quantity\` cao nhưng **chưa nhập serial** (PO receive / IMEI) sẽ **không** nằm trong phiếu kiểm kê serial.

## Danh sách đầy đủ ${serialItems.length} thiết bị có Serial

| # | Serial | Trạng thái | Sản phẩm | SKU | Biến thể |
|---|--------|------------|----------|-----|----------|
${serialItems
  .map(
    (r, i) =>
      `| ${i + 1} | ${r.Serial} | ${r.TrangThai} | ${r.TenSanPham} | ${r.SKU} | ${r.BienThe} |`
  )
  .join("\n")}

## Biến thể: tồn sổ sách vs số serial thực tế

| Sản phẩm | SKU | stock_quantity | Có serial | AVAILABLE |
|----------|-----|----------------|-----------|-----------|
${variantStock
  .map(
    (r) =>
      `| ${r.TenSanPham} | ${r.SKU} | ${r.TonHeThong_KhongSerial} | ${r.SoThietBiCoSerial} | ${r.Serial_AVAILABLE} |`
  )
  .join("\n")}
`;

writeFileSync(join(beDocs, "BAO_CAO_SERIAL_LAPTOP_DESKTOP.md"), reportMd, "utf8");

console.log(`Đã tạo ${outName} + BAO_CAO_SERIAL_LAPTOP_DESKTOP.md`);
console.log(`Serial trong danh mục: ${serialItems.length} | AVAILABLE: ${availableRows.length}`);
console.log(`stock_quantity tổng (không = serial): ${summary[0]?.TongStockQuantity ?? "?"}`);
