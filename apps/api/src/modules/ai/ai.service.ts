import {
  Injectable,
  NotFoundException,
  BadRequestException,
  BadGatewayException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RecommendationService } from '../recommendation/recommendation.service';
import { ContentType } from '@prisma/client';
import { Response } from 'express';
import {
  GenerateEmailDto,
  GeneratePitchDto,
  ChatDto,
  GeneratedContentQueryDto,
} from './dtos/ai.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly recommendationService: RecommendationService,
  ) {}

  async generateEmail(dto: GenerateEmailDto) {
    const { leadId } = dto;

    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
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
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const customer = lead.customer;
    let latestRec = lead.recommendations[0];

    // If no product recommendation is found, auto-trigger the recommendation engine
    if (!latestRec) {
      const recs = await this.recommendationService.recommendProduct(leadId);
      if (recs && recs.length > 0) {
        latestRec = recs[0];
      }
    }

    if (!latestRec) {
      throw new BadRequestException(
        'No product recommendation found or could be generated for this lead. Please complete customer profile first.',
      );
    }

    const latestScore = lead.scores[0];
    const score = latestScore?.score ?? 50;
    const probability = latestScore?.conversionProbability ?? 0.5;
    const topFeatures = latestScore?.topFeatures ?? [];

    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');

    let emailResult: { subject: string; body: string };

    if (!aiServiceUrl || aiServiceUrl === 'mock') {
      // Mock email generation
      emailResult = {
        subject: `[SHB] Giải pháp tài chính tối ưu cho anh/chị ${customer.fullName}`,
        body: `Thân gửi anh/chị ${customer.fullName},\n\nNhận thấy anh/chị đang quan tâm đến sản phẩm ${latestRec.productName} tại SHB và có lịch sử hoạt động rất tốt, chúng tôi xin gửi tặng anh/chị chương trình ưu đãi đặc biệt...\n\nTrân trọng,\nSHB Sales Copilot`,
      };
    } else {
      try {
        const payload = {
          customerName: customer.fullName,
          age: customer.age ?? 0,
          income: customer.income ?? 0,
          city: customer.city ?? '',
          leadScore: score,
          conversionProbability: probability,
          recommendedProduct: latestRec.productName,
          productReason: latestRec.reason ?? '',
          topFeatures: topFeatures,
        };

        const response = await fetch(`${aiServiceUrl}/generate-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
          throw new Error(`AI Service returned status ${response.status}`);
        }

        const data = (await response.json()) as {
          subject: string;
          body: string;
        };

        emailResult = {
          subject: data.subject,
          body: data.body,
        };
      } catch (error) {
        throw new BadGatewayException('AI Service is currently unavailable');
      }
    }

    // Save generated content to database
    return this.prisma.generatedContent.create({
      data: {
        leadId,
        type: ContentType.EMAIL,
        prompt: `Generate email for customer ${customer.fullName} recommending ${latestRec.productName}. Score: ${score}`,
        content: JSON.stringify(emailResult),
        model:
          aiServiceUrl && aiServiceUrl !== 'mock'
            ? 'AI_SERVICE'
            : 'MOCK_ENGINE',
      },
    });
  }

  async generatePitch(dto: GeneratePitchDto) {
    const { leadId } = dto;

    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
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
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const customer = lead.customer;
    let latestRec = lead.recommendations[0];

    // If no product recommendation is found, auto-trigger recommendation engine
    if (!latestRec) {
      const recs = await this.recommendationService.recommendProduct(leadId);
      if (recs && recs.length > 0) {
        latestRec = recs[0];
      }
    }

    if (!latestRec) {
      throw new BadRequestException(
        'No product recommendation found or could be generated for this lead. Please complete customer profile first.',
      );
    }

    const latestScore = lead.scores[0];
    const score = latestScore?.score ?? 50;

    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');

    let pitchContent = '';

    if (!aiServiceUrl || aiServiceUrl === 'mock') {
      // Mock pitch generation
      pitchContent = `Chào anh/chị ${customer.fullName}, em gọi điện hỗ trợ từ ngân hàng SHB. Em thấy mình đang tìm hiểu về sản phẩm ${latestRec.productName}. Đây là dòng sản phẩm cực kỳ phù hợp với hồ sơ của mình với nhiều ưu đãi lãi suất và đặc quyền đi kèm. Em xin phép chia sẻ thêm thông tin chi tiết ạ.`;
    } else {
      try {
        const payload = {
          customerName: customer.fullName,
          leadScore: score,
          recommendedProduct: latestRec.productName,
          confidence: latestRec.confidence,
          productReason: latestRec.reason ?? '',
        };

        const response = await fetch(`${aiServiceUrl}/generate-pitch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
          throw new Error(`AI Service returned status ${response.status}`);
        }

        const data = (await response.json()) as {
          pitch?: string;
          content?: string;
        };

        pitchContent = data.pitch ?? data.content ?? '';
      } catch (error) {
        throw new BadGatewayException('AI Service is currently unavailable');
      }
    }

    // Save generated content to database
    return this.prisma.generatedContent.create({
      data: {
        leadId,
        type: ContentType.PITCH,
        prompt: `Generate sales pitch for customer ${customer.fullName} recommending ${latestRec.productName}. Score: ${score}`,
        content: pitchContent,
        model:
          aiServiceUrl && aiServiceUrl !== 'mock'
            ? 'AI_SERVICE'
            : 'MOCK_ENGINE',
      },
    });
  }

  async chatStream(dto: ChatDto, res: Response) {
    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');

    let customerContext: any = null;
    if (dto.leadId) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: dto.leadId, deletedAt: null },
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
        },
      });

      if (lead) {
        customerContext = {
          name: lead.customer.fullName,
          leadScore: lead.scores[0]?.score ?? 50,
          recommendedProduct:
            lead.recommendations[0]?.productName ?? 'Savings Account',
        };
      }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!aiServiceUrl || aiServiceUrl === 'mock') {
      // Mock streaming
      const text = `Đây là câu trả lời thử nghiệm từ AI Copilot của SHB. Tôi thấy ${
        customerContext
          ? `khách hàng của bạn là ${customerContext.name} có điểm tiềm năng là ${customerContext.leadScore}/100 và sản phẩm đề xuất tốt nhất là ${customerContext.recommendedProduct}.`
          : 'bạn chưa đính kèm thông tin Lead/Khách hàng cụ thể.'
      } Bạn có cần tôi chuẩn bị thư mời gửi email hay cung cấp thêm thông tin sản phẩm không?`;

      const chunks = text.split(' ');
      const delay = process.env.NODE_ENV === 'test' ? 1 : 80;
      for (const chunk of chunks) {
        const data = JSON.stringify({ token: chunk + ' ' });
        res.write(`data: ${data}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      try {
        const payload = {
          message: dto.message,
          conversationHistory: dto.conversationHistory ?? [],
          customerContext: customerContext,
        };

        const response = await fetch(`${aiServiceUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`AI Service returned status ${response.status}`);
        }

        if (response.body) {
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        }
        res.end();
      } catch (error) {
        res.write(
          `data: ${JSON.stringify({ error: 'AI Service is currently unavailable' })}\n\n`,
        );
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }
  }

  async getGeneratedContent(leadId: string, query: GeneratedContentQueryDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const where: any = { leadId };
    if (query.type) {
      where.type = query.type;
    }

    return this.prisma.generatedContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
