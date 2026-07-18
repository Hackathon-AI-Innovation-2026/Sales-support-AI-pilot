/**
 * Prisma Seed — Sales Support AI Copilot
 * Implements: TASK-DB-12
 *
 * Generates:
 *  - 1 MANAGER + 3 SALES users
 *  - 30 diverse customers
 *  - 2–5 CustomerProducts / customer
 *  - 5–15 CustomerInteractions / customer
 *  - 20 leads
 *  - LeadScore for all leads
 *  - ProductRecommendation for all leads
 *  - Recommendation (Next Best Action) for all leads
 *  - 10 GeneratedContent (email samples)
 *  - 15 SalesTasks
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ───────────────────────────────────────────────

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── Constants ─────────────────────────────────────────────

const OCCUPATIONS = [
  'Kỹ sư phần mềm',
  'Bác sĩ',
  'Giáo viên',
  'Kinh doanh tự do',
  'Kế toán',
  'Luật sư',
  'Nhân viên văn phòng',
  'Công nhân',
  'Nội trợ',
  'Sinh viên',
];

const CITIES = [
  'Hà Nội',
  'TP.HCM',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Nha Trang',
];

const PRODUCTS_INTEREST = [
  'SHB Visa Platinum',
  'SHB Home Loan',
  'SHB Business Loan',
  'SHB Saving Account',
  'SHB Insurance',
  'SHB Investment Fund',
];

const PRODUCT_RECOMMENDATIONS = [
  { name: 'SHB Visa Platinum', reason: 'Thu nhập > 30M, chưa có thẻ tín dụng' },
  {
    name: 'SHB Home Loan',
    reason: 'Tuổi 25–45, thu nhập ổn định, tìm kiếm bất động sản',
  },
  {
    name: 'SHB Saving Account',
    reason: 'Có tài khoản lương, tiết kiệm định kỳ phù hợp',
  },
  { name: 'SHB Business Loan', reason: 'Kinh doanh tự do, cần vốn xoay vòng' },
  { name: 'SHB Insurance', reason: 'Có gia đình, cần bảo hiểm nhân thọ' },
];

const EMAIL_CONTENT_SAMPLES = [
  {
    subject: 'Ưu đãi đặc biệt thẻ SHB Visa Platinum tháng 7',
    body: `Kính gửi [Tên khách hàng],

Ngân hàng SHB trân trọng gửi đến bạn ưu đãi đặc biệt tháng 7/2026:

🎁 Miễn phí năm đầu tiên khi mở thẻ SHB Visa Platinum
💳 Hoàn tiền 5% cho các giao dịch tại nhà hàng & siêu thị
✈️ Tích lũy dặm bay mỗi chi tiêu 10.000đ

Điều kiện: Thu nhập từ 15 triệu/tháng, CCCD còn hiệu lực.

Đăng ký ngay tại chi nhánh gần nhất hoặc gọi hotline 1800 599 929.

Trân trọng,
[Tên nhân viên]
SHB Bank`,
  },
  {
    subject: 'Giải pháp vay nhà ưu đãi lãi suất 7.5%/năm',
    body: `Kính gửi [Tên khách hàng],

Bạn đang tìm kiếm nguồn vốn để sở hữu ngôi nhà mơ ước?

SHB đang triển khai gói vay mua nhà với:
🏠 Lãi suất ưu đãi chỉ 7.5%/năm trong 12 tháng đầu
💰 Tài trợ tối đa 85% giá trị tài sản
⏰ Thời hạn lên đến 30 năm

Hồ sơ đơn giản, phê duyệt nhanh trong 48 giờ làm việc.

Liên hệ ngay để được tư vấn miễn phí!

Trân trọng,
[Tên nhân viên]
SHB Bank`,
  },
  {
    subject: 'Tài khoản tiết kiệm lãi suất cao — lên đến 8.2%/năm',
    body: `Kính gửi [Tên khách hàng],

SHB ra mắt sản phẩm tiết kiệm Online với lãi suất hấp dẫn:

📈 Lãi suất lên đến 8.2%/năm kỳ hạn 12 tháng
🔒 Bảo hiểm tiền gửi theo quy định Nhà nước
📱 Mở và quản lý 100% qua App SHB

Gửi tối thiểu 5 triệu đồng, linh hoạt rút vốn khi cần.

Mở ngay hôm nay!

Trân trọng,
[Tên nhân viên]
SHB Bank`,
  },
];

// ─── Main Seed ─────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...');

  // ── Users ─────────────────────────────────────────────

  console.log('  → Creating users...');
  const manager = await prisma.user.upsert({
    where: { email: 'manager@shb.com.vn' },
    update: {},
    create: {
      email: 'manager@shb.com.vn',
      passwordHash: hashPassword('Manager@123'),
      fullName: 'Nguyễn Văn Quản Lý',
      role: 'MANAGER',
    },
  });

  const salesUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sales1@shb.com.vn' },
      update: {},
      create: {
        email: 'sales1@shb.com.vn',
        passwordHash: hashPassword('Sales@123'),
        fullName: 'Trần Thị Bích Vân',
        role: 'SALES',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sales2@shb.com.vn' },
      update: {},
      create: {
        email: 'sales2@shb.com.vn',
        passwordHash: hashPassword('Sales@123'),
        fullName: 'Lê Minh Hoàng',
        role: 'SALES',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sales3@shb.com.vn' },
      update: {},
      create: {
        email: 'sales3@shb.com.vn',
        passwordHash: hashPassword('Sales@123'),
        fullName: 'Phạm Thị Thu Hà',
        role: 'SALES',
      },
    }),
  ]);

  console.log(`  ✓ Users: 1 manager + ${salesUsers.length} sales`);

  // ── Customers ──────────────────────────────────────────

  console.log('  → Creating 30 customers...');
  const customerData = [
    {
      fullName: 'Nguyễn Thị Lan',
      age: 34,
      gender: 'Nữ',
      occupation: 'Kế toán',
      income: 22000000,
      city: 'Hà Nội',
      salaryAccount: true,
    },
    {
      fullName: 'Trần Văn Hùng',
      age: 41,
      gender: 'Nam',
      occupation: 'Kinh doanh tự do',
      income: 45000000,
      city: 'TP.HCM',
      salaryAccount: false,
    },
    {
      fullName: 'Lê Thị Hoa',
      age: 28,
      gender: 'Nữ',
      occupation: 'Giáo viên',
      income: 15000000,
      city: 'Đà Nẵng',
      salaryAccount: true,
    },
    {
      fullName: 'Phạm Minh Tuấn',
      age: 37,
      gender: 'Nam',
      occupation: 'Kỹ sư phần mềm',
      income: 38000000,
      city: 'Hà Nội',
      salaryAccount: true,
    },
    {
      fullName: 'Hoàng Thị Mai',
      age: 45,
      gender: 'Nữ',
      occupation: 'Bác sĩ',
      income: 55000000,
      city: 'TP.HCM',
      salaryAccount: true,
    },
    {
      fullName: 'Vũ Đình Nam',
      age: 29,
      gender: 'Nam',
      occupation: 'Nhân viên văn phòng',
      income: 18000000,
      city: 'Hải Phòng',
      salaryAccount: true,
    },
    {
      fullName: 'Đặng Thị Hương',
      age: 33,
      gender: 'Nữ',
      occupation: 'Luật sư',
      income: 42000000,
      city: 'Hà Nội',
      salaryAccount: false,
    },
    {
      fullName: 'Bùi Văn Long',
      age: 50,
      gender: 'Nam',
      occupation: 'Kinh doanh tự do',
      income: 70000000,
      city: 'TP.HCM',
      salaryAccount: false,
    },
    {
      fullName: 'Ngô Thị Bình',
      age: 26,
      gender: 'Nữ',
      occupation: 'Sinh viên',
      income: 5000000,
      city: 'Đà Nẵng',
      salaryAccount: false,
    },
    {
      fullName: 'Đinh Văn Phong',
      age: 38,
      gender: 'Nam',
      occupation: 'Kỹ sư phần mềm',
      income: 32000000,
      city: 'Hà Nội',
      salaryAccount: true,
    },
    {
      fullName: 'Trịnh Thị Cúc',
      age: 42,
      gender: 'Nữ',
      occupation: 'Kế toán',
      income: 25000000,
      city: 'Cần Thơ',
      salaryAccount: true,
    },
    {
      fullName: 'Lý Văn Tùng',
      age: 31,
      gender: 'Nam',
      occupation: 'Nhân viên văn phòng',
      income: 20000000,
      city: 'Nha Trang',
      salaryAccount: true,
    },
    {
      fullName: 'Mai Thị Loan',
      age: 36,
      gender: 'Nữ',
      occupation: 'Giáo viên',
      income: 17000000,
      city: 'TP.HCM',
      salaryAccount: true,
    },
    {
      fullName: 'Phan Văn Đức',
      age: 44,
      gender: 'Nam',
      occupation: 'Bác sĩ',
      income: 60000000,
      city: 'Hà Nội',
      salaryAccount: false,
    },
    {
      fullName: 'Cao Thị Thúy',
      age: 27,
      gender: 'Nữ',
      occupation: 'Kế toán',
      income: 19000000,
      city: 'Hải Phòng',
      salaryAccount: true,
    },
    {
      fullName: 'Dương Minh Khoa',
      age: 35,
      gender: 'Nam',
      occupation: 'Kinh doanh tự do',
      income: 35000000,
      city: 'TP.HCM',
      salaryAccount: false,
    },
    {
      fullName: 'Lưu Thị Nhung',
      age: 30,
      gender: 'Nữ',
      occupation: 'Nhân viên văn phòng',
      income: 21000000,
      city: 'Đà Nẵng',
      salaryAccount: true,
    },
    {
      fullName: 'Trương Văn Bảo',
      age: 48,
      gender: 'Nam',
      occupation: 'Kinh doanh tự do',
      income: 80000000,
      city: 'TP.HCM',
      salaryAccount: false,
    },
    {
      fullName: 'Nguyễn Thị Thủy',
      age: 32,
      gender: 'Nữ',
      occupation: 'Kỹ sư phần mềm',
      income: 28000000,
      city: 'Hà Nội',
      salaryAccount: true,
    },
    {
      fullName: 'Võ Văn Cường',
      age: 39,
      gender: 'Nam',
      occupation: 'Luật sư',
      income: 48000000,
      city: 'TP.HCM',
      salaryAccount: true,
    },
    {
      fullName: 'Hà Thị Minh',
      age: 25,
      gender: 'Nữ',
      occupation: 'Sinh viên',
      income: 8000000,
      city: 'Hà Nội',
      salaryAccount: false,
    },
    {
      fullName: 'Đỗ Văn Kiên',
      age: 43,
      gender: 'Nam',
      occupation: 'Kỹ sư phần mềm',
      income: 40000000,
      city: 'Hà Nội',
      salaryAccount: true,
    },
    {
      fullName: 'Tô Thị Linh',
      age: 29,
      gender: 'Nữ',
      occupation: 'Nhân viên văn phòng',
      income: 16000000,
      city: 'Cần Thơ',
      salaryAccount: true,
    },
    {
      fullName: 'Châu Văn Hải',
      age: 46,
      gender: 'Nam',
      occupation: 'Bác sĩ',
      income: 65000000,
      city: 'TP.HCM',
      salaryAccount: false,
    },
    {
      fullName: 'Kiều Thị Lan',
      age: 34,
      gender: 'Nữ',
      occupation: 'Kế toán',
      income: 23000000,
      city: 'Hà Nội',
      salaryAccount: true,
    },
    {
      fullName: 'Lê Văn Trí',
      age: 40,
      gender: 'Nam',
      occupation: 'Kinh doanh tự do',
      income: 52000000,
      city: 'Đà Nẵng',
      salaryAccount: false,
    },
    {
      fullName: 'Phạm Thị Nga',
      age: 28,
      gender: 'Nữ',
      occupation: 'Giáo viên',
      income: 14000000,
      city: 'Hải Phòng',
      salaryAccount: true,
    },
    {
      fullName: 'Nguyễn Văn Dũng',
      age: 52,
      gender: 'Nam',
      occupation: 'Kinh doanh tự do',
      income: 90000000,
      city: 'TP.HCM',
      salaryAccount: false,
    },
    {
      fullName: 'Trần Thị Hằng',
      age: 31,
      gender: 'Nữ',
      occupation: 'Kỹ sư phần mềm',
      income: 30000000,
      city: 'Hà Nội',
      salaryAccount: true,
    },
    {
      fullName: 'Hoàng Văn Thắng',
      age: 37,
      gender: 'Nam',
      occupation: 'Nhân viên văn phòng',
      income: 24000000,
      city: 'Nha Trang',
      salaryAccount: true,
    },
  ];

  const customers = await Promise.all(
    customerData.map((c, i) =>
      prisma.customer.upsert({
        where: { email: `customer${i + 1}@example.com` },
        update: {},
        create: {
          ...c,
          email: `customer${i + 1}@example.com`,
          phone: `09${randomInt(10000000, 99999999)}`,
        },
      }),
    ),
  );

  console.log(`  ✓ Customers: ${customers.length}`);

  // ── CustomerProducts ────────────────────────────────────

  console.log('  → Creating customer products...');
  const productTypes: Array<
    'LOAN' | 'SAVING' | 'CREDIT_CARD' | 'INSURANCE' | 'INVESTMENT'
  > = ['LOAN', 'SAVING', 'CREDIT_CARD', 'INSURANCE', 'INVESTMENT'];

  let productCount = 0;
  for (const customer of customers) {
    const n = randomInt(2, 5);
    const types = pickRandomN(productTypes, n);
    for (const productType of types) {
      await prisma.customerProduct.create({
        data: {
          customerId: customer.id,
          productType,
          openedDate: daysAgo(randomInt(30, 1000)),
          status: Math.random() > 0.15 ? 'ACTIVE' : 'CLOSED',
        },
      });
      productCount++;
    }
  }

  console.log(`  ✓ CustomerProducts: ${productCount}`);

  // ── CustomerInteractions ────────────────────────────────

  console.log('  → Creating customer interactions...');
  const interactionTypes: Array<
    | 'EMAIL_OPEN'
    | 'EMAIL_CLICK'
    | 'CALL'
    | 'BRANCH_VISIT'
    | 'WEBSITE_VISIT'
    | 'APP_LOGIN'
    | 'LOAN_INQUIRY'
  > = [
    'EMAIL_OPEN',
    'EMAIL_CLICK',
    'CALL',
    'BRANCH_VISIT',
    'WEBSITE_VISIT',
    'APP_LOGIN',
    'LOAN_INQUIRY',
  ];

  const metadataByType: Record<string, () => object> = {
    EMAIL_OPEN: () => ({
      campaign: pickRandom(['Summer2026', 'Q3Promotion', 'NewProduct']),
      openedAt: new Date().toISOString(),
    }),
    EMAIL_CLICK: () => ({
      link: pickRandom(['/credit-card', '/home-loan', '/saving']),
      campaign: 'Summer2026',
    }),
    CALL: () => ({
      duration: randomInt(60, 600),
      outcome: pickRandom(['interested', 'no_answer', 'callback_requested']),
    }),
    BRANCH_VISIT: () => ({
      branch: pickRandom([
        'Hà Nội - Hoàn Kiếm',
        'TP.HCM - Q1',
        'Đà Nẵng - Hải Châu',
      ]),
      purpose: pickRandom(['inquiry', 'document', 'complaint']),
    }),
    WEBSITE_VISIT: () => ({
      page: pickRandom(['/credit-card', '/home-loan', '/saving', '/insurance']),
      duration: randomInt(30, 600),
    }),
    APP_LOGIN: () => ({
      device: pickRandom(['iOS', 'Android']),
      version: '3.2.1',
    }),
    LOAN_INQUIRY: () => ({
      amount: randomInt(50, 500) * 1000000,
      purpose: pickRandom(['home', 'business', 'personal']),
    }),
  };

  let interactionCount = 0;
  for (const customer of customers) {
    const n = randomInt(5, 15);
    for (let i = 0; i < n; i++) {
      const type = pickRandom(interactionTypes);
      await prisma.customerInteraction.create({
        data: {
          customerId: customer.id,
          interactionType: type,
          occurredAt: daysAgo(randomInt(1, 90)),
          metadata: metadataByType[type](),
        },
      });
      interactionCount++;
    }
  }

  console.log(`  ✓ CustomerInteractions: ${interactionCount}`);

  // ── Leads ────────────────────────────────────────────────

  console.log('  → Creating 20 leads...');
  const leadStatuses: Array<
    | 'NEW'
    | 'QUALIFIED'
    | 'CONTACTED'
    | 'PROPOSAL'
    | 'NEGOTIATION'
    | 'WON'
    | 'LOST'
  > = [
    'NEW',
    'QUALIFIED',
    'CONTACTED',
    'PROPOSAL',
    'NEGOTIATION',
    'WON',
    'LOST',
  ];

  const allUsers = [manager, ...salesUsers];
  const selectedCustomers = customers.slice(0, 20); // first 20 customers

  const leads = await Promise.all(
    selectedCustomers.map((customer, i) =>
      prisma.lead.create({
        data: {
          customerId: customer.id,
          assignedTo: pickRandom(salesUsers).id,
          interestedProduct: pickRandom(PRODUCTS_INTEREST),
          status: pickRandom(leadStatuses),
          createdAt: daysAgo(randomInt(1, 60)),
        },
      }),
    ),
  );

  console.log(`  ✓ Leads: ${leads.length}`);

  // ── LeadScores ───────────────────────────────────────────

  console.log('  → Creating lead scores...');
  for (const lead of leads) {
    const score = randomFloat(20, 98, 1);
    await prisma.leadScore.create({
      data: {
        leadId: lead.id,
        score,
        conversionProbability: parseFloat((score / 100).toFixed(2)),
        topFeatures: [
          pickRandom([
            'Income',
            'Website Visit',
            'Loan Inquiry',
            'Branch Visit',
            'Email Click',
          ]),
          pickRandom([
            'Age',
            'Occupation',
            'Salary Account',
            'Existing Products',
          ]),
          pickRandom([
            'Call Duration',
            'App Login Frequency',
            'Interaction Recency',
          ]),
        ],
        predictedAt: daysAgo(randomInt(0, 7)),
      },
    });
  }

  console.log(`  ✓ LeadScores: ${leads.length}`);

  // ── ProductRecommendations ───────────────────────────────

  console.log('  → Creating product recommendations...');
  for (const lead of leads) {
    const recs = pickRandomN(PRODUCT_RECOMMENDATIONS, randomInt(1, 3));
    for (const rec of recs) {
      await prisma.productRecommendation.create({
        data: {
          leadId: lead.id,
          productName: rec.name,
          confidence: randomFloat(0.6, 0.98),
          reason: rec.reason,
          generatedAt: daysAgo(randomInt(0, 5)),
        },
      });
    }
  }

  console.log('  ✓ ProductRecommendations created');

  // ── Recommendations (Next Best Action) ──────────────────

  console.log('  → Creating next best actions...');
  const actions: Array<'CALL' | 'EMAIL' | 'MEETING' | 'WAIT'> = [
    'CALL',
    'EMAIL',
    'MEETING',
    'WAIT',
  ];
  const priorities: Array<'HIGH' | 'MEDIUM' | 'LOW'> = [
    'HIGH',
    'MEDIUM',
    'LOW',
  ];

  const actionReasons: Record<string, string> = {
    CALL: 'Khách hàng truy cập trang vay vốn 3 lần trong 7 ngày qua.',
    EMAIL: 'Khách hàng đã mở email quảng cáo nhưng chưa click CTA.',
    MEETING: 'Lead có điểm cao >80, cần tư vấn trực tiếp để chốt.',
    WAIT: 'Khách hàng vừa được liên hệ hôm qua, cần thêm thời gian suy nghĩ.',
  };

  for (const lead of leads) {
    const action = pickRandom(actions);
    await prisma.recommendation.create({
      data: {
        leadId: lead.id,
        action,
        priority: pickRandom(priorities),
        reason: actionReasons[action],
        generatedAt: daysAgo(randomInt(0, 3)),
      },
    });
  }

  console.log(`  ✓ Recommendations (NBA): ${leads.length}`);

  // ── GeneratedContent (10 emails) ────────────────────────

  console.log('  → Creating generated content...');
  const selectedLeads = leads.slice(0, 10);
  for (let i = 0; i < selectedLeads.length; i++) {
    const sample = EMAIL_CONTENT_SAMPLES[i % EMAIL_CONTENT_SAMPLES.length];
    await prisma.generatedContent.create({
      data: {
        leadId: selectedLeads[i].id,
        type: 'EMAIL',
        prompt: `Viết email chào hàng ${pickRandom(PRODUCTS_INTEREST)} cho khách hàng thu nhập ${randomInt(15, 80)} triệu/tháng`,
        content: sample.body,
        model: pickRandom(['gemini-1.5-pro', 'gemini-2.0-flash']),
        createdAt: daysAgo(randomInt(0, 14)),
      },
    });
  }

  console.log('  ✓ GeneratedContent: 10 emails');

  // ── SalesTasks (15 tasks) ────────────────────────────────

  console.log('  → Creating sales tasks...');
  const taskTypes: Array<'CALL' | 'EMAIL' | 'MEETING'> = [
    'CALL',
    'EMAIL',
    'MEETING',
  ];
  const taskStatuses: Array<'TODO' | 'IN_PROGRESS' | 'DONE' | 'FAILED'> = [
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'FAILED',
  ];

  const taskNotes: Record<string, string> = {
    CALL: 'Gọi điện xác nhận nhu cầu vay vốn và hẹn lịch tư vấn',
    EMAIL: 'Gửi email với thông tin chi tiết sản phẩm và ưu đãi hiện tại',
    MEETING: 'Gặp mặt trực tiếp tại văn phòng để ký hợp đồng',
  };

  for (let i = 0; i < 15; i++) {
    const lead = leads[i % leads.length];
    const salesUser = pickRandom(salesUsers);
    const taskType = pickRandom(taskTypes);
    const taskStatus = pickRandom(taskStatuses);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + randomInt(-5, 14));

    await prisma.salesTask.create({
      data: {
        leadId: lead.id,
        assignedTo: salesUser.id,
        taskType,
        status: taskStatus,
        dueDate,
        completedAt: taskStatus === 'DONE' ? daysAgo(randomInt(1, 5)) : null,
        note: taskNotes[taskType],
      },
    });
  }

  console.log('  ✓ SalesTasks: 15');

  // ── Summary ──────────────────────────────────────────────

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────');
  console.log(`  Users:                  4 (1 manager + 3 sales)`);
  console.log(`  Customers:              ${customers.length}`);
  console.log(`  CustomerProducts:       ${productCount}`);
  console.log(`  CustomerInteractions:   ${interactionCount}`);
  console.log(`  Leads:                  ${leads.length}`);
  console.log(`  LeadScores:             ${leads.length}`);
  console.log(`  ProductRecommendations: (1–3 per lead)`);
  console.log(`  Recommendations (NBA):  ${leads.length}`);
  console.log(`  GeneratedContent:       10`);
  console.log(`  SalesTasks:             15`);
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
