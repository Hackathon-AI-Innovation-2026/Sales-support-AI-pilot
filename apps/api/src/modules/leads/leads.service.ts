import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateLeadDto } from './dtos/create-lead.dto';
import { UpdateLeadDto } from './dtos/update-lead.dto';
import { GetLeadsQueryDto } from './dtos/get-leads-query.dto';
import { Prisma, User, UserRole, LeadStatus } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto, creator: User) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found`,
      );
    }

    let assignedTo = dto.assignedTo;
    if (!assignedTo && creator.role === UserRole.SALES) {
      assignedTo = creator.id;
    }

    return this.prisma.lead.create({
      data: {
        customerId: dto.customerId,
        interestedProduct: dto.interestedProduct,
        assignedTo,
        status: dto.status ?? LeadStatus.NEW,
      },
    });
  }

  async findAll(query: GetLeadsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.assignedTo) {
      where.assignedTo = query.assignedTo;
    }

    if (query.minScore !== undefined || query.maxScore !== undefined) {
      const scoreFilter: Prisma.FloatNullableFilter = {};
      if (query.minScore !== undefined) {
        scoreFilter.gte = query.minScore;
      }
      if (query.maxScore !== undefined) {
        scoreFilter.lte = query.maxScore;
      }
      where.latestScore = scoreFilter;
    }

    const orderBy: Prisma.LeadOrderByWithRelationInput = {};
    const sortField = query.sortBy === 'score' ? 'latestScore' : 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    orderBy[sortField] = sortOrder;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.lead.count({ where }),
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
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        scores: {
          orderBy: { predictedAt: 'desc' },
          take: 1,
        },
        recommendations: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
        actions: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
        assignedUser: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return this.prisma.lead.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
