# 05 — Frontend (Next.js)

## Mục tiêu
Xây dựng giao diện người dùng hiện đại, trực quan cho Sales và Sales Manager.

---

## Stack
- **Framework**: Next.js 14 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: Zustand (global) + React Query (server state)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Form**: React Hook Form + Zod
- **Port**: 3000

---

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          ← Sidebar + Header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx        ← Lead list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    ← Lead detail + AI Insights
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── copilot/
│   │   │   │   └── page.tsx        ← AI Chat
│   │   │   └── tasks/
│   │   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                     ← shadcn components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── SalesFunnel.tsx
│   │   │   ├── HotLeadsTable.tsx
│   │   │   └── RevenueChart.tsx
│   │   ├── lead/
│   │   │   ├── LeadTable.tsx
│   │   │   ├── LeadScoreCard.tsx
│   │   │   ├── AIInsightsPanel.tsx
│   │   │   ├── ProductRecommendCard.tsx
│   │   │   ├── NextBestActionCard.tsx
│   │   │   └── GeneratedContentPanel.tsx
│   │   ├── copilot/
│   │   │   ├── ChatInterface.tsx
│   │   │   └── ChatMessage.tsx
│   │   └── common/
│   │       ├── ScoreBadge.tsx
│   │       ├── PriorityBadge.tsx
│   │       └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── api.ts                  ← Axios instance
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useLeads.ts
│   │   ├── useCustomers.ts
│   │   ├── useDashboard.ts
│   │   └── useChat.ts
│   ├── store/
│   │   ├── authStore.ts            ← Zustand: user, token
│   │   └── chatStore.ts
│   └── types/
│       ├── lead.ts
│       ├── customer.ts
│       └── api.ts
├── public/
└── next.config.ts
```

---

## Tasks

### TASK-FE-01 — Project Setup

- [ ] Khởi tạo Next.js: `npx create-next-app@latest frontend --typescript --tailwind --app`
- [ ] Cài shadcn/ui: `npx shadcn@latest init`
- [ ] Cài thêm: `axios`, `react-query`, `zustand`, `recharts`, `react-hook-form`, `zod`
- [ ] Cấu hình `NEXT_PUBLIC_API_URL` trong `.env.local`
- [ ] Setup Axios instance với interceptor (tự gắn Bearer token)
- [ ] Setup React Query `QueryClientProvider`

---

### TASK-FE-02 — Authentication

#### Pages: `/login`

**Spec**: Form đăng nhập, lưu JWT vào localStorage, redirect vào dashboard.

- [ ] `LoginPage`: form email + password (React Hook Form + Zod validation)
- [ ] Gọi `POST /auth/login`
- [ ] Lưu `accessToken` + `user` vào Zustand `authStore`
- [ ] Axios interceptor tự đính kèm `Authorization: Bearer <token>`
- [ ] Middleware Next.js: redirect `/login` nếu chưa auth
- [ ] Logout: xóa token + redirect

---

### TASK-FE-03 — Layout

**Spec**: Sidebar navigation + Header cố định.

#### Sidebar items
```
📊 Dashboard        (MANAGER only)
👥 Leads
🏦 Customers
🤖 AI Copilot
✅ Tasks
```

- [ ] `Sidebar.tsx`: navigation links, highlight active route
- [ ] `Header.tsx`: user avatar, role badge, logout button
- [ ] Responsive: collapse sidebar trên mobile
- [ ] `(dashboard)/layout.tsx`: kết hợp Sidebar + Header + main content

---

### TASK-FE-04 — Dashboard Page

**Route**: `/dashboard` | **Role**: MANAGER

#### Components

**MetricCards** (4 cards hàng đầu)
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Leads  │ │  Hot Leads   │ │ Today Tasks  │ │ Conv. Rate   │
│    145       │ │     23       │ │      8       │ │    24%       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Sales Funnel** (Funnel chart - Recharts)
```
NEW (30) → QUALIFIED (25) → CONTACTED (40) → PROPOSAL (20) → WON (10)
```

**Hot Leads Table** (Top 10 leads by score)
```
| Customer  | Score | Product      | Next Action | Action |
|-----------|-------|--------------|-------------|--------|
| Nguyen A  | 92    | Visa Plat.   | CALL TODAY  | →      |
```

**Revenue Forecast** (Bar chart: This Month vs Next Month)

#### Implementation Tasks
- [ ] `GET /dashboard` với React Query
- [ ] `MetricCard` component (số + icon + trend)
- [ ] `SalesFunnel` dùng FunnelChart từ Recharts
- [ ] `HotLeadsTable` với link tới Lead Detail
- [ ] `RevenueChart` dùng BarChart

---

### TASK-FE-05 — Lead List Page

**Route**: `/leads`

#### Features
- Bảng danh sách leads (phân trang)
- Filter: Status, Score range, Priority
- Sort: Score (desc mặc định), Created date
- Search theo customer name
- Score badge: màu đỏ (<50), vàng (50-79), xanh (≥80)

```
┌─────────────────────────────────────────────────────────────┐
│ [Search...]  [Status ▼]  [Score ▼]  [Sort ▼]               │
├────────────────────────────────────────────────────────────-┤
│ Customer     Score   Product        Status      Action       │
│ Nguyen A     92 🟢   Visa Platinum  QUALIFIED   [View]      │
│ Tran B       71 🟡   Home Loan      CONTACTED   [View]      │
│ Le C         38 🔴   Saving         NEW         [View]      │
└─────────────────────────────────────────────────────────────┘
```

- [ ] `LeadTable` component với pagination
- [ ] `ScoreBadge` component (color-coded)
- [ ] `PriorityBadge` component
- [ ] Filter sidebar hoặc filter bar
- [ ] Link tới `/leads/:id`

---

### TASK-FE-06 — Lead Detail Page ⭐ (Core Feature)

**Route**: `/leads/:id`

Đây là trang trung tâm của toàn bộ hệ thống.

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ [← Back]  Nguyen Van A  |  Score: 92  |  QUALIFIED  │
├──────────────────┬──────────────────────────────────┤
│ Customer Info    │  AI Insights Panel                │
│ ─────────────    │  ──────────────────               │
│ • Age: 35        │  📊 Lead Score: 92/100            │
│ • Income: 35M    │     Xác suất: 88%                │
│ • City: HCM      │     [Giải thích bằng AI ▼]        │
│ • Products: 2    │                                   │
│                  │  🎯 Sản phẩm đề xuất              │
│ Interaction      │     SHB Visa Platinum             │
│ History          │     Confidence: 91%               │
│ ─────────────    │     Lý do: Thu nhập > 30M         │
│ • Email open x4  │                                   │
│ • Web visit x7   │  ⚡ Next Best Action              │
│ • Loan inq. x3   │     📞 GỌI NGAY HÔM NAY          │
│                  │     Priority: HIGH                │
│ Pipeline         │                                   │
│ ─────────────    │  ─────────────────────────────   │
│ [NEW] [QUALIFIED]│  AI Copilot                       │
│ [CONTACTED] ...  │  ─────────────                   │
│                  │  [✉ Sinh Email] [📝 Sinh Pitch]  │
│                  │  [📞 Call Script] [Trigger Score] │
│                  │                                   │
│                  │  Generated Email Preview:         │
│                  │  ┌─────────────────────────────┐ │
│                  │  │ Kính gửi anh Nguyen...      │ │
│                  │  │ ...                          │ │
│                  │  └─────────────────────────────┘ │
│                  │  [Copy] [Edit] [Save]             │
└──────────────────┴──────────────────────────────────┘
```

