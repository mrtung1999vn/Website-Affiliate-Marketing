# 🛍️ Affiliate Marketing Management System

Một hệ thống quản lý Affiliate Marketing cho nhiều cửa hàng (multi-shop), được xây dựng bằng Node.js, Express, EJS, và SQLite.

---

## 🚀 Tính năng chính

### 👤 Quản trị Admin
- Tạo nhiều cửa hàng (shop)
- Quản lý danh sách các shop
- Giao diện đơn giản dễ mở rộng

### 🏪 Shop Management
Mỗi shop là một hệ thống riêng biệt:
- Quản lý **cộng tác viên (CTV)**
- Quản lý **sản phẩm & danh mục**
- Quản lý **hóa đơn bán hàng**, tính hoa hồng theo mã giới thiệu
- Tự động tính và đối soát **hoa hồng**
- Báo cáo doanh thu & affiliate theo **ngày / tháng / năm**
- Tạo & quản lý chương trình **thi đua CTV**

---

## 🧱 Công nghệ sử dụng

| Layer          | Tech                                   |
|----------------|----------------------------------------|
| Backend        | Node.js + Express                      |
| Template       | EJS + layout partials                  |
| Database       | SQLite (dùng Sequelize ORM)            |
| Session        | express-session                        |
| UI Basic       | HTML + EJS layout                      |

---
## 🧱 Cấu Trúc Thư Mục
├── README.md
├── affiliate-shop-system.zip
├── api-docs.json
├── controllers
│   ├── adminController.js
│   ├── affiliateController.js
│   └── shopController.js
├── generate-api-doc.js
├── main.sqlite
├── models
│   ├── index.js
│   └── models-main.js
├── package-lock.json
├── package.json
├── public
│   ├── css
│   │   └── style.css
│   ├── images
│   │   └── logo.png
│   └── js
│       └── main.js
├── reset-db.js
├── routes
│   ├── admin.js
│   ├── api.js
│   └── shop.js
├── server.js
├── shop_demo.sqlite
├── show-structure.js
├── utils
│   ├── db-loader.js
│   ├── format.js
│   └── token-generator.js
└── views
    ├── admin
    │   ├── createShop.ejs
    │   ├── dashboard.ejs
    │   ├── listShops.ejs
    │   └── login.ejs
    ├── index.ejs
    ├── partials
    │   ├── footer.ejs
    │   └── header.ejs
    └── shop
        ├── dashboard.ejs
        ├── login.ejs
        ├── orders.ejs
        ├── products.ejs
        ├── reports.ejs
        └── users.ejs

        
## ⚙️ Cài đặt và chạy thử

### 1. Clone và cài đặt
```bash
git clone https://github.com/mrtung1999vn/Website-Affiliate-Marketing
cd affiliate-marketing-system
npm install
```

### 2. Chạy thử
```bash
npm start
```

Mở trình duyệt và truy cập `http://localhost:3000` để xem ứng dụng.

---

## 🛠️ Scripts & Công cụ sửa lỗi

- **fix/migrate-shop-dbs.js**: Script tự động migrate các file shop_*.sqlite để đảm bảo bảng Users trong từng database shop có đủ cột username/password (dùng cho các shop tạo trước khi nâng cấp hệ thống). Chạy bằng lệnh:

  ```powershell
  node fix/migrate-shop-dbs.js
  ```
  
  Script sẽ báo cáo trạng thái migrate từng file. Nếu có lỗi (ví dụ thiếu bảng Users), bạn cần kiểm tra lại database shop tương ứng.

- **fix/show-structure.js**: Script hiển thị cấu trúc bảng của tất cả các file shop_*.sqlite. Chạy bằng lệnh:

  ```powershell
  node fix/show-structure.js
  ```
  
  Script sẽ in ra cấu trúc bảng (tên bảng, tên cột, kiểu dữ liệu) của từng file shop_*.sqlite.

- **fix/truncate-all-tables.js**: Script xóa sạch dữ liệu các bảng trong tất cả file shop_*.sqlite (không xóa cấu trúc bảng). Chạy bằng lệnh:

  ```powershell
  node fix/truncate-all-tables.js
  ```
  
  Script sẽ xóa toàn bộ dữ liệu trong các bảng của từng file shop_*.sqlite, giữ nguyên cấu trúc bảng.

- **fix/reset-main-db.js**: Xóa file main.sqlite (database chính) và hướng dẫn tạo lại cấu trúc bảng Shops. Chạy bằng lệnh:

  ```powershell
  node fix/reset-main-db.js
  ```
  
  Sau đó khởi động lại server Node.js để Sequelize tự tạo lại bảng với cấu trúc mới nhất.

- **fix/reset-db.js**: Xóa toàn bộ file shop_*.sqlite và main.sqlite (reset trắng toàn bộ hệ thống). Chạy bằng lệnh:

  ```powershell
  node fix/reset-db.js
  ```
  
  Sau đó khởi động lại server Node.js để tạo lại database mới hoàn toàn.
