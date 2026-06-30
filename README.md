# Bảo Khang Gadget — Frontend (CD-WEB-FE)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.12-764ABC?logo=redux)](https://redux-toolkit.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/HoangKhangKhuPho4/CD-WEB-BE/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/HoangKhangKhuPho4/CD-WEB-FE/ci.yml?branch=main&label=CI&logo=github)](https://github.com/HoangKhangKhuPho4/CD-WEB-FE/actions)

> **Giao diện web** cho nền tảng thương mại điện tử **Bảo Khang Gadget** — storefront mua sắm công nghệ và **khu vực quản trị** phân quyền (Admin / Sales / Warehouse), kết nối REST API Spring Boot.

📘 **Tài liệu dự án đầy đủ (BE + kiến trúc tổng thể):** [CD-WEB-BE README](https://github.com/HoangKhangKhuPho4/CD-WEB-BE/blob/main/README.md)

---

## 1. Tên dự án & Thông tin cốt lõi

| Hạng mục | Nội dung |
|----------|----------|
| **Tên thương hiệu** | **Bảo Khang Gadget** |
| **Repository này** | Frontend — Next.js App Router |
| **Mô tả ngắn** | Website TMĐT bán thiết bị công nghệ chính hãng: duyệt SP, giỏ hàng, thanh toán, tra cứu bảo hành; admin quản lý đơn, kho, nhân viên & phân quyền. |
| **Mã đồ án** | Website Thương Mại Điện Tử |

### Thành viên nhóm (2 người)

| MSSV | Họ tên | Vai trò | Liên kết |
|------|--------|---------|----------|
| 22130116 | **Nguyễn Lê Hoàng Khang** | Trưởng nhóm · Backend Developer | [GitHub @HoangKhangKhuPho4](https://github.com/HoangKhangKhuPho4) |
| 22130025 | **Phạm Thái Bảo** | Frontend Developer | _Cập nhật link GitHub cá nhân_ |

### Repository liên quan

| Thành phần | Repository |
|------------|------------|
| **Frontend (repo này)** | [CD-WEB-FE](https://github.com/HoangKhangKhuPho4/CD-WEB-FE) |
| **Backend (API)** | [CD-WEB-BE](https://github.com/HoangKhangKhuPho4/CD-WEB-BE) |

---

## 2. Tổng quan dự án (Live Demo & Ảnh minh họa)

### Demo

| Trang | URL (local) |
|-------|-------------|
| **Storefront** | [http://localhost:3000](http://localhost:3000) |
| **Admin panel** | [http://localhost:3000/admin](http://localhost:3000/admin) |
| **API (Backend)** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |
| **Production** | _Đang cập nhật — Vercel (FE)_ |

> Frontend **bắt buộc** backend đang chạy tại `NEXT_PUBLIC_API_BASE_URL` (mặc định `http://localhost:8080`).

### Ảnh minh họa

Thêm screenshot/GIF vào `docs/images/` trong repo này:

| Trang | Gợi ý file |
|-------|------------|
| Trang chủ | `docs/images/home.png` |
| Chi tiết sản phẩm | `docs/images/product-detail.png` |
| Giỏ hàng & Checkout | `docs/images/cart-checkout.png` |
| Admin Dashboard | `docs/images/admin-dashboard.png` |

```markdown
![Trang chủ](docs/images/home.png)
![Admin](docs/images/admin-dashboard.png)
```

### Mục đích (góc nhìn Frontend)

- **Storefront responsive:** trang chủ, danh mục, chi tiết SP, giỏ hàng, checkout.
- **Tìm kiếm thông minh:** autocomplete, lọc theo danh mục (kết nối API `/api/products/suggest`).
- **Xác thực người dùng:** đăng nhập, đăng ký, OAuth Google/Facebook, JWT lưu client-side.
- **Admin module hóa:** sidebar theo RBAC, dashboard, quản lý đơn / SP / kho / bảo hành / nhân viên.
- **Thương hiệu thống nhất:** cấu hình tập trung tại `src/config/brand.ts` (**Bảo Khang Gadget**).

---

## 3. Công nghệ sử dụng (Tech Stack)

### Frontend _(repo này)_

| Công nghệ | Vai trò |
|-----------|---------|
| **Next.js 16** | App Router, SSR/SSG, routing `/admin` |
| **React 19** | UI components |
| **TypeScript** | Type-safe codebase |
| **Tailwind CSS** | Styling, responsive |
| **Redux Toolkit** | Auth, cart, global state |
| **Axios** | HTTP client → REST API |
| **React Hot Toast** | Thông báo người dùng |
| **Swiper** | Carousel / slider |

### Backend & tích hợp _(CD-WEB-BE)_

- Spring Boot 3.2 · MySQL · Redis · JWT · RBAC
- VNPay · GHN · Email · Swagger OpenAPI

Chi tiết stack backend: [README Backend](https://github.com/HoangKhangKhuPho4/CD-WEB-BE/blob/main/README.md#3-công-nghệ-sử-dụng-tech-stack)

---

## 4. Các tính năng nổi bật (Features)

### Storefront — Khách hàng

- Trang chủ, danh mục, **tìm kiếm + gợi ý** sản phẩm.
- Chi tiết sản phẩm, đánh giá, wishlist.
- Giỏ hàng, checkout, chọn địa chỉ, phí ship GHN, mã giảm giá.
- Thanh toán VNPay / COD; lịch sử đơn hàng; tra cứu bảo hành (`/bao-hanh`).

### Admin Panel — `/admin`

| Module | Route gợi ý | Ghi chú |
|--------|-------------|---------|
| Tổng quan | `/admin` | Dashboard theo vai trò |
| Thống kê | `/admin/analytics` | Doanh thu (Admin) / Báo cáo bán hàng (Sales) |
| Đơn hàng | `/admin/orders` | Xác nhận, giao, tracking, gán IMEI |
| Sản phẩm | `/admin/products` | CRUD cơ bản |
| Kho / IMEI | `/admin/inventory`, `/admin/imei` | Nhập kho, serial |
| Bảo hành | `/admin/warranty` | Phiếu bảo hành |
| Khách hàng | `/admin/customers` | Danh sách (read-only) |
| Nhân viên & RBAC | `/admin/users` | Staff + phân quyền |
| CMS | `/admin/banners`, `/admin/posts` | Banner, bài viết |
| Cấu hình | `/admin/settings` | Hệ thống & AI |

**Phân quyền UI:** menu sidebar lọc theo permission (`adminNavConfig.ts`, `rbac` utils) — Admin / Sales / Warehouse thấy menu khác nhau.

---

## 5. Hướng dẫn cài đặt và chạy (Getting Started)

> **Hướng dẫn đầy đủ Backend + Frontend:** [CD-WEB-BE — HUONG_DAN_CAI_DAT.md](https://github.com/HoangKhangKhuPho4/CD-WEB-BE/blob/main/docs/HUONG_DAN_CAI_DAT.md)

### Yêu cầu hệ thống

- **Node.js** 20.x (khuyến nghị)
- **npm** 10+
- **Backend** [CD-WEB-BE](https://github.com/HoangKhangKhuPho4/CD-WEB-BE) đang chạy (port `8080`)
- **MySQL** + Redis _(phía backend)_

### Các bước

**1. Clone repository**

```bash
git clone https://github.com/HoangKhangKhuPho4/CD-WEB-FE.git
cd CD-WEB-FE
```

**2. Cài dependencies**

```bash
npm ci
```

**3. Cấu hình biến môi trường**

```bash
cp .env.local.example .env.local
```

Chỉnh `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=          # cùng OAuth client với BE
NEXT_PUBLIC_FACEBOOK_APP_ID=           # cùng App ID với BE
```

> **Không commit** `.env.local` lên GitHub.

**4. Chạy backend** _(terminal khác)_

```bash
cd CD-WEB-BE
mvn spring-boot:run
```

**5. Chạy frontend**

```bash
npm run dev
```

Mở trình duyệt: **http://localhost:3000**

### Scripts chính

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Development (HTTPS experimental) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | ESLint |

### Tài khoản demo

| Username | Vai trò | Ghi chú |
|----------|---------|---------|
| `admin` | Quản trị viên | Mật khẩu theo DB nhóm (Postman: `admin123`) |
| `sales` | Nhân viên bán hàng | |
| `warehouse` | Nhân viên kho | |
| `luutien` | Khách hàng test | Postman: `123456` |

Đăng nhập: **http://localhost:3000/signin** → redirect `/admin` nếu có quyền staff.

Xem thêm: [Hướng dẫn cài đặt đầy đủ (BE)](https://github.com/HoangKhangKhuPho4/CD-WEB-BE/blob/main/docs/HUONG_DAN_CAI_DAT.md).

---

## 6. Cấu trúc thư mục (Project Structure)

```text
📦 CD-WEB-FE/
├── 📂 src/
│   ├── 📂 app/                      # Next.js App Router
│   │   ├── 📂 (site)/               # Storefront (layout công khai)
│   │   └── 📂 admin/                # Khu vực quản trị
│   ├── 📂 components/
│   │   ├── 📂 Header/               # Header, search, autocomplete
│   │   ├── 📂 Admin/                # Sidebar, dashboard, modules
│   │   ├── 📂 Shop*/                # Listing, detail, cart, checkout
│   │   └── 📂 Auth/                 # Sign in / sign up
│   ├── 📂 redux/                    # Store, auth-slice, cart, …
│   ├── 📂 utils/
│   │   ├── adminApi.ts              # Client API admin
│   │   ├── api.ts                   # Client API storefront
│   │   └── rbac.ts                  # Permission helpers
│   ├── 📂 config/
│   │   └── brand.ts                 # Bảo Khang Gadget branding
│   └── 📂 types/                    # TypeScript definitions
├── 📂 public/
│   └── 📂 images/logo/              # Logo thương hiệu
├── 📂 docs/images/                  # Screenshot README (tự thêm)
├── 📜 .env.local.example
├── 📜 package.json
└── 📜 README.md
```

### Luồng kết nối API

```text
Browser (Next.js)  ──Axios──▶  http://localhost:8080/api/...
                                    │
                                    └── Spring Boot (CD-WEB-BE)
```

- Storefront: `src/utils/api.ts`, `productApi.ts`, `authApi.ts`, …
- Admin: `src/utils/adminApi.ts` (statistics, orders, products, RBAC, …)

---

## 7. Phân công công việc (Contribution)

### Phạm Thái Bảo — Frontend Developer

- Thiết kế **UI/UX** storefront & admin (Tailwind, responsive).
- Xây dựng **component module** (Header search, Admin sidebar, dashboard widgets).
- Kết nối **REST API** (Axios), xử lý auth JWT, refresh token.
- **Redux** — giỏ hàng, phiên đăng nhập, state admin.
- **RBAC phía client** — ẩn/hiện menu & nút thao tác theo quyền.
- CI GitHub Actions (lint + build), tối ưu luồng checkout & admin orders.

### Nguyễn Lê Hoàng Khang — Backend · Trưởng nhóm

- REST API, database, bảo mật JWT/RBAC, thanh toán, GHN, thống kê.
- Swagger, seed dữ liệu, tài liệu API backend.

### Quy trình Git

1. Tạo nhánh feature từ `main`
2. Mở **Pull Request** → CI chạy `lint` + `build`
3. Review & merge khi CI xanh

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## 8. Lộ trình phát triển tương lai (Future Enhancements)

- [ ] Màn **đặt hộ khách (POS)** cho Sales trên admin.
- [ ] Trang **CRM khách hàng** — chi tiết, lịch sử mua, ghi chú.
- [ ] Admin: quản lý **variant & gallery ảnh** sản phẩm đầy đủ.
- [ ] Trang **so sánh thông số** kỹ thuật sản phẩm.
- [ ] Deploy **Vercel** (FE) + production API; thêm screenshot README.
- [ ] Dark mode admin, PWA, tối ưu Lighthouse.

---

## 9. Giấy phép và Liên hệ (License & Contact)

### License

Dự án thuộc nhóm phát hành theo **[MIT License](https://github.com/HoangKhangKhuPho4/CD-WEB-BE/blob/main/LICENSE)** (file LICENSE tại repo backend).

### Liên hệ

| Thành viên | Email / LinkedIn |
|------------|------------------|
| Nguyễn Lê Hoàng Khang | _Cập nhật_ |
| Phạm Thái Bảo | _Cập nhật_ |

### Tài liệu liên quan

- [README Backend (đầy đủ)](https://github.com/HoangKhangKhuPho4/CD-WEB-BE/blob/main/README.md)
- [API Documentation](https://github.com/HoangKhangKhuPho4/CD-WEB-BE/blob/main/docs/API_Documentation.md)
- [Backend Status](https://github.com/HoangKhangKhuPho4/CD-WEB-BE/blob/main/docs/BACKEND_STATUS.md)

---

<p align="center">
  <strong>Bảo Khang Gadget</strong> — Công nghệ & phụ kiện chính hãng<br/>
  <em>Frontend · CD-WEB-FE · Nhóm 2 thành viên</em>
</p>
