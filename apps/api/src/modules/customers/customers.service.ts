import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { GetCustomerInteractionsQueryDto } from './dtos/get-customer-interactions-query.dto';
import { Prisma } from '@prisma/client';
import { RecommendationService } from '../recommendation/recommendation.service';
import { LogInteractionDto } from './dtos/log-interaction.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationService: RecommendationService,
  ) {}

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: dto,
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    city?: string;
    minIncome?: number;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const search = params.search;
    const city = params.city;
    const minIncome = params.minIncome;

    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (minIncome !== undefined) {
      where.income = { gte: minIncome };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              products: true,
              leads: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where }),
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
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        products: true,
        interactions: {
          orderBy: { occurredAt: 'desc' },
        },
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            scores: {
              orderBy: { predictedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const latestLead = customer.leads[0];
    const leadData = latestLead
      ? {
          id: latestLead.id,
          status: latestLead.status,
          score: latestLead.scores[0]?.score ?? null,
        }
      : null;

    return {
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        age: customer.age,
        gender: customer.gender,
        occupation: customer.occupation,
        income: customer.income,
        city: customer.city,
        salaryAccount: customer.salaryAccount,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      products: customer.products,
      interactions: customer.interactions,
      lead: leadData,
    };
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findInteractions(
    customerId: string,
    query: GetCustomerInteractionsQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const where: Prisma.CustomerInteractionWhereInput = {
      customerId,
    };

    if (query.interactionType) {
      where.interactionType = query.interactionType;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customerInteraction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.customerInteraction.count({ where }),
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

  async findLeads(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const data = await this.prisma.lead.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        scores: {
          orderBy: { predictedAt: 'desc' },
          take: 1,
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

    return {
      data,
    };
  }

  async logInteraction(customerId: string, dto: LogInteractionDto, userId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const interaction = await this.prisma.customerInteraction.create({
      data: {
        customerId,
        interactionType: dto.interactionType,
        occurredAt: new Date(),
        metadata: {
          note: dto.note,
          outcome: dto.outcome,
          loggedBy: userId,
          source: 'MANUAL_LOG',
        },
      },
    });

    let nextBestAction: any = null;
    if (dto.leadId) {
      nextBestAction = await this.recommendationService.getNextBestAction(
        dto.leadId,
        dto.note,
      );
    }

    return {
      interaction,
      nextBestAction,
    };
  }
}
