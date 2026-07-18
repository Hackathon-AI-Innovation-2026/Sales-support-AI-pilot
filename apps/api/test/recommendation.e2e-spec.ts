import 'iconv-lite/encodings';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('RecommendationController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
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

    // Get an active lead
    const lead = await prisma.lead.findFirst({
      where: { deletedAt: null },
    });
    if (lead) {
      leadId = lead.id;
    }
  });

  afterAll(async () => {
    // Clean up created recommendations in tests
    if (leadId) {
      await prisma.productRecommendation.deleteMany({
        where: { leadId },
      });
      await prisma.recommendation.deleteMany({
        where: { leadId },
      });
      await prisma.generatedContent.deleteMany({
        where: { leadId },
      });
    }
    await app.close();
  });

  describe('POST /leads/:id/recommend-product', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .post(`/leads/${leadId}/recommend-product`)
        .expect(401);
    });

    it('should run rule engine and create product recommendations', async () => {
      const res = await request(app.getHttpServer())
        .post(`/leads/${leadId}/recommend-product`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0].leadId).toBe(leadId);
        expect(res.body[0]).toHaveProperty('productName');
        expect(res.body[0]).toHaveProperty('confidence');
      }
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .post('/leads/99999999-9999-4999-b999-999999999999/recommend-product')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('POST /leads/:id/next-best-action', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .post(`/leads/${leadId}/next-best-action`)
        .expect(401);
    });

    it('should run next best action (mock mode) and save recommendations + generated content', async () => {
      const res = await request(app.getHttpServer())
        .post(`/leads/${leadId}/next-best-action`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.leadId).toBe(leadId);
      expect(res.body).toHaveProperty('action');
      expect(res.body).toHaveProperty('priority');
      expect(res.body).toHaveProperty('reason');
      expect(res.body).toHaveProperty('suggestedContent');

      // Verify that GeneratedContent record is created if action is not WAIT
      if (res.body.action !== 'WAIT') {
        const genContent = await prisma.generatedContent.findFirst({
          where: { leadId },
        });
        expect(genContent).not.toBeNull();
        expect(genContent?.content).toBe(res.body.suggestedContent);
      }
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .post('/leads/99999999-9999-4999-b999-999999999999/next-best-action')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('GET /leads/:id/recommendations', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`/leads/${leadId}/recommendations`)
        .expect(401);
    });

    it('should retrieve all recommendations for the lead', async () => {
      const res = await request(app.getHttpServer())
        .get(`/leads/${leadId}/recommendations`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('productRecommendations');
      expect(res.body).toHaveProperty('nextBestActions');
      expect(Array.isArray(res.body.productRecommendations)).toBe(true);
      expect(Array.isArray(res.body.nextBestActions)).toBe(true);
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .get('/leads/99999999-9999-4999-b999-999999999999/recommendations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
