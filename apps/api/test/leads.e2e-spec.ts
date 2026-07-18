import 'iconv-lite/encodings';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('LeadsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let salesUserId: string;
  let customerId: string;
  let createdLeadId: string;

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

    // Get access token for a SALES user
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'sales1@shb.com.vn',
        password: 'Sales@123',
      });

    accessToken = loginRes.body.accessToken;
    salesUserId = loginRes.body.user.id;

    // Get an active customer to create leads for
    const customer = await prisma.customer.findFirst({
      where: { deletedAt: null },
    });
    if (customer) {
      customerId = customer.id;
    }
  });

  afterAll(async () => {
    // Clean up created lead
    if (createdLeadId) {
      await prisma.lead.deleteMany({
        where: { id: createdLeadId },
      });
    }
    await app.close();
  });

  describe('POST /leads', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/leads')
        .send({ customerId })
        .expect(401);
    });

    it('should create a lead and default assignedTo to the current SALES user if omitted', async () => {
      const res = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId,
          interestedProduct: 'SHB Visa Platinum',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.customerId).toBe(customerId);
      expect(res.body.assignedTo).toBe(salesUserId);
      expect(res.body.status).toBe('NEW');

      createdLeadId = res.body.id;
    });

    it('should throw 404 if customer does not exist', async () => {
      await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId: '99999999-9999-4999-b999-999999999999',
        })
        .expect(404);
    });

    it('should throw 400 for invalid customerId UUID', async () => {
      await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerId: 'invalid-uuid',
        })
        .expect(400);
    });
  });

  describe('GET /leads', () => {
    it('should return leads list with pagination metadata', async () => {
      const res = await request(app.getHttpServer())
        .get('/leads')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('limit');
      expect(res.body.meta).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((l: any) => l.id === createdLeadId)).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/leads')
        .query({ status: 'NEW' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.every((l: any) => l.status === 'NEW')).toBe(true);
    });

    it('should filter by assignedTo', async () => {
      const res = await request(app.getHttpServer())
        .get('/leads')
        .query({ assignedTo: salesUserId })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(
        res.body.data.every((l: any) => l.assignedTo === salesUserId),
      ).toBe(true);
    });

    it('should filter by score range and sort by score DESC', async () => {
      // First, let's update our created lead to have a score
      await prisma.lead.update({
        where: { id: createdLeadId },
        data: { latestScore: 85.5 },
      });

      // Query with minScore and maxScore
      const res = await request(app.getHttpServer())
        .get('/leads')
        .query({
          minScore: 80,
          maxScore: 90,
          sortBy: 'score',
          sortOrder: 'desc',
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(
        res.body.data.every(
          (l: any) => l.latestScore >= 80 && l.latestScore <= 90,
        ),
      ).toBe(true);

      // Verify sorting descending
      if (res.body.data.length > 1) {
        for (let i = 0; i < res.body.data.length - 1; i++) {
          const currentScore = res.body.data[i].latestScore as number;
          const nextScore = res.body.data[i + 1].latestScore as number;
          expect(currentScore).toBeGreaterThanOrEqual(nextScore);
        }
      }
    });
  });

  describe('GET /leads/:id', () => {
    it('should fetch lead details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/leads/${createdLeadId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdLeadId);
      expect(res.body).toHaveProperty('customer');
      expect(res.body).toHaveProperty('scores');
      expect(res.body).toHaveProperty('assignedUser');
    });

    it('should throw 404 if lead is not found', async () => {
      await request(app.getHttpServer())
        .get('/leads/99999999-9999-4999-b999-999999999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PUT /leads/:id', () => {
    it('should update lead fields', async () => {
      const res = await request(app.getHttpServer())
        .put(`/leads/${createdLeadId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'QUALIFIED',
          interestedProduct: 'SHB Home Loan',
        })
        .expect(200);

      expect(res.body.status).toBe('QUALIFIED');
      expect(res.body.interestedProduct).toBe('SHB Home Loan');
    });
  });

  describe('DELETE /leads/:id', () => {
    it('should soft delete the lead', async () => {
      await request(app.getHttpServer())
        .delete(`/leads/${createdLeadId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify lead is excluded from list
      const listRes = await request(app.getHttpServer())
        .get('/leads')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(listRes.body.data.some((l: any) => l.id === createdLeadId)).toBe(
        false,
      );

      // Verify detail page returns 404
      await request(app.getHttpServer())
        .get(`/leads/${createdLeadId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
