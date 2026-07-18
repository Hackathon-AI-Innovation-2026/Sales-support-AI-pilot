import 'iconv-lite/encodings';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('AiController (e2e)', () => {
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

    // Create a dedicated test customer who matches recommendation rules
    const customer = await prisma.customer.create({
      data: {
        fullName: 'Test AI Customer',
        income: 35000000,
        age: 28,
        salaryAccount: true,
      },
    });
    customerId = customer.id;

    // Create a dedicated test lead for this customer
    const lead = await prisma.lead.create({
      data: {
        customerId: customerId,
        status: 'NEW',
      },
    });
    leadId = lead.id;
  });

  afterAll(async () => {
    // Clean up created generated contents, recommendations, lead, and customer
    if (leadId) {
      await prisma.generatedContent.deleteMany({
        where: { leadId },
      });
      await prisma.productRecommendation.deleteMany({
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

  describe('POST /ai/generate-email', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/ai/generate-email')
        .send({ leadId })
        .expect(401);
    });

    it('should generate a personalized email and save it', async () => {
      const res = await request(app.getHttpServer())
        .post('/ai/generate-email')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ leadId })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.leadId).toBe(leadId);
      expect(res.body.type).toBe('EMAIL');
      expect(res.body).toHaveProperty('content');

      const parsedContent = JSON.parse(res.body.content);
      expect(parsedContent).toHaveProperty('subject');
      expect(parsedContent).toHaveProperty('body');
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .post('/ai/generate-email')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ leadId: '99999999-9999-4999-b999-999999999999' })
        .expect(404);
    });
  });

  describe('POST /ai/generate-pitch', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/ai/generate-pitch')
        .send({ leadId })
        .expect(401);
    });

    it('should generate a sales pitch and save it', async () => {
      const res = await request(app.getHttpServer())
        .post('/ai/generate-pitch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ leadId })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.leadId).toBe(leadId);
      expect(res.body.type).toBe('PITCH');
      expect(res.body).toHaveProperty('content');
      expect(typeof res.body.content).toBe('string');
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .post('/ai/generate-pitch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ leadId: '99999999-9999-4999-b999-999999999999' })
        .expect(404);
    });
  });

  describe('POST /ai/chat', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/ai/chat')
        .send({ message: 'Hello' })
        .expect(401);
    });

    it('should stream the response back using SSE', async () => {
      const res = await request(app.getHttpServer())
        .post('/ai/chat')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          message: 'Tư vấn sản phẩm thẻ tín dụng',
          leadId: leadId,
          conversationHistory: [],
        })
        .expect(201);

      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.text).toContain('data:');
      expect(res.text).toContain('[DONE]');
    }, 15000);
  });

  describe('GET /leads/:id/generated-content', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`/leads/${leadId}/generated-content`)
        .expect(401);
    });

    it('should retrieve all generated content history for a lead', async () => {
      const res = await request(app.getHttpServer())
        .get(`/leads/${leadId}/generated-content`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should support filtering by type', async () => {
      const res = await request(app.getHttpServer())
        .get(`/leads/${leadId}/generated-content?type=EMAIL`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((c: any) => c.type === 'EMAIL')).toBe(true);
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .get('/leads/99999999-9999-4999-b999-999999999999/generated-content')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
