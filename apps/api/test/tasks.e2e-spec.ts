import 'iconv-lite/encodings';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let customerId: string;
  let leadId: string;
  let createdTaskId: string;

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

    // Login to get access token and user ID
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'sales1@shb.com.vn',
        password: 'Sales@123',
      });
    accessToken = loginRes.body.accessToken;

    const user = await prisma.user.findUnique({
      where: { email: 'sales1@shb.com.vn' },
    });
    if (user) {
      userId = user.id;
    }

    // Create a dedicated test customer
    const customer = await prisma.customer.create({
      data: {
        fullName: 'Test Tasks Customer',
      },
    });
    customerId = customer.id;

    // Create a dedicated test lead
    const lead = await prisma.lead.create({
      data: {
        customerId: customerId,
        status: 'NEW',
      },
    });
    leadId = lead.id;
  });

  afterAll(async () => {
    // Clean up tasks, lead, and customer
    if (leadId) {
      await prisma.salesTask.deleteMany({
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

  describe('POST /tasks', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({
          leadId,
          taskType: 'CALL',
        })
        .expect(401);
    });

    it('should create a task defaulting assignedTo to current user', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          leadId,
          taskType: 'CALL',
          dueDate: new Date().toISOString(),
          note: 'Call client to offer savings product',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.leadId).toBe(leadId);
      expect(res.body.assignedTo).toBe(userId);
      expect(res.body.taskType).toBe('CALL');
      expect(res.body.status).toBe('TODO');
      expect(res.body.completedAt).toBeNull();

      createdTaskId = res.body.id;
    });

    it('should throw 404 if lead does not exist', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          leadId: '99999999-9999-4999-b999-999999999999',
          taskType: 'CALL',
        })
        .expect(404);
    });
  });

  describe('GET /tasks', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .expect(401);
    });

    it('should return all tasks with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter tasks by status and taskType', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks?status=TODO&taskType=CALL')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.every((t: any) => t.status === 'TODO' && t.taskType === 'CALL')).toBe(true);
    });
  });

  describe('GET /tasks/today', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/tasks/today')
        .expect(401);
    });

    it('should return tasks due today', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks/today')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(401);
    });

    it('should return task details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdTaskId);
      expect(res.body.leadId).toBe(leadId);
    });

    it('should throw 404 if task does not exist', async () => {
      await request(app.getHttpServer())
        .get('/tasks/99999999-9999-4999-b999-999999999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should throw 401 if unauthorized', async () => {
      await request(app.getHttpServer())
        .put(`/tasks/${createdTaskId}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(401);
    });

    it('should update note and status', async () => {
      const res = await request(app.getHttpServer())
        .put(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'IN_PROGRESS',
          note: 'Customer seems interested but busy. Call back later.',
        })
        .expect(200);

      expect(res.body.status).toBe('IN_PROGRESS');
      expect(res.body.note).toBe('Customer seems interested but busy. Call back later.');
      expect(res.body.completedAt).toBeNull();
    });

    it('should automatically set completedAt when status is updated to DONE', async () => {
      const res = await request(app.getHttpServer())
        .put(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'DONE' })
        .expect(200);

      expect(res.body.status).toBe('DONE');
      expect(res.body.completedAt).not.toBeNull();
      expect(new Date(res.body.completedAt).getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should reset completedAt to null when status is moved away from DONE', async () => {
      const res = await request(app.getHttpServer())
        .put(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'FAILED' })
        .expect(200);

      expect(res.body.status).toBe('FAILED');
      expect(res.body.completedAt).toBeNull();
    });

    it('should throw 404 if task does not exist', async () => {
      await request(app.getHttpServer())
        .put('/tasks/99999999-9999-4999-b999-999999999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'DONE' })
        .expect(404);
    });
  });
});
