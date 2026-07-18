import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dtos/task.dto';
import { type User, TaskStatus, Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, creator: User) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: dto.leadId, deletedAt: null },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${dto.leadId} not found`);
    }

    const assignedTo = dto.assignedTo ?? creator.id;

    // Verify assigned user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: assignedTo },
    });

    if (!userExists) {
      throw new NotFoundException(`User with ID ${assignedTo} not found`);
    }

    return this.prisma.salesTask.create({
      data: {
        leadId: dto.leadId,
        assignedTo,
        taskType: dto.taskType,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        note: dto.note,
        status: TaskStatus.TODO,
      },
    });
  }

  async findAll(query: TaskQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SalesTaskWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.taskType) {
      where.taskType = query.taskType;
    }

    if (query.assignedTo) {
      where.assignedTo = query.assignedTo;
    }

    if (query.dueDate) {
      const date = new Date(query.dueDate);
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.dueDate = {
        gte: start,
        lte: end,
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.salesTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          lead: {
            select: {
              id: true,
              customer: {
                select: {
                  id: true,
                  fullName: true,
                  phone: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.salesTask.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.salesTask.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            customer: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.salesTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const updateData: Prisma.SalesTaskUpdateInput = {};

    if (dto.note !== undefined) {
      updateData.note = dto.note;
    }

    if (dto.dueDate !== undefined) {
      updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === TaskStatus.DONE) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    return this.prisma.salesTask.update({
      where: { id },
      data: updateData,
    });
  }

  async getTodayTasks(assignedTo?: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const where: Prisma.SalesTaskWhereInput = {
      dueDate: {
        gte: start,
        lte: end,
      },
    };

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    return this.prisma.salesTask.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        lead: {
          select: {
            id: true,
            customer: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }
}
