# Phase 5 — Frontend (Next.js)

> **Mục tiêu:** Xây dựng giao diện đầy đủ cho Sales và Manager — từ Login đến AI Copilot — với UX chuyên nghiệp, banking-grade.

---

## Tổng quan

| Thông tin | Chi tiết |
|-----------|----------|
| Thứ tự | Phase 5 (sau Phase 1 + Phase 2) |
| Độ phức tạp | 🟡 Trung bình |
| Phụ thuộc | Phase 1 (infra), Phase 2 (API ready) |
| Unblock | Phase 6 (Integration) |
| Service | `apps/web` — Next.js + shadcn/ui |

**Trạng thái hiện tại:**
- ✅ Next.js project khởi tạo
- ✅ shadcn/ui cài đặt (`components.json`)
- ✅ Tailwind CSS
- ✅ `provider/` directory
- ⬜ Tất cả pages và components

---

## TASK-FE-01: Design System & Layout

**Mô tả:** Thiết lập design tokens, layout chính, navigation — nền tảng cho tất cả pages.

**Design Principles:**
- Professional banking UI — tông màu xanh navy + trắng
- Dark mode support
- Font: Inter (Google Fonts)
- Sidebar cố định bên trái, Content area bên phải

**Color Palette:**
```css
--primary: hsl(221, 83%, 53%)        /* SHB Blue */
--primary-dark: hsl(221, 83%, 40%)
--success: hsl(142, 71%, 45%)        /* Green — High Score */
--warning: hsl(38, 92%, 50%)         /* Amber — Medium Score */
--danger: hsl(0, 84%, 60%)           /* Red — Low Score */
--background: hsl(210, 40%, 98%)
--foreground: hsl(222, 47%, 11%)
```

**Checklist:**
- [ ] `globals.css` — CSS variables, reset, typography
- [ ] `components/layout/Sidebar.tsx` — navigation với icons
  - Logo SHB
  - Nav items: Dashboard, Leads, Customers, Tasks
  - User info + logout ở bottom
  - Collapse/expand on mobile
- [ ] `components/layout/Header.tsx` — breadcrumb + notifications
- [ ] `components/layout/AppLayout.tsx` — wrapper: Sidebar + Header + Content
- [ ] `components/ui/` — Button, Card, Badge, Table, Input, Select, Dialog (từ shadcn)
- [ ] Loading skeleton components
- [ ] Toast notification setup (sonner)

---

## TASK-FE-02: Authentication Pages & Logic

**Mô tả:** Login page + JWT auth flow + protected routes.

**Pages:**
- `/login` — đăng nhập

**Components:**
- `LoginForm` — email + password + submit button

**Auth Flow:**
```
User submit form
  ↓
POST /auth/login → { accessToken, refreshToken, user }
  ↓
Lưu accessToken trong memory (không localStorage)
Lưu refreshToken trong httpOnly cookie
  ↓
Redirect theo role:
  SALES/ADMIN → /leads
  MANAGER → /dashboard
```

**Checklist:**
- [ ] `app/(auth)/login/page.tsx`
- [ ] `provider/AuthProvider.tsx` — React context: user, login, logout, refreshToken
- [ ] `lib/api.ts` — axios/fetch instance với interceptor:
  - Attach `Authorization: Bearer {accessToken}`
  - Auto refresh khi 401
- [ ] `middleware.ts` — Next.js middleware redirect:
  - `/` → `/login` nếu chưa login
  - `/login` → `/leads` nếu đã login
- [ ] Hiển thị error message khi login sai
- [ ] Loading state khi submitting

---

## TASK-FE-03: Dashboard Page

**Mô tả:** Trang tổng quan dành cho Manager — charts + metrics.

**Route:** `/dashboard`  
**Access:** MANAGER, ADMIN only

**Layout (3 rows):**
```
Row 1: [Summary Cards × 4]
  - Total Active Leads
  - Won This Month
  - Conversion Rate
  - Active Tasks Today

Row 2: [Sales Funnel Chart] [Hot Leads Table]
  - Funnel: bar chart theo pipeline stages
  - Hot Leads: top 10 leads với score badge

Row 3: [Revenue Forecast Chart] [Conversion Trend]
  - Forecast: bar chart dự báo doanh thu
  - Trend: line chart conversion rate theo tuần
```

