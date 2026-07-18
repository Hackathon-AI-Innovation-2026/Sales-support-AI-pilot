import 'iconv-lite/encodings';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('DashboardController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let customerId: string;
  let leadId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);

    // Login to get access token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'sales1@shb.com.vn',
        password: 'Sales@123',
      });
    accessToken = loginRes.body.accessToken;

    // Create a dedicated test customer
    const customer = await prisma.customer.create({
      data: {
        fullName: 'Test Dashboard Customer',
      },
    });
    customerId = customer.id;

    // Create a dedicated test lead in NEGOTIATION stage with a score for revenue forecasting
    const lead = await prisma.lead.create({
      data: {
        customerId: customerId,
        status: 'NEGOTIATION',
        interestedProduct: 'Home Loan',
        latestScore: 85,
      },
    });
    leadId = lead.id;

    // Create a score record for the lead
    await prisma.leadScore.create({
      data: {
        leadId: leadId,
        score: 85,
        conversionProbability: 0.85,
      },
    });
  });

  afterAll(async () => {
    // Clean up created records
    if (leadId) {
      await prisma.leadScore.deleteMany({
        where: { leadId },
      });
      await prisma.lead.delete({
        where: { id: leadId },
      });
    }
    if (customerId) {
      await prisma.customer.delete({
        where: { id: customerId },
      });
    }
    await app.close();
  });

  describe('GET /dashboard/summary', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/summary')
        .expect(401);
    });

    it('should return summary metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalLeads');
      expect(res.body).toHaveProperty('wonThisMonth');
      expect(res.body).toHaveProperty('activeTasks');
      expect(typeof res.body.totalLeads).toBe('number');
      expect(typeof res.body.wonThisMonth).toBe('number');
      expect(typeof res.body.activeTasks).toBe('number');
    });
  });

  describe('GET /dashboard/funnel', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/funnel')
        .expect(401);
    });

    it('should return count for all 7 funnel stages', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/funnel')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(7);
      expect(res.body[0]).toHaveProperty('stage');
      expect(res.body[0]).toHaveProperty('count');
    });
  });

  describe('GET /dashboard/hot-leads', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/hot-leads')
        .expect(401);
    });

    it('should return top leads ordered desc by score', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/hot-leads?limit=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(5);
      if (res.body.length > 1) {
        expect(res.body[0].latestScore).toBeGreaterThanOrEqual(res.body[1].latestScore);
      }
    });
  });

  describe('GET /dashboard/conversion-rate', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/conversion-rate')
        .expect(401);
    });

    it('should return conversion rate metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/conversion-rate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('wonCount');
      expect(res.body).toHaveProperty('lostCount');
      expect(res.body).toHaveProperty('conversionRate');
      expect(typeof res.body.conversionRate).toBe('number');
    });
  });

  describe('GET /dashboard/revenue-forecast', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/revenue-forecast')
        .expect(401);
    });

    it('should calculate revenue forecast successfully', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/revenue-forecast')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalForecast');
      expect(res.body).toHaveProperty('details');
      expect(typeof res.body.totalForecast).toBe('number');
      expect(Array.isArray(res.body.details)).toBe(true);

      const testDetails = res.body.details.find((d: any) => d.leadId === leadId);
      expect(testDetails).toBeDefined();
      expect(testDetails.interestedProduct).toBe('Home Loan');
      expect(testDetails.value).toBe(1000000000); // 1B VND
      expect(testDetails.probability).toBe(0.85);
      expect(testDetails.forecast).toBe(850000000); // 850M VND
    });
  });
});
