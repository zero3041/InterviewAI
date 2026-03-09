# Interview Preparation Guide

Ứng dụng hỗ trợ ôn tập phỏng vấn cho các công nghệ: Java Spring Boot, PHP, React, NextJS. Tích hợp AI để chấm điểm và đánh giá câu trả lời.

## Tính năng

- 📚 Ngân hàng câu hỏi phỏng vấn theo level (Junior/Middle)
- 🤖 Chấm điểm câu trả lời bằng AI với nhận xét chi tiết
- 📝 Chế độ làm test 20 câu ngẫu nhiên
- 🔖 Bookmark câu hỏi quan trọng
- 🌙 Hỗ trợ Dark/Light mode

## Yêu cầu

- Node.js 18+
- pnpm
- Antigravity Proxy Tool (để sử dụng AI API)

## Cài đặt Antigravity Proxy Tool

### 1. Tải và cài đặt

Tải app từ [GitHub Releases](https://github.com/lbjlaq/Antigravity-Manager/releases) phù hợp với hệ điều hành:

- **macOS**: `.dmg`
- **Windows**: `.msi` hoặc `.zip`
- **Linux**: `.deb` hoặc `.AppImage`

Cài đặt và chạy ứng dụng.

### 2. Thêm tài khoản

1. Vào tab **"Accounts"**
2. Sử dụng một trong các cách:
   - **OAuth**: Tự động tạo link ủy quyền
   - **Import token/JSON**: Nhập token hoặc file JSON

### 3. Khởi động Proxy

1. Chuyển sang tab **"API Proxy"**
2. Cấu hình các tùy chọn:
   - **Port**: Mặc định `8045`
   - **allow_lan_access**: Bật nếu cần truy cập từ máy khác trong mạng LAN
   - **auth_mode**: Chọn một trong các mode:
     - `off` - Không yêu cầu xác thực
     - `strict` - Yêu cầu xác thực nghiêm ngặt
     - `all_except_health` - Xác thực tất cả trừ health check
   - **api_key**: Đặt key xác thực (ví dụ: `sk-antigravity`)
3. Click **"Start"** để chạy server Axum
4. Kiểm tra trạng thái **"running"** và số **active accounts**

## Cài đặt Project

### 1. Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/java-springboot-interview-guide.git
cd java-springboot-interview-guide
```

### 2. Cài đặt dependencies

```bash
pnpm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
# AI API Configuration
AI_API_BASE_URL=http://127.0.0.1:8045/v1
AI_API_KEY=sk-antigravity
AI_DEFAULT_MODEL=gemini-2.5-flash
```

## Chạy ứng dụng

### Development mode

Chạy cả frontend và backend server:

```bash
pnpm dev:all
```

Hoặc chạy riêng:

```bash
# Chạy frontend (Vite)
pnpm dev

# Chạy backend server (Express)
pnpm dev:server
```

### Production build

```bash
# Build
pnpm build

# Run production server
pnpm start
```

## Truy cập

- **Frontend**: http://localhost:5173
- **API Server**: http://localhost:3001

## Cấu trúc thư mục

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # UI Components
│   │   ├── data/          # Question data files
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── server/                 # Backend Express
│   └── index.ts           # API server
├── shared/                 # Shared code
│   ├── const.ts
│   └── ai-models.ts       # AI model definitions
└── .env                   # Environment config
```

## API Endpoints

### AI Endpoints

| Endpoint           | Method | Mô tả                               |
| ------------------ | ------ | ----------------------------------- |
| `/api/models`      | GET    | Lấy danh sách AI models             |
| `/api/score`       | POST   | Chấm điểm một câu trả lời           |
| `/api/score-batch` | POST   | Chấm điểm nhiều câu trả lời (batch) |
| `/api/chat`        | POST   | Hỏi thêm sau khi AI chấm điểm       |

### Database Endpoints

| Endpoint                          | Method | Mô tả                       |
| --------------------------------- | ------ | --------------------------- |
| `/api/technologies`               | GET    | Lấy danh sách technologies  |
| `/api/technologies/:id/questions` | GET    | Lấy câu hỏi theo technology |
| `/api/sessions`                   | POST   | Tạo/lấy session             |
| `/api/history`                    | GET    | Lấy lịch sử chấm điểm       |
| `/api/history`                    | POST   | Thêm entry lịch sử          |
| `/api/history/:id`                | DELETE | Xóa entry lịch sử           |
| `/api/history/:id/chat`           | POST   | Cập nhật chat messages      |
| `/api/bookmarks`                  | GET    | Lấy danh sách bookmark      |
| `/api/bookmarks`                  | POST   | Thêm bookmark               |
| `/api/bookmarks/:questionId`      | DELETE | Xóa bookmark                |
| `/api/stats`                      | GET    | Lấy thống kê                |

## Công nghệ sử dụng

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL 16, Drizzle ORM
- **AI**: OpenAI-compatible API (qua Antigravity Proxy)

## Cài đặt Database (PostgreSQL)

### Sử dụng Docker (khuyến nghị)

```bash
# Khởi động PostgreSQL container
docker-compose up -d

# Kiểm tra container đang chạy
docker ps
```

### Cài đặt thủ công

1. Cài đặt PostgreSQL 16
2. Tạo database:

```sql
CREATE DATABASE interview_prep;
```

3. Cấu hình DATABASE_URL trong file `.env`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/interview_prep
```

### Migrate và Seed data

```bash
# Push schema tới database
pnpm db:push

# Seed dữ liệu từ JSON files vào database
pnpm db:seed
```

### Database Commands

| Command            | Mô tả                                   |
| ------------------ | --------------------------------------- |
| `pnpm db:generate` | Generate migration files                |
| `pnpm db:migrate`  | Run migrations                          |
| `pnpm db:push`     | Push schema trực tiếp (development)     |
| `pnpm db:seed`     | Seed dữ liệu câu hỏi                    |
| `pnpm db:studio`   | Mở Drizzle Studio (UI quản lý database) |

## License

MIT
