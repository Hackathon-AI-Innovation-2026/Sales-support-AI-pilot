# Sales Support AI Copilot

**Sales Support AI Copilot** là hệ thống hỗ trợ bán hàng thông minh kết hợp giữa **Machine Learning (ML)** và **Generative AI (LLM)**. Dự án được phát triển nhằm tối ưu hóa quy trình bán hàng của đội ngũ tư vấn viên ngân hàng SHB: tự động chấm điểm khách hàng tiềm năng (Lead Scoring), đề xuất sản phẩm phù hợp, gợi ý hành động tiếp theo (Next Best Action) và tự động tạo nội dung tiếp thị cá nhân hóa.

---

## 1. Giới thiệu dự án

### 1.1. Bối cảnh & Thử thách (As-Is)
*   **Thiếu tiêu chuẩn hóa**: Hiệu quả bán hàng phụ thuộc nhiều vào kinh nghiệm cá nhân của từng nhân viên tư vấn.
*   **Tốn thời gian chuẩn bị**: Nhân viên mất nhiều công sức để tự phân tích hồ sơ khách hàng, lựa chọn sản phẩm phù hợp và soạn thảo email/pitch bán hàng.
*   **Bỏ lỡ khách hàng tiềm năng**: Không có công cụ chấm điểm tự động dẫn đến việc phân bổ nguồn lực chưa tối ưu, bỏ lỡ các "Hot Lead".
*   **Chất lượng tư vấn không đồng đều**: Khó đảm bảo tính nhất quán và chính xác của thông tin sản phẩm và chính sách ưu đãi.

### 1.2. Giải pháp đề xuất (To-Be)
Hệ thống **Sales Support AI Copilot** tích hợp vào quy trình làm việc của Sales nhằm:
1.  **Lead Scoring**: Sử dụng mô hình Machine Learning dự đoán khả năng chuyển đổi của khách hàng.
2.  **Product Recommendation & Next Best Action**: Dùng Rule Engine kết hợp LLM để tự động gợi ý sản phẩm phù hợp và bước hành động tiếp theo.
3.  **AI Copilot (RAG)**: Sử dụng mô hình ngôn ngữ lớn (Gemini) kết hợp Vector Database (Qdrant) để truy xuất dữ liệu sản phẩm/chính sách và sinh nội dung cá nhân hóa (Email, Sales Pitch, Call Script).
4.  **Dashboard**: Giúp Sales Manager theo dõi phễu bán hàng (Sales Funnel), conversion rate và dự báo doanh thu.

---

## 2. Kiến trúc hệ thống

Dự án được thiết kế theo mô hình **Microservices** kết hợp với mô hình **BFF (Backend for Frontend)**. Giao diện Frontend Next.js chỉ giao tiếp duy nhất với Backend API (NestJS), còn NestJS đóng vai trò điều phối, gọi dịch vụ ML và AI nội bộ.

### 2.1. Sơ đồ kiến trúc tổng thể

```text
                           ┌─────────────────────────┐
                           │      Next.js Web        │ (Port 3000)
                           │       Frontend          │
                           └────────────┬────────────┘
                                        │
                                  REST / JSON
                                        │
                           ┌────────────▼────────────┐
                           │      NestJS Backend     │ (Port 3001)
                           │        (BFF & API)      │
                           └───────┬────────┬────────┘
                                   │        │
                     HTTP (JSON)   │        │ HTTP (JSON)
                                   │        │
                     ┌─────────────▼───┐   ┌▼────────────────┐
                     │   ML Service    │   │   AI Service    │
                     │  FastAPI (ML)   │   │  FastAPI (AI)   │ (Port 8002)
                     │   (Port 8001)   │   └────────┬────────┘
                     └────────┬────────┘            │
                              │                     │ Qdrant Client
                              │                     ▼
                       ┌──────▼────────┐   ┌─────────────────┐
                       │  PostgreSQL   │   │     Qdrant      │ (Port 8008)
                       │  (Relational) │   │ (Vector DB-RAG) │
                       └───────────────┘   └─────────────────┘
```

### 2.2. Các Service & Vai trò

