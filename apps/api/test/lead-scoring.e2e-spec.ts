import 'iconv-lite/encodings';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('LeadScoringController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let leadId: string;
  let createdScoreId: string;

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
    // Clean up created lead scores in tests
    if (createdScoreId) {
      await prisma.leadScore.deleteMany({
        where: { id: createdScoreId },
      });
    }
    await app.close();
  });

  describe('POST /leads/:id/score', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .post(`/leads/${leadId}/score`)
        .expect(401);
    });

    it('should trigger scoring for a lead and update the lead latestScore', async () => {
      const res = await request(app.getHttpServer())
        .post(`/leads/${leadId}/score`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.leadId).toBe(leadId);
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('conversionProbability');
      expect(Array.isArray(res.body.topFeatures)).toBe(true);

      createdScoreId = res.body.id;

      // Verify that the lead model was updated with the latest score
      const updatedLead = await prisma.lead.findUnique({
        where: { id: leadId },
      });
      expect(updatedLead?.latestScore).toBe(res.body.score);
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .post('/leads/99999999-9999-4999-b999-999999999999/score')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('GET /leads/:id/score', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`/leads/${leadId}/score`)
        .expect(401);
    });

    it('should retrieve the latest score of a lead', async () => {
      const res = await request(app.getHttpServer())
        .get(`/leads/${leadId}/score`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdScoreId);
      expect(res.body.leadId).toBe(leadId);
      expect(res.body).toHaveProperty('score');
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .get('/leads/99999999-9999-4999-b999-999999999999/score')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('GET /leads/:id/scores', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`/leads/${leadId}/scores`)
        .expect(401);
    });

    it('should retrieve all scores of a lead sorted desc', async () => {
      const res = await request(app.getHttpServer())
        .get(`/leads/${leadId}/scores`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].id).toBe(createdScoreId);
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .get('/leads/99999999-9999-4999-b999-999999999999/scores')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
