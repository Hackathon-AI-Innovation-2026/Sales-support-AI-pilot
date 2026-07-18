import 'iconv-lite/encodings';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('CustomersController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let customerId: string;

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

    // Get an access token by logging in
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'sales1@shb.com.vn',
        password: 'Sales@123',
      });

    accessToken = loginRes.body.accessToken;

    // Get a customer from the database
    const customer = await prisma.customer.findFirst({
      where: { deletedAt: null },
    });
    if (customer) {
      customerId = customer.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /customers/:id/interactions', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`/customers/${customerId}/interactions`)
        .expect(401);
    });

    it('should get interaction history with pagination metadata', async () => {
      const res = await request(app.getHttpServer())
        .get(`/customers/${customerId}/interactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('limit');
      expect(res.body.meta).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by interactionType', async () => {
      // Find what types of interactions exist for this customer
      const interactions = await prisma.customerInteraction.findMany({
        where: { customerId },
      });

      if (interactions.length > 0) {
        const type = interactions[0].interactionType;
        const res = await request(app.getHttpServer())
          .get(`/customers/${customerId}/interactions`)
          .query({ interactionType: type })
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(
          res.body.data.every((item: any) => item.interactionType === type),
        ).toBe(true);
      }
    });

    it('should throw 400 for invalid interactionType', async () => {
      await request(app.getHttpServer())
        .get(`/customers/${customerId}/interactions`)
        .query({ interactionType: 'INVALID_TYPE' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should throw 404 if customer not found', async () => {
      await request(app.getHttpServer())
        .get(`/customers/00000000-0000-0000-0000-000000000000/interactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('GET /customers/:id/leads', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`/customers/${customerId}/leads`)
        .expect(401);
    });

    it('should get leads of customer', async () => {
      const res = await request(app.getHttpServer())
        .get(`/customers/${customerId}/leads`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should throw 404 if customer not found', async () => {
      await request(app.getHttpServer())
        .get(`/customers/00000000-0000-0000-0000-000000000000/leads`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