| Service / Thành phần | Công nghệ chính | Vai trò & Trách nhiệm |
| :--- | :--- | :--- |
| **Web Frontend** | Next.js, TailwindCSS, Shadcn/ui | Giao diện cho Sales (Danh sách Leads, Chi tiết khách hàng, AI Copilot, Quản lý Tasks) và Sales Manager (Dashboard, Sales Funnel). |
| **Backend API** | NestJS, Prisma | Quản lý xác thực (JWT), nghiệp vụ CRUD, quản lý vòng đời Lead/Task, tổng hợp dữ liệu Dashboard. Đóng vai trò BFF để điều phối ML và AI Service. |
| **ML Service** | FastAPI, LightGBM, Scikit-learn | Xử lý đặc trưng (Feature Engineering) và chạy mô hình LightGBM để dự đoán **Lead Score** và **Conversion Probability**. |
| **AI Service** | FastAPI, LangChain, Gemini API | Triển khai RAG (Retrieval-Augmented Generation), sinh Email tiếp thị, sinh Sales Pitch, sinh Call Script cá nhân hóa và Chat Copilot hỗ trợ nghiệp vụ. |
| **PostgreSQL** | Cơ sở dữ liệu quan hệ | Lưu trữ thông tin nghiệp vụ và dữ liệu giao dịch: Customer, Lead, LeadScore, Task, Recommendation, AI Generated Content. |
| **Qdrant** | Vector Database | Cơ sở dữ liệu vector lưu trữ tri thức phục vụ RAG: Product Catalog, FAQ, Banking Policy, Promotions, Sales Guideline. |

---

## 3. Thiết kế Cơ sở Dữ liệu

### 3.1. Sơ đồ mối quan hệ thực thể (ERD)

```text
                     User (Sales / Manager)
                        │
                        │ 1
                        ▼ 0..*
                     Customer
                        │
        ┌───────────────┼────────────────┐
        │ 1             │ 1              │ 1
        ▼ 0..*          ▼ 0..*           ▼ 0..*
CustomerProduct   CustomerInteraction   Lead
                                            │
                  ┌────────────────────────┼────────────────────────┐
                  │ 1                      │ 1                      │ 1
                  ▼ 0..*                   ▼ 0..*                   ▼ 0..*
             LeadScore         ProductRecommendation      Recommendation
                                                                    │
                                       ┌────────────────────────────┼────────────────────┐
                                       ▼                            ▼                    ▼
                                   SalesTask                 GeneratedContent         (Future)
```

### 3.2. Cấu trúc các bảng quan trọng (PostgreSQL)
1.  **User**: Lưu thông tin tài khoản nhân viên (Họ tên, email, password hash, vai trò: `SALES`, `MANAGER`, `ADMIN`).
2.  **Customer**: Lưu hồ sơ thông tin cá nhân khách hàng (Tuổi, khu vực, thu nhập, tài khoản nhận lương...).
3.  **CustomerProduct**: Danh sách các sản phẩm tài chính khách hàng hiện đang sở hữu tại SHB (Loan, Saving, Credit Card, Insurance...).
4.  **CustomerInteraction**: Lưu lịch sử hoạt động và tương tác của khách hàng (Email Open, Website Visit, Branch Visit, App Login, Loan Inquiry...). Đây là nguồn dữ liệu quan trọng nhất cho Lead Scoring.
5.  **Lead**: Cơ hội bán hàng cụ thể gắn với một khách hàng (Ví dụ: Lead quan tâm vay mua nhà). Trạng thái đi theo quy trình phễu: `NEW` -> `QUALIFIED` -> `CONTACTED` -> `PROPOSAL` -> `NEGOTIATION` -> `WON`/`LOST`.
6.  **LeadScore**: Lưu điểm số tiềm năng (0-100), xác suất chuyển đổi (0-1) cùng danh sách các yếu tố đóng góp chính (`topFeatures` dạng JSONB) từ ML.
7.  **ProductRecommendation**: Đề xuất sản phẩm tối ưu cho Lead kèm độ tin cậy và lý do đề xuất.
8.  **Recommendation**: Gợi ý hành động tiếp theo (Next Best Action: `CALL`, `EMAIL`, `MEETING`, `WAIT`) kèm theo độ ưu tiên (`HIGH`, `MEDIUM`, `LOW`).
9.  **GeneratedContent**: Lưu các email, kịch bản hội thoại hoặc sales pitch mà AI đã sinh ra để Sales có thể chỉnh sửa và sử dụng.
10. **SalesTask**: Quản lý các đầu việc cần làm của Sales đối với từng Lead.

