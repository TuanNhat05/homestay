# Homestay Backend MVP

Backend quản lý đặt phòng homestay nội bộ bằng Node.js, Express, MongoDB, Mongoose, JWT và bcrypt.

## 1. Cấu trúc thư mục

```text
src/config/db.js              Kết nối MongoDB bằng Mongoose
src/models/User.js            Model nhân viên/admin
src/models/Room.js            Model phòng
src/models/Customer.js        Model khách hàng
src/models/Booking.js         Model booking, notes, logs
src/middlewares/authMiddleware.js  Kiểm tra JWT
src/middlewares/roleMiddleware.js  Kiểm tra quyền admin/staff
src/controllers/              Xử lý logic request/response
src/routes/                   Khai báo API endpoints
src/app.js                    Cấu hình Express app
src/server.js                 File chạy server
scripts/seedAdmin.js          Tạo tài khoản admin đầu tiên
tests/booking.test.js         Test luật booking quan trọng
```

## 2. Cài đặt trên Windows bằng VS Code

Mở terminal trong VS Code tại thư mục:

```powershell
cd E:\homestay\back_end
```

Cài Node.js LTS nếu máy chưa có lệnh `node` và `npm`:

```powershell
winget install OpenJS.NodeJS.LTS
```

Đóng terminal, mở lại VS Code terminal, rồi kiểm tra:

```powershell
node -v
npm -v
```

Cài package:

```powershell
npm install
```

Tạo file `.env` từ `.env.example`:

```powershell
copy .env.example .env
```

Sửa `MONGO_URI` hoặc `MONGO_URL` và `JWT_SECRET` trong `.env` nếu cần.

## 3. Chạy MongoDB

Nếu dùng MongoDB local, đảm bảo MongoDB service đang chạy và URI là:

```env
MONGO_URI=mongodb://127.0.0.1:27017/homestay
```

Bạn cũng có thể dùng MongoDB Atlas bằng cách thay `MONGO_URI` trong `.env`.
Nếu dùng Atlas, vào **Network Access** và whitelist IP máy đang chạy backend.

## 4. Tạo admin đầu tiên

```powershell
npm run seed:admin
```

Mặc định:

```text
email: admin@example.com
password: 123456
```

Nên đổi `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong `.env` trước khi chạy thật.

## 5. Chạy backend

Chạy dev server:

```powershell
npm run dev
```

Hoặc chạy thường:

```powershell
npm start
```

Server mặc định chạy tại:

```text
http://localhost:5000
```

Kiểm tra nhanh:

```text
GET http://localhost:5000/api/health
```

## 6. Chạy test

```powershell
npm test
```

Test hiện có kiểm tra:

- Không cho booking dưới 3 tiếng.
- Không cho đặt trùng phòng theo công thức `newStart < oldEnd AND newEnd > oldStart`.

## 7. API chính

Auth:

```text
POST /api/auth/login
GET /api/auth/me
```

Rooms:

```text
GET /api/rooms
POST /api/rooms
GET /api/rooms/:id
PUT /api/rooms/:id
DELETE /api/rooms/:id
```

Customers:

```text
GET /api/customers
POST /api/customers
GET /api/customers/:id
PUT /api/customers/:id
DELETE /api/customers/:id
```

Bookings:

```text
GET /api/bookings
POST /api/bookings
GET /api/bookings/:id
PUT /api/bookings/:id
DELETE /api/bookings/:id
PATCH /api/bookings/:id/status
POST /api/bookings/:id/notes
```

Dashboard:

```text
GET /api/dashboard/summary
```

Các API trừ login đều cần header:

```text
Authorization: Bearer <token>
```
