import {
  Injectable,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { InteractionType, ProductType } from '@prisma/client';

@Injectable()
export class LeadScoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async scoreLead(leadId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
      include: {
        customer: {
          include: {
            products: true,
            interactions: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const customer = lead.customer;

    const emailOpenCount = customer.interactions.filter(
      (i) => i.interactionType === InteractionType.EMAIL_OPEN,
    ).length;
    const emailClickCount = customer.interactions.filter(
      (i) => i.interactionType === InteractionType.EMAIL_CLICK,
    ).length;
    const websiteVisitCount = customer.interactions.filter(
      (i) => i.interactionType === InteractionType.WEBSITE_VISIT,
    ).length;
    const loanInquiryCount = customer.interactions.filter(
      (i) => i.interactionType === InteractionType.LOAN_INQUIRY,
    ).length;
    const branchVisitCount = customer.interactions.filter(
      (i) => i.interactionType === InteractionType.BRANCH_VISIT,
    ).length;
    const callCount = customer.interactions.filter(
      (i) => i.interactionType === InteractionType.CALL,
    ).length;

    const hasSaving = customer.products.some(
      (p) => p.productType === ProductType.SAVING && p.status === 'ACTIVE',
    );
    const hasCreditCard = customer.products.some(
      (p) => p.productType === ProductType.CREDIT_CARD && p.status === 'ACTIVE',
    );
    const hasInsurance = customer.products.some(
      (p) => p.productType === ProductType.INSURANCE && p.status === 'ACTIVE',
    );

    const featureVector = {
      income: customer.income ?? 0,
      age: customer.age ?? 0,
      salaryAccount: customer.salaryAccount,
      emailOpenCount,
      emailClickCount,
      websiteVisitCount,
      loanInquiryCount,
      branchVisitCount,
      callCount,
      hasSaving,
      hasCreditCard,
      hasInsurance,
    };

    let score: number;
    let conversionProbability: number;
    let topFeatures: string[];

    const mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL');

    if (!mlServiceUrl || mlServiceUrl === 'mock') {
      // Mock scoring logic
      score = parseFloat((Math.random() * (95 - 35) + 35).toFixed(1));
      conversionProbability = parseFloat((score / 100).toFixed(2));
      topFeatures = [
        'Income',
        'Website Visit',
        'Loan Inquiry',
        'Salary Account',
        'Age',
      ]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    } else {
      try {
        const response = await fetch(`${mlServiceUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(featureVector),
          signal: AbortSignal.timeout(5000), // 5s timeout
        });

        if (!response.ok) {
          throw new Error(`ML Service returned status ${response.status}`);
        }

        const result = (await response.json()) as {
          score: number;
          probability: number;
          topFeatures: string[];
        };

        score = result.score;
        conversionProbability = result.probability;
        topFeatures = result.topFeatures;
      } catch {
        throw new BadGatewayException('ML Service is currently unavailable');
      }
    }

    const [leadScore] = await this.prisma.$transaction([
      this.prisma.leadScore.create({
        data: {
          leadId,
          score,
          conversionProbability,
          topFeatures,
        },
      }),
      this.prisma.lead.update({
        where: { id: leadId },
        data: { latestScore: score },
      }),
    ]);

    return leadScore;
  }

  async getLatestScore(leadId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const latest = await this.prisma.leadScore.findFirst({
      where: { leadId },
      orderBy: { predictedAt: 'desc' },
    });

    if (!latest) {
      throw new NotFoundException(`No scores found for Lead with ID ${leadId}`);
    }

    return latest;
  }

  async getScoreHistory(leadId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    return this.prisma.leadScore.findMany({
      where: { leadId },
      orderBy: { predictedAt: 'desc' },
    });
  }
}