### 3.3. Cơ sở dữ liệu tri thức (Qdrant Vector DB)
Qdrant lưu trữ các tài liệu dạng Vector Embeddings (sử dụng model embedding của Google) phân tách thành các collection:
*   `product_catalog`: Chi tiết tính năng, lãi suất, điều kiện của các sản phẩm SHB.
*   `faq`: Các câu hỏi thường gặp của khách hàng về dịch vụ tài chính.
*   `policy`: Quy định và chính sách cấp tín dụng nội bộ.
*   `promotion`: Thông tin các chương trình khuyến mãi hiện hành.
*   `sales_guideline`: Quy trình bán hàng chuẩn dành cho tư vấn viên.

---

## 4. Luồng xử lý nghiệp vụ chính

### 4.1. Quy trình Lead Scoring (Machine Learning)
```text
Customer Profile + Interactions + Existing Products
                     │
                     ▼ (NestJS gửi HTTP Request)
        FastAPI ML Service (/predict)
                     │
                     ├─► Feature Engineering (Tính số lần visit, mở email, thu nhập...)
                     ├─► Chạy Model LightGBM Predict
                     ▼
             Predict Result ──► Lưu PostgreSQL ──► Hiển thị Frontend (Hot Leads)
```

### 4.2. Quy trình RAG & AI Content Generation
```text
Yêu cầu sinh Email / Pitch (từ Frontend)
                     │
                     ▼
                NestJS BFF
                     │ (Truy vấn profile khách hàng, điểm số, sản phẩm đề xuất)
                     ▼
        FastAPI AI Service (/generate-email hoặc /generate-pitch)
                     │
                     ├─► 1. Query Vector DB (Qdrant) tìm tài liệu sản phẩm phù hợp
                     ├─► 2. Dựng Prompt kết hợp: Hồ sơ khách hàng + Ngữ cảnh từ Qdrant + Rules
                     ├─► 3. Gửi Prompt đến LLM (Gemini) để sinh văn bản cá nhân hóa
                     ▼
          AI Content Response ──► Lưu PostgreSQL ──► Trả về Frontend cho Sales
```

### 4.3. Quy trình AI Copilot Chat (Hỗ trợ Sales)
```text
Sales đặt câu hỏi chuyên môn (Ví dụ: "Lãi suất gói vay mua nhà SHB hiện tại là bao nhiêu?")
                     │
                     ▼
                NestJS BFF ──► FastAPI AI Service (/chat)
                                     │
                                     ├─► Embedding câu hỏi & Semantic Search trên Qdrant
                                     ├─► Lấy lịch sử chat (Conversation History)
                                     ├─► Gửi LLM kèm Context tài liệu tìm thấy
                                     ▼
                                Trả lời chi tiết + Trích dẫn nguồn tài liệu gốc
```

---

## 5. Danh sách cổng dịch vụ (Ports)