**Checklist:**
- [ ] `app/(main)/dashboard/page.tsx`
- [ ] `components/dashboard/SummaryCards.tsx` — 4 metric cards với icons
- [ ] `components/dashboard/SalesFunnel.tsx` — Recharts BarChart
- [ ] `components/dashboard/HotLeadsTable.tsx` — sortable table với score badge
- [ ] `components/dashboard/RevenueForecast.tsx` — Recharts BarChart
- [ ] `components/dashboard/ConversionTrend.tsx` — Recharts LineChart
- [ ] Install: `recharts`
- [ ] Loading skeleton cho mỗi chart section
- [ ] Refresh button để reload data

---

## TASK-FE-04: Leads List Page

**Mô tả:** Danh sách leads — nơi Sales làm việc chính.

**Route:** `/leads`  
**Access:** SALES (thấy leads của mình), MANAGER (thấy tất cả)

**Layout:**
```
Header: [Title] [Search] [Filter] [Create Lead button]
Table:
  | Customer | Score | Product | Status | Last Action | Assigned | Actions |
  |----------|-------|---------|--------|-------------|----------|---------|
  | Nguyễn A | 🔴 87 | Visa Pt | QUALI  | 2h ago      | Sales B  | View    |
Footer: Pagination
```

**Score Badge:**
- 🔴 Đỏ: ≥ 80 (High)
- 🟡 Vàng: 60-79 (Medium)
- 🟢 Xanh: < 60 (Low)

**Checklist:**
- [ ] `app/(main)/leads/page.tsx`
- [ ] `components/leads/LeadTable.tsx` — với sort + pagination
- [ ] `components/leads/LeadFilters.tsx`:
  - Filter: Status (pipeline), Score range, Assigned To
  - Search: customer name
- [ ] `components/leads/ScoreBadge.tsx` — color-coded badge
- [ ] `components/leads/CreateLeadModal.tsx`:
  - Select customer (search dropdown)
  - Select interested product
  - Assign to sales
- [ ] "Analyze" button → trigger `POST /leads/:id/score` + toast
- [ ] Pagination với page size selector

---

## TASK-FE-05: Lead Detail Page

**Mô tả:** Trang chi tiết lead — toàn bộ thông tin + AI Copilot.

**Route:** `/leads/[id]`

**Layout (3 columns):**
```
Left Column (1/3):
  - Customer Profile Card
  - Lead Score Card
  - Recommended Product Card
  - Next Best Action Card

Middle Column (1/3):
  - Interaction History Timeline

Right Column (1/3):
  - AI Copilot Panel (tabs)
  - Sales Tasks List
```

**Checklist:**
- [ ] `app/(main)/leads/[id]/page.tsx`
- [ ] `components/leads/CustomerProfileCard.tsx`:
  - Avatar, Name, Email, Phone
  - Age, Income, City, Occupation
  - Products owned (badges)
- [ ] `components/leads/LeadScoreCard.tsx`:
  - Score gauge/ring
  - Probability percentage
  - Top features list
  - "Re-analyze" button
- [ ] `components/leads/RecommendedProductCard.tsx`:
  - Product name + confidence
  - Reason text
  - "Generate Email" shortcut button
- [ ] `components/leads/NextBestActionCard.tsx`:
  - Action icon (📞/📧/🗓/⏳)
  - Priority badge
  - Reason text
- [ ] `components/leads/InteractionTimeline.tsx`:
  - Grouped by date
  - Icons theo loại interaction
  - Metadata display
- [ ] `components/leads/SalesTaskList.tsx`:
  - Tasks với status toggle
  - Add task button

---

## TASK-FE-06: AI Copilot Panel

**Mô tả:** Panel 3 tabs — trái tim của sản phẩm, phần demo ấn tượng nhất.

**Route:** Embedded trong Lead Detail page

**Tab 1: Generate Email**
```
[Select Product dropdown] [Generate button → loading spinner]
─────────────────────────────────────────────────
Subject: [editable input field]
─────────────────────────────────────────────────
Body: [editable textarea — rich text nếu có thể]
─────────────────────────────────────────────────
[Copy Subject] [Copy Body] [Copy All] [Regenerate]
```

**Tab 2: Generate Pitch**
```
[Generate Pitch button → loading]
─────────────────────────────────
[Pitch text card — readable format]
─────────────────────────────────
[Copy button] [Regenerate]
```

