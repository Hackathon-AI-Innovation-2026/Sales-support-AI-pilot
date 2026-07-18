import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { LeadStatus, TaskStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const totalLeads = await this.prisma.lead.count({
      where: { deletedAt: null },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const wonThisMonth = await this.prisma.lead.count({
      where: {
        status: LeadStatus.WON,
        updatedAt: { gte: startOfMonth },
        deletedAt: null,
      },
    });

    const activeTasks = await this.prisma.salesTask.count({
      where: {
        status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
      },
    });

    return {
      totalLeads,
      wonThisMonth,
      activeTasks,
    };
  }

  async getFunnel() {
    const groups = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      where: { deletedAt: null },
    });

    const stages = Object.values(LeadStatus);
    return stages.map((stage) => {
      const group = groups.find((g) => g.status === stage);
      return {
        stage,
        count: group?._count?.id ?? 0,
      };
    });
  }

  async getHotLeads(limit = 10) {
    return this.prisma.lead.findMany({
      where: {
        deletedAt: null,
        latestScore: { not: null },
      },
      orderBy: {
        latestScore: 'desc',
      },
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async getConversionRate() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const wonCount = await this.prisma.lead.count({
      where: {
        status: LeadStatus.WON,
        updatedAt: { gte: thirtyDaysAgo },
        deletedAt: null,
      },
    });

    const lostCount = await this.prisma.lead.count({
      where: {
        status: LeadStatus.LOST,
        updatedAt: { gte: thirtyDaysAgo },
        deletedAt: null,
      },
    });

    const total = wonCount + lostCount;
    const rate = total === 0 ? 0 : parseFloat((wonCount / total).toFixed(4));

    return {
      wonCount,
      lostCount,
      conversionRate: rate,
    };
  }

  async getRevenueForecast() {
    const negotiationLeads = await this.prisma.lead.findMany({
      where: {
        status: LeadStatus.NEGOTIATION,
        deletedAt: null,
      },
      include: {
        scores: {
          orderBy: { predictedAt: 'desc' },
          take: 1,
        },
        customer: {
          select: {
            fullName: true,
          },
        },
      },
    });

    let totalForecast = 0;
    const details = negotiationLeads.map((lead) => {
      const probability = lead.scores[0]?.conversionProbability ?? 0.5;
      const value = this.getProductValue(lead.interestedProduct);
      const forecast = value * probability;
      totalForecast += forecast;

      return {
        leadId: lead.id,
        customerName: lead.customer.fullName,
        interestedProduct: lead.interestedProduct,
        value,
        probability,
        forecast: parseFloat(forecast.toFixed(2)),
      };
    });

    return {
      totalForecast: parseFloat(totalForecast.toFixed(2)),
      details,
    };
  }

  private getProductValue(productName: string | null): number {
    if (!productName) return 50000000;
    const lower = productName.toLowerCase();
    if (lower.includes('platinum')) return 20000000;
    if (lower.includes('classic')) return 10000000;
    if (lower.includes('card') || lower.includes('thẻ')) return 15000000;
    if (lower.includes('home loan') || lower.includes('nhà')) return 1000000000;
    if (lower.includes('car') || lower.includes('xe')) return 500000000;
    if (lower.includes('loan') || lower.includes('vay')) return 200000000;
    if (lower.includes('saving') || lower.includes('tiết kiệm'))
      return 150000000;
    if (lower.includes('investment') || lower.includes('quỹ')) return 300000000;
    if (lower.includes('insurance') || lower.includes('bảo hiểm'))
      return 30000000;
    return 50000000;
  }
}