| Cổng (Port) | Dịch vụ | URL / Endpoint |
| :--- | :--- | :--- |
| **3000** | Web Frontend (Next.js) | [http://localhost:3000](http://localhost:3000) |
| **3001** | Backend API (NestJS) | [http://localhost:3001](http://localhost:3001) |
| **8001** | ML Service (FastAPI) | [http://localhost:8001](http://localhost:8001) / [docs](http://localhost:8001/docs) |
| **8002** | AI Service (FastAPI) | [http://localhost:8002](http://localhost:8002) / [docs](http://localhost:8002/docs) |
| **8005** | PostgreSQL Database | `localhost:8005` |
| **8007** | MinIO Console | [http://localhost:8007](http://localhost:8007) |
| **8008** | Qdrant Dashboard | [http://localhost:8008/dashboard](http://localhost:8008/dashboard) |

---

## 6. Hướng dẫn cài đặt và Khởi chạy hệ thống

### 6.1. Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt sẵn:
1.  **Node.js** (v18 trở lên) & **pnpm** (Khuyên dùng) hoặc **npm**
2.  **Python** (v3.10 trở lên)
3.  **Docker Desktop** (để chạy database và vector db)

---

### 6.2. Khởi chạy cơ sở hạ tầng (Docker Compose)
Dự án được cấu hình sẵn Docker để khởi chạy PostgreSQL, MinIO và Qdrant local.

> [!NOTE]
> Các cấu hình môi trường mẫu nằm trong thư mục `.docs/.env.prod`. Mặc định các service đã được cấu hình để trỏ tới một VPS phát triển từ xa (development server). Nếu bạn muốn chạy hạ tầng cục bộ (local), hãy làm theo các bước dưới đây:

#### Bước 1: Thiết lập biến môi trường hạ tầng
Tại thư mục gốc của dự án, sao chép file cấu hình môi trường:
```bash
cp .docs/.env.prod .env
```

#### Bước 2: Khởi động các container
Khởi chạy PostgreSQL, MinIO và Qdrant chạy ngầm:
```bash
docker compose -f .docs/docker-compose.yml up -d
```
Kiểm tra trạng thái các container:
```bash
docker compose -f .docs/docker-compose.yml ps
```

---

### 6.3. Khởi chạy Backend API (NestJS - `apps/api`)
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
    Nếu bạn chạy PostgreSQL local qua Docker ở bước 6.2, hãy cập nhật lại `DATABASE_URL` trong file `apps/api/.env`:
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
6.  **Chạy service ở chế độ Development:**
    ```bash
    pnpm run start:dev
    # hoặc: npm run start:dev
    ```
    *API sẽ chạy tại địa chỉ:* [http://localhost:3001](http://localhost:3001)

---

### 6.4. Khởi chạy ML Service (FastAPI - `apps/lead-ml-service`)
1.  **Di chuyển vào thư mục:**
    ```bash
    cd apps/lead-ml-service
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
4.  **Cài đặt các thư viện phụ thuộc:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Khởi chạy Service:**
    ```bash
    python app/main.py
    ```
    *ML Service sẽ chạy tại địa chỉ:* [http://localhost:8001](http://localhost:8001)  
    *Tài liệu Swagger API:* [http://localhost:8001/docs](http://localhost:8001/docs)

---

### 6.5. Khởi chạy AI Service (FastAPI - `apps/sale-ai-service`)
1.  **Di chuyển vào thư mục:**
    ```bash
    cd apps/sale-ai-service
    ```
2.  **Tạo và kích hoạt môi trường ảo Python:**
    ```bash
    python -m venv venv
    # Kích hoạt trên Windows: .\venv\Scripts\Activate.ps1
    # Kích hoạt trên Linux/macOS: source venv/bin/activate
    ```
3.  **Cài đặt các thư viện phụ thuộc:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Cấu hình biến môi trường:**
    Tạo hoặc cập nhật file `apps/sale-ai-service/.env`, điền `GEMINI_API_KEY` của bạn:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    QDRANT_URL=http://localhost:8008
    ```
5.  **Khởi chạy Service:**
    ```bash
    python -m uvicorn app.main:app --port 8002 --reload
    ```
    *AI Service sẽ chạy tại địa chỉ:* [http://localhost:8002](http://localhost:8002)  
    *Tài liệu Swagger API:* [http://localhost:8002/docs](http://localhost:8002/docs)

---

### 6.6. Khởi chạy Web Frontend (Next.js - `apps/web`)
1.  **Di chuyển vào thư mục:**
    ```bash
    cd apps/web
    ```
2.  **Cài đặt thư viện:**
    ```bash
    pnpm install
    # hoặc: npm install
    ```
3.  **Khởi chạy giao diện ở chế độ Development:**
    ```bash
    pnpm run dev
    # hoặc: npm run dev
    ```
    *Giao diện Web sẽ chạy tại địa chỉ:* [http://localhost:3000](http://localhost:3000)
