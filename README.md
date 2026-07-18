# Hướng Dẫn Chạy Các Service - Sales Support AI Copilot

Tài liệu này hướng dẫn cách thiết lập và khởi chạy toàn bộ các service trong dự án **Sales Support AI Copilot**.

Dự án sử dụng mô hình Microservices bao gồm:
*   **Web Frontend**: Next.js (chạy ở cổng `3000`)
*   **Backend API**: NestJS (chạy ở cổng `3001`)
*   **ML Service**: FastAPI + LightGBM (chạy ở cổng `8001`)
*   **AI Service**: FastAPI + LangChain + Gemini (chạy ở cổng `8002`)
*   **Infrastructure (Docker)**: PostgreSQL (`8005`), MinIO (`8006`/`8007`), Qdrant (`8008`/`8009`)

---

## 1. Yêu cầu hệ thống (Prerequisites)

Trước khi chạy, hãy đảm bảo máy của bạn đã cài đặt:
1.  **Node.js** (v18 trở lên) & **pnpm** (Khuyên dùng) hoặc **npm**
2.  **Python** (v3.10 trở lên)
3.  **Docker Desktop** (để chạy cơ sở dữ liệu và vector db)

---

## 2. Khởi chạy Infrastructure (Docker Compose)

Hệ thống đi kèm cấu hình Docker để chạy các dịch vụ lưu trữ cần thiết.

> [!NOTE]
> Các cấu hình môi trường mẫu nằm trong thư mục `.docs/.env.prod`. Mặc định các service đã được cấu hình để trỏ tới một VPS phát triển từ xa (development server). Nếu bạn muốn chạy hạ tầng cục bộ (local), hãy làm theo các bước dưới đây:

### Bước 1: Sao chép file cấu hình môi trường hạ tầng
Tại thư mục gốc của dự án, tạo file `.env` bằng cách copy nội dung từ `.docs/.env.prod` hoặc chạy lệnh:
```bash
cp .docs/.env.prod .env
```

### Bước 2: Chạy Docker Compose
Khởi động PostgreSQL, MinIO và Qdrant:
```bash
docker compose -f .docs/docker-compose.yml up -d
```
Kiểm tra xem các container đã chạy thành công hay chưa:
```bash
docker compose -f .docs/docker-compose.yml ps
```

---

## 3. Cấu hình và Khởi chạy các Service chi tiết

### 3.1. Backend API (NestJS - `apps/api`)

Service này kết nối với PostgreSQL và quản lý nghiệp vụ chính.

1.  **Di chuyển vào thư mục:**
    ```bash
    cd apps/api
    ```
2.  **Cài đặt thư viện:**
    ```bash
    pnpm install
    # hoặc: npm install
    ```
3.  **Cấu hình môi trường:**
    File `.env` đã được cấu hình mặc định kết nối tới Database. Nếu bạn chạy PostgreSQL local qua Docker, hãy cập nhật lại `DATABASE_URL` trong file `apps/api/.env`:
    ```env
    DATABASE_URL=postgresql://postgres:postgres@localhost:8005/sales_support_ai_copilot?schema=public
    ```
4.  **Đồng bộ cơ sở dữ liệu (Prisma):**
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  **Khởi tạo dữ liệu mẫu (Seeding):**
    ```bash
    pnpm run db:seed
    # hoặc: npm run db:seed
    ```
6.  **Chạy service ở chế độ Development (Watch mode):**
    ```bash
    pnpm run start:dev
    # hoặc: npm run start:dev
    ```
    *API sẽ chạy tại địa chỉ:* [http://localhost:3001](http://localhost:3001)

---

### 3.2. ML Service (FastAPI - `apps/lead-ml-service`)

Service này đảm nhận việc chấm điểm Lead (Lead Scoring) sử dụng LightGBM.

1.  **Di chuyển vào thư mục:**
    ```bash
    cd apps/lead-ml-service
    ```
2.  **Tạo môi trường ảo Python (Virtual Environment):**
    *(Bỏ qua nếu thư mục `venv` đã có sẵn)*
    ```bash
    python -m venv venv
    ```
3.  **Kích hoạt môi trường ảo:**
    *   **Windows (Command Prompt):**
        ```cmd
        venv\Scripts\activate.bat
        ```
    *   **Windows (PowerShell):**
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
    *   **Linux/macOS:**
        ```bash
        source venv/bin/activate
        ```
4.  **Cài đặt các gói phụ thuộc:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Chạy Service:**
    ```bash
    python app/main.py
    ```
    *ML Service sẽ chạy tại địa chỉ:* [http://localhost:8001](http://localhost:8001)  
    *Tài liệu API Swagger:* [http://localhost:8001/docs](http://localhost:8001/docs)

---

### 3.3. AI Service (FastAPI - `apps/sale-ai-service`)

Service này đảm nhận việc kết nối với LLM (Gemini) và Vector Database (Qdrant) phục vụ RAG, sinh email, sinh pitch và chat copilot.

1.  **Di chuyển vào thư mục:**
    ```bash
    cd apps/sale-ai-service
    ```
2.  **Tạo môi trường ảo Python:**
    ```bash
    python -m venv venv
    ```
3.  **Kích hoạt môi trường ảo:**
    *   **Windows (Command Prompt):**
        ```cmd
        venv\Scripts\activate.bat
        ```
    *   **Windows (PowerShell):**
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
    *   **Linux/macOS:**
        ```bash
        source venv/bin/activate
        ```
4.  **Cài đặt các gói phụ thuộc:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Cấu hình môi trường:**
    Hãy điền `GEMINI_API_KEY` của bạn vào file `apps/sale-ai-service/.env`. Nếu chạy Qdrant local, sửa lại `QDRANT_URL=http://localhost:8008`.
6.  **Chạy Service:**
    ```bash
    python -m uvicorn app.main:app --port 8002 --reload
    ```
    *AI Service sẽ chạy tại địa chỉ:* [http://localhost:8002](http://localhost:8002)  
    *Tài liệu API Swagger:* [http://localhost:8002/docs](http://localhost:8002/docs)

---

### 3.4. Web Frontend (Next.js - `apps/web`)

Giao diện người dùng cho ứng dụng Sales Support.

1.  **Di chuyển vào thư mục:**
    ```bash
    cd apps/web
    ```
2.  **Cài đặt thư viện:**
    ```bash
    pnpm install
    # hoặc: npm install
    ```
3.  **Chạy giao diện ở chế độ Development:**
    ```bash
    pnpm run dev
    # hoặc: npm run dev
    ```
    *Giao diện Web sẽ chạy tại địa chỉ:* [http://localhost:3000](http://localhost:3000)

---

## 4. Tóm tắt danh sách Ports

| Service / Database | Port mặc định | URL/Endpoint |
| :--- | :--- | :--- |
| **Web Frontend** | `3000` | [http://localhost:3000](http://localhost:3000) |
| **Backend NestJS API** | `3001` | [http://localhost:3001](http://localhost:3001) |
| **FastAPI ML Service** | `8001` | [http://localhost:8001](http://localhost:8001) |
| **FastAPI AI Service** | `8002` | [http://localhost:8002](http://localhost:8002) |
| **PostgreSQL** | `8005` | `localhost:8005` |
| **MinIO Console** | `8007` | [http://localhost:8007](http://localhost:8007) |
| **Qdrant Dashboard** | `8008` | [http://localhost:8008/dashboard](http://localhost:8008/dashboard) |