**Tab 3: Chat with AI**
```
[Chat history — bubble style]
  🤖 Chào! Tôi có thể hỗ trợ bạn tư vấn...
  👤 Nên tư vấn sản phẩm gì?
  🤖 Dựa trên lead score 87/100...
─────────────────────────────────
[Input field] [Send button]
[Sources: product_catalog, faq] (expandable)
```

**Checklist:**
- [ ] `components/copilot/AICopilotPanel.tsx` — Tabs wrapper
- [ ] `components/copilot/EmailGenerator.tsx`:
  - API call `POST /ai/generate-email`
  - Loading state (skeleton hoặc spinner 3-5s)
  - Editable result
  - Copy to clipboard với toast confirm
  - Lưu vào history (hiển thị previous generations)
- [ ] `components/copilot/PitchGenerator.tsx`:
  - Tương tự Email Generator
  - API call `POST /ai/generate-pitch`
- [ ] `components/copilot/ChatInterface.tsx`:
  - Message list với auto-scroll
  - Stream response (character by character hoặc word by word)
  - SSE client: `EventSource` hoặc `fetch` với streaming
  - Typing indicator khi đang stream
  - Sources section
- [ ] History tab: xem lại tất cả generated content

---

## TASK-FE-07: Customers Page

**Mô tả:** Danh sách khách hàng, điểm xuất phát tạo Lead mới.

**Route:** `/customers`

**Layout:**
```
Header: [Title] [Search] [Filter]
Table:
  | Name | Email | Phone | City | Income | Products | Leads | Action |
Footer: Pagination
```

**Checklist:**
- [ ] `app/(main)/customers/page.tsx`
- [ ] `components/customers/CustomerTable.tsx`
- [ ] Search: full-text theo name, email, phone
- [ ] Filter: city (dropdown), income range (slider)
- [ ] "Create Lead" button từng row → mở CreateLeadModal (tái dùng từ TASK-FE-04)
- [ ] "View" button → `GET /customers/:id` modal với full profile

---

## TASK-FE-08: Tasks Page

**Mô tả:** Danh sách công việc của Sales — quản lý daily tasks.

**Route:** `/tasks`

**Layout:**
```
Header: [Today] [This Week] [All] tabs + [Add Task button]
List:
  📞 Gọi cho Nguyễn Văn A
     Due: 14:00 hôm nay | Lead: Visa Platinum
     [Mark Done] [View Lead]

  📧 Gửi email follow-up Trần Thị B
     Due: Ngày mai | Status: TODO
     [Mark Done] [View Lead]
```

**Checklist:**
- [ ] `app/(main)/tasks/page.tsx`
- [ ] `components/tasks/TaskList.tsx`:
  - Group by: Today / Upcoming / Done
  - Task card với type icon
- [ ] `components/tasks/TaskCard.tsx`:
  - Type icon: 📞 CALL, 📧 EMAIL, 🗓 MEETING
  - Status badge
  - Due date (highlight nếu overdue)
  - One-click complete: `PUT /tasks/:id { status: 'DONE' }`
- [ ] `components/tasks/CreateTaskModal.tsx`:
  - Select Lead (search)
  - Task type
  - Due date/time picker
  - Note
- [ ] Tab filter: Today / This Week / All / Done

---

## Cấu trúc thư mục dự kiến sau Phase 5

```
apps/web/src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (main)/
│   │   ├── dashboard/page.tsx
│   │   ├── leads/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/page.tsx
│   │   └── tasks/page.tsx
│   └── layout.tsx
├── components/
│   ├── layout/        — Sidebar, Header, AppLayout
│   ├── dashboard/     — Charts, Summary cards
│   ├── leads/         — Table, Filters, Detail cards
│   ├── copilot/       — Email, Pitch, Chat components
│   ├── customers/     — Customer table
│   ├── tasks/         — Task list, cards
│   └── ui/            — shadcn base components
├── lib/
│   ├── api.ts         — HTTP client
│   └── utils.ts
└── provider/
    └── AuthProvider.tsx
```

---

## Kết quả mong đợi sau Phase 5

```
✅ Login flow hoạt động đúng với JWT
✅ Dashboard hiển thị charts đẹp với dữ liệu thật
✅ Leads list với filter, sort, pagination
✅ Lead detail đầy đủ thông tin + AI Copilot panel
✅ AI Chat stream response mượt mà
✅ Email/Pitch generation với editable result
✅ Tasks page với one-click complete
✅ Responsive trên desktop (1280px+)
```