#### Implementation Tasks
- [ ] `GET /leads/:id/insights` → hiển thị score + recommendation + action
- [ ] `LeadScoreCard`: score gauge + probability bar + top features
- [ ] `ProductRecommendCard`: product name + confidence + reason
- [ ] `NextBestActionCard`: action button + priority + reason
- [ ] **"Giải thích bằng AI"** button → gọi `POST /ai/explain-score`
- [ ] **"Sinh Email"** button → gọi `POST /ai/email` → hiển thị preview
- [ ] **"Sinh Pitch"** button → gọi `POST /ai/pitch`
- [ ] **"Call Script"** button → gọi `POST /ai/call-script`
- [ ] **"Trigger Score"** button → gọi `POST /leads/:id/score`
- [ ] Pipeline status selector (dropdown: NEW → QUALIFIED → ...)
- [ ] Loading states cho tất cả AI actions (skeleton + spinner)
- [ ] Copy to clipboard button cho generated content

---

### TASK-FE-07 — Customer List & Detail

**Route**: `/customers`, `/customers/:id`

- [ ] Tương tự Lead List nhưng focus vào customer profile
- [ ] Customer Detail: thông tin cá nhân + lịch sử sản phẩm + interactions + danh sách leads

---

### TASK-FE-08 — AI Copilot Chat Page ⭐

