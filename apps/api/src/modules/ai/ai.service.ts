import {
  Injectable,
  NotFoundException,
  BadRequestException,
  BadGatewayException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RecommendationService } from '../recommendation/recommendation.service';
import { ContentType, ProductType } from '@prisma/client';
import { Response } from 'express';
import {
  GenerateEmailDto,
  GeneratePitchDto,
  ChatDto,
  GeneratedContentQueryDto,
  ProductRecommendationDto,
  ProductRecommendationResponseDto,
} from './dtos/ai.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => RecommendationService))
    private readonly recommendationService: RecommendationService,
  ) {}

  /**
   * Normalize topFeatures from Prisma JSON (may be string[] or {feature,importance}[])
   * into a plain string[] that sale-ai-service expects.
   */
  private normalizeTopFeatures(raw: any): string[] {
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((f: any) =>
      typeof f === 'string' ? f : (f?.feature ?? String(f)),
    );
  }

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

    // If no product recommendation is found and no productName is specified, auto-trigger the recommendation engine
    if (!latestRec && !dto.productName) {
      const recs = await this.recommendationService.recommendProduct(leadId);
      if (recs && recs.length > 0) {
        latestRec = recs[0];
      }
    }

    if (!latestRec && !dto.productName) {
      throw new BadRequestException(
        'No product recommendation found or could be generated for this lead. Please complete customer profile first.',
      );
    }

    const productName = dto.productName || latestRec.productName;
    const productReason = dto.productName
      ? `Sản phẩm do Sales lựa chọn trực tiếp: ${dto.productName}`
      : (latestRec?.reason ?? '');

    const latestScore = lead.scores[0];
    const score = latestScore?.score ?? 50;
    const probability = latestScore?.conversionProbability ?? 0.5;
    const topFeatures = this.normalizeTopFeatures(latestScore?.topFeatures);

    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');

    let emailResult: { subject: string; body: string };

    if (!aiServiceUrl || aiServiceUrl === 'mock') {
      // Mock email generation
      emailResult = {
        subject: `[SHB] Giải pháp tài chính tối ưu cho anh/chị ${customer.fullName}`,
        body: `Thân gửi anh/chị ${customer.fullName},\n\nNhận thấy anh/chị đang quan tâm đến sản phẩm ${productName} tại SHB và có lịch sử hoạt động rất tốt, chúng tôi xin gửi tặng anh/chị chương trình ưu đãi đặc biệt...\n\nTrân trọng,\nSHB Sales Copilot`,
      };
    } else {
      try {
        const payload = {
          customerName: customer.fullName,
          age: customer.age ?? 0,
          income: customer.income ?? 0,
          city: customer.city ?? '',
          leadScore: Math.round(score), // Convert float to int
          conversionProbability: probability,
          recommendedProduct: productName,
          productReason: productReason,
          topFeatures: topFeatures,
        };

        const response = await fetch(`${aiServiceUrl}/generate-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000), // 30s timeout for LLM retries
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
        console.error('[AiService] generateEmail error:', error?.message ?? error);
        throw new BadGatewayException('AI Service is currently unavailable');
      }
    }

    // Save generated content to database
    return this.prisma.generatedContent.create({
      data: {
        leadId,
        type: ContentType.EMAIL,
        prompt: `Generate email for customer ${customer.fullName} recommending ${productName}. Score: ${score}`,
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

    // If no product recommendation is found and no productName is specified, auto-trigger recommendation engine
    if (!latestRec && !dto.productName) {
      const recs = await this.recommendationService.recommendProduct(leadId);
      if (recs && recs.length > 0) {
        latestRec = recs[0];
      }
    }

    if (!latestRec && !dto.productName) {
      throw new BadRequestException(
        'No product recommendation found or could be generated for this lead. Please complete customer profile first.',
      );
    }

    const productName = dto.productName || latestRec.productName;
    const productReason = dto.productName
      ? `Sản phẩm do Sales lựa chọn trực tiếp: ${dto.productName}`
      : (latestRec?.reason ?? '');

    const latestScore = lead.scores[0];
    const score = latestScore?.score ?? 50;

    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');

    let pitchContent = '';

    if (!aiServiceUrl || aiServiceUrl === 'mock') {
      // Mock pitch generation
      pitchContent = `Chào anh/chị ${customer.fullName}, em gọi điện hỗ trợ từ ngân hàng SHB. Em thấy mình đang tìm hiểu về sản phẩm ${productName}. Đây là dòng sản phẩm cực kỳ phù hợp với hồ sơ của mình với nhiều ưu đãi lãi suất và đặc quyền đi kèm. Em xin phép chia sẻ thêm thông tin chi tiết ạ.`;
    } else {
      try {
        const payload = {
          customerName: customer.fullName,
          leadScore: Math.round(score), // Convert float to int
          recommendedProduct: productName,
          confidence: latestRec ? latestRec.confidence : 0.8,
          productReason: productReason,
        };

        const response = await fetch(`${aiServiceUrl}/generate-pitch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000), // 30s timeout for LLM retries
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
        prompt: `Generate sales pitch for customer ${customer.fullName} recommending ${productName}. Score: ${score}`,
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

  /**
   * Generate product recommendations using AI service with RAG
   * Replaces rule-based recommendation with AI-powered recommendation
   */
  async generateProductRecommendations(dto: ProductRecommendationDto): Promise<ProductRecommendationResponseDto> {
    const { leadId } = dto;

    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
      include: {
        customer: {
          include: {
            products: true,
            interactions: {
              orderBy: { occurredAt: 'desc' },
              take: 20,
            },
          },
        },
        scores: {
          orderBy: { predictedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const customer = lead.customer;
    const latestScore = lead.scores[0];
    const score = latestScore?.score ?? 50;
    const probability = latestScore?.conversionProbability ?? 0.5;

    // Get existing products as string array
    const existingProducts = customer.products
      .filter(p => p.status === 'ACTIVE')
      .map(p => p.productType);

    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');

    if (!aiServiceUrl || aiServiceUrl === 'mock') {
      // Fallback mock response when AI service is not available
      const mockRecommendations = [
        { productName: 'SHB Visa Platinum', confidence: 0.85, reason: 'Thu nhập cao, phù hợp với thẻ tín dụng cao cấp' },
        { productName: 'SHB Saving Account', confidence: 0.75, reason: 'Có thu nhập ổn định, nên bắt đầu tiết kiệm' },
      ];
      return { recommendations: mockRecommendations, retrievedSources: [] };
    }

    try {
      const payload = {
        customer_name: customer.fullName,
        age: customer.age ?? 0,
        income: customer.income ?? 0,
        city: customer.city ?? '',
        occupation: customer.occupation ?? '',
        salary_account: customer.salaryAccount,
        existing_products: existingProducts,
        interested_product: lead.interestedProduct ?? '',
        lead_score: Math.round(score), // Convert float to int
        conversion_probability: probability,
      };

      const response = await fetch(`${aiServiceUrl}/recommend-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000), // 30s timeout for RAG + LLM
      });

      if (!response.ok) {
        throw new Error(`AI Service returned status ${response.status}`);
      }

      const data = await response.json() as {
        recommendations: Array<{ product_name: string; confidence: number; reason: string }>;
        retrieved_sources?: string[];
      };

      // Save recommendations to database
      const recsToSave = data.recommendations.map(rec => ({
        leadId,
        productName: rec.product_name,
        confidence: rec.confidence,
        reason: rec.reason,
      }));

      if (recsToSave.length > 0) {
        await this.prisma.productRecommendation.createMany({
          data: recsToSave,
        });
      }

      return {
        recommendations: data.recommendations.map(rec => ({
          productName: rec.product_name,
          confidence: rec.confidence,
          reason: rec.reason,
        })),
        retrievedSources: data.retrieved_sources ?? [],
      };
    } catch (error) {
      console.error('[AiService] Product recommendation failed:', error);
      throw new BadGatewayException('AI Service is currently unavailable');
    }
  }
}
