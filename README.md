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