**Route**: `/copilot`

**Spec**: Chatbot interface để nhân viên hỏi về sản phẩm, chính sách, khách hàng.

```
┌─────────────────────────────────────────────────────┐
│  🤖 AI Sales Copilot                                │
│  "Hỏi tôi về sản phẩm SHB, khách hàng, chính sách" │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [AI]: Xin chào! Tôi có thể giúp gì cho bạn?      │
│                                                     │
│  [You]: Điều kiện mở thẻ Visa Platinum là gì?     │
│                                                     │
│  [AI]: Để mở thẻ SHB Visa Platinum, khách hàng    │
│        cần có thu nhập từ 15 triệu/tháng...        │
│        📎 Nguồn: Product Catalog - Visa Platinum   │
│                                                     │
│─────────────────────────────────────────────────────│
│ [Type your question...]              [Send ↵]       │
└─────────────────────────────────────────────────────┘
```

- [ ] `ChatInterface` với message list + input
- [ ] Streaming effect (character by character) hoặc loading indicator
- [ ] Show `sources` dưới mỗi AI response (citations)
- [ ] Suggested questions (quick chips): "Lãi suất vay nhà?", "Điều kiện mở thẻ?", "Chương trình khuyến mãi?"
- [ ] Clear conversation button
- [ ] `POST /ai/chat` với conversation_id management

---

### TASK-FE-09 — Tasks Page

**Route**: `/tasks`

- [ ] Danh sách tasks của user hiện tại
- [ ] Filter: Today / All / Completed
- [ ] Update status (TODO → IN_PROGRESS → DONE)
- [ ] Tạo task mới từ lead
- [ ] Due date indicator (overdue = đỏ, today = cam, future = xanh)

---

### TASK-FE-10 — Common Components & UX

- [ ] **Global Loading**: skeleton screens cho tất cả data fetching
- [ ] **Error Boundary**: hiển thị error state với retry button
- [ ] **Toast notifications**: success/error khi perform actions
- [ ] **Empty States**: khi không có data (với icon + message)
- [ ] **Responsive**: mobile-friendly (ít nhất tablet)
- [ ] **Dark mode**: (optional nhưng wow-factor cao)

---

### TASK-FE-11 — API Integration Layer

```typescript
// lib/api.ts
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      router.push('/login')
    }
    return Promise.reject(err)
  }
)
```

- [ ] Axios instance với auto-attach token
- [ ] 401 → auto logout
- [ ] Custom hooks dùng React Query:
  - `useLeads(filters)` → `GET /leads`
  - `useLeadDetail(id)` → `GET /leads/:id`
  - `useLeadInsights(id)` → `GET /leads/:id/insights`
  - `useDashboard()` → `GET /dashboard`
  - `useGenerateEmail(leadId)` → mutation `POST /ai/email`
