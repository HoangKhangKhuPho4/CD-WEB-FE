# CD-WEB-FE

Frontend eCommerce sử dụng Next.js (App Router), TypeScript và Tailwind CSS.

## Yeu cau he thong

- Node.js 20.x (khuyen nghi)
- npm 10+

## Cai dat va chay local

1. Cai dependencies

```bash
npm ci
```

2. Chay moi truong development

```bash
npm run dev
```

3. Mo trinh duyet tai dia chi

```text
http://localhost:3000
```

## Scripts chinh

- `npm run dev`: chay local
- `npm run lint`: kiem tra lint
- `npm run build`: build production
- `npm run start`: chay ban build production

## Cau truc thu muc

- `src/app`: route va layout theo App Router
- `src/components`: cac UI component theo module
- `src/redux`: store va slices
- `src/types`: dinh nghia kieu du lieu
- `public/images`: tai nguyen hinh anh

## Quy trinh Git de xuat

1. Tao nhanh moi tu `main`
2. Mo Pull Request ve `main`
3. CI se tu dong chay lint va build
4. Merge khi CI xanh

## CI/CD

Repo da duoc cau hinh GitHub Actions tai `.github/workflows/ci.yml` voi 2 buoc:

- `npm run lint`
- `npm run build`

Workflow se chay khi:

- Push len nhanh `main`
- Tao/cap nhat Pull Request vao `main`

## Bien moi truong

Neu du an can bien moi truong, tao file `.env.local` o thu muc goc. File nay da duoc bo qua boi git.

## Trang thai repository

- Remote: `origin` -> `https://github.com/HoangKhangKhuPho4/CD-WEB-FE.git`
- Nhanh mac dinh: `main`

## Thông tin dự án

**Đề tài:** Website Thương Mại Điện Tử

**Nhóm thực hiện:**
- 22130116 - Nguyễn Lê Hoàng Khang
- 22130025 - Phạm Thái Bảo
