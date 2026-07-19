import {
  Injectable,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  InteractionType,
  ProductType,
  RecommendedAction,
  Priority,
  ContentType,
} from '@prisma/client';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async recommendProduct(leadId: string) {
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
    const recommendationsToCreate = this.applyProductRules(
      customer,
      customer.products,
      customer.interactions,
    );

    if (recommendationsToCreate.length === 0) {
      return [];
    }

    const data = recommendationsToCreate.map((rec) => ({
      leadId,
      productName: rec.productName,
      confidence: rec.confidence,
      reason: rec.reason,
    }));

    await this.prisma.productRecommendation.createMany({
      data,
    });

    return this.prisma.productRecommendation.findMany({
      where: { leadId },
      orderBy: { generatedAt: 'desc' },
      take: recommendationsToCreate.length,
    });
  }

  applyProductRules(customer: any, products: any[], interactions: any[]) {
    const matched: Array<{
      productName: string;
      confidence: number;
      reason: string;
    }> = [];

    const income = customer.income ?? 0;
    const age = customer.age ?? 0;

    const hasSaving = products.some(
      (p) => p.productType === ProductType.SAVING && p.status === 'ACTIVE',
    );
    const hasCreditCard = products.some(
      (p) => p.productType === ProductType.CREDIT_CARD && p.status === 'ACTIVE',
    );

    const loanInquiryCount = interactions.filter(
      (i) => i.interactionType === InteractionType.LOAN_INQUIRY,
    ).length;

    // Rule 1: income > 30M and !hasCreditCard -> SHB Visa Platinum (confidence: 0.9)
    if (income > 30000000 && !hasCreditCard) {
      matched.push({
        productName: 'SHB Visa Platinum',
        confidence: 0.9,
        reason: 'Thu nhập cao (> 30,000,000 VND) và chưa sở hữu thẻ tín dụng.',
      });
    }

    // Rule 2: loanInquiryCount >= 2 and income > 15M -> Home Loan / Personal Loan (confidence: 0.85)
    if (loanInquiryCount >= 2 && income > 15000000) {
      matched.push({
        productName: 'Home Loan / Personal Loan',
        confidence: 0.85,
        reason:
          'Có nhiều hơn 2 lượt hỏi về khoản vay và thu nhập > 15,000,000 VND.',
      });
    }

    // Rule 3: hasSaving and age >= 30 and income > 20M -> Investment Fund (confidence: 0.75)
    if (hasSaving && age >= 30 && income > 20000000) {
      matched.push({
        productName: 'Investment Fund',
        confidence: 0.75,
        reason:
          'Đang có tài khoản tiết kiệm, độ tuổi >= 30 và thu nhập > 20,000,000 VND.',
      });
    }

    // Rule 4: !hasSaving -> Savings Account (confidence: 0.7)
    if (!hasSaving) {
      matched.push({
        productName: 'Savings Account',
        confidence: 0.7,
        reason: 'Chưa mở tài khoản tiết kiệm tại SHB.',
      });
    }

    // Rule 5: age < 30 and !hasCreditCard -> SHB Visa Classic (confidence: 0.65)
    if (age < 30 && !hasCreditCard) {
      matched.push({
        productName: 'SHB Visa Classic',
        confidence: 0.65,
        reason: 'Độ tuổi trẻ (< 30) và chưa sở hữu thẻ tín dụng.',
      });
    }

    return matched;
  }

  async getNextBestAction(leadId: string, recentNoteContext?: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
      include: {
        customer: {
          include: {
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
    const latestScoreRecord = lead.scores[0];
    const score = latestScoreRecord?.score ?? 50;
    const probability = latestScoreRecord?.conversionProbability ?? 0.5;

    // Build interaction summary text from database summaries
    const interactionSummaries = customer.interactions
      .filter(i => i.summary)  // Only include interactions with summaries
      .map(i => {
        const date = new Date(i.occurredAt).toLocaleDateString('vi-VN');
        return `[${date}] ${i.interactionType}: ${i.summary}`;
      })
      .join('\n');

    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');

    let result: {
      action: RecommendedAction;
      priority: Priority;
      reason: string;
      suggestedContent: string;
    };

    if (!aiServiceUrl || aiServiceUrl === 'mock') {
      // Mock fallback still uses rule-based approach (kept for compatibility)
      const emailOpenCount = customer.interactions.filter(
        (i) => i.interactionType === InteractionType.EMAIL_OPEN,
      ).length;
      const loanInquiryCount = customer.interactions.filter(
        (i) => i.interactionType === InteractionType.LOAN_INQUIRY,
      ).length;

      let action: RecommendedAction;
      let priority: Priority;
      let reason = '';
      let suggestedContent = '';

      if (score >= 80) {
        action = RecommendedAction.CALL;
        priority = Priority.HIGH;
        reason = `Khách hàng có điểm tiềm năng rất cao (${score}/100) và xác suất chuyển đổi ${Math.round(probability * 100)}%. Cần gọi điện trực tiếp hỗ trợ ngay.`;
        suggestedContent = `Chào ${customer.fullName}, em là chuyên viên tư vấn từ SHB. Em thấy mình đang quan tâm đến các sản phẩm tài chính và có điểm tín nhiệm rất tốt. Em xin phép chia sẻ thêm về thẻ SHB Visa Platinum và các ưu đãi hoàn tiền đặc quyền...`;
      } else if (score >= 60 && loanInquiryCount >= 2) {
        action = RecommendedAction.EMAIL;
        priority = Priority.HIGH;
        reason = `Khách hàng có tiềm năng trung bình khá (${score}/100) và có nhiều hơn 2 lượt hỏi thông tin về gói vay. Nên gửi email tài liệu chi tiết.`;
        suggestedContent = `Chào ${customer.fullName}, SHB xin gửi lời chào trân trọng. Nhận thấy anh/chị đang tìm hiểu về các giải pháp vay vốn mua nhà/tiêu dùng tại SHB, chúng tôi xin gửi kèm file tài liệu chi tiết về biểu phí và lãi suất ưu đãi chỉ từ 6.5%/năm...`;
      } else if (score >= 60) {
        action = RecommendedAction.EMAIL;
        priority = Priority.MEDIUM;
        reason = `Khách hàng có điểm tiềm năng khá (${score}/100). Gửi email giới thiệu sản phẩm chung và cập nhật chương trình khuyến mại.`;
        suggestedContent = `Chào ${customer.fullName}, cảm ơn anh/chị đã quan tâm đến dịch vụ của SHB. Chúng tôi xin gửi tới anh/chị bản tin ưu đãi lãi suất tiết kiệm mới nhất lên đến 7.2%/năm...`;
      } else if (score >= 40) {
        action = RecommendedAction.MEETING;
        priority = Priority.MEDIUM;
        reason = `Khách hàng có nhu cầu ở mức trung bình (${score}/100). Cần thiết lập cuộc hẹn (trực tiếp hoặc online) để tư vấn chi tiết hơn và xây dựng lòng tin.`;
        suggestedContent = `Chào ${customer.fullName}, em là nhân viên tư vấn SHB. Để có thể giải đáp chi tiết các thắc mắc của anh/chị về thủ tục vay vốn ngân hàng, em xin phép hẹn anh/chị một buổi gặp ngắn khoảng 15 phút tại chi nhánh SHB gần nhất...`;
      } else {
        action = RecommendedAction.WAIT;
        priority = Priority.LOW;
        reason = `Điểm tiềm năng thấp (${score}/100) và chưa có tương tác nổi bật. Đề xuất chờ thêm tương tác từ khách hàng trước khi tiếp cận trực tiếp.`;
        suggestedContent = `Chưa cần hành động trực tiếp. Tiếp tục theo dõi các lượt tương tác của khách hàng trên hệ thống/website.`;
      }

      result = { action, priority, reason, suggestedContent };
      if (recentNoteContext) {
        result.reason += ` (Ghi chú: ${recentNoteContext})`;
      }
    } else {
      try {
        // Use AI service with interaction summaries
        // Combine AI-generated summaries with any manual context provided
        const combinedText = [
          interactionSummaries,
          recentNoteContext ? `Ghi chú bổ sung: ${recentNoteContext}` : '',
        ].filter(Boolean).join('\n\n');

        const payload = {
          leadScore: Math.round(score), // Convert float to int
          conversionProbability: probability,
          interestedProduct: lead.interestedProduct ?? 'Chưa xác định',
          recentInteractionsText: combinedText || 'Khách hàng chưa có tương tác nào được ghi nhận',
        };

        const response = await fetch(`${aiServiceUrl}/next-best-action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          throw new Error(`AI Service returned status ${response.status}`);
        }

        const data = (await response.json()) as {
          action: string;
          priority: string;
          reason: string;
          suggestedContent: string;
        };

        const actionMap: Record<string, RecommendedAction> = {
          CALL: RecommendedAction.CALL,
          EMAIL: RecommendedAction.EMAIL,
          MEETING: RecommendedAction.MEETING,
          WAIT: RecommendedAction.WAIT,
        };

        const priorityMap: Record<string, Priority> = {
          HIGH: Priority.HIGH,
          MEDIUM: Priority.MEDIUM,
          LOW: Priority.LOW,
        };

        result = {
          action:
            actionMap[data.action.toUpperCase()] ?? RecommendedAction.WAIT,
          priority: priorityMap[data.priority.toUpperCase()] ?? Priority.LOW,
          reason: data.reason,
          suggestedContent: data.suggestedContent,
        };
      } catch (error) {
        console.error(
          '[RecommendationService] AI Service call failed:',
          error?.message ?? error,
        );
        throw new BadGatewayException(
          `AI Service is currently unavailable: ${error?.message ?? 'Unknown error'}`,
        );
      }
    }

    const [savedRecommendation] = await this.prisma.$transaction(async (tx) => {
      const rec = await tx.recommendation.create({
        data: {
          leadId,
          action: result.action,
          priority: result.priority,
          reason: result.reason,
        },
      });

      if (result.suggestedContent && result.action !== RecommendedAction.WAIT) {
        let contentType: ContentType;
        if (result.action === RecommendedAction.CALL) {
          contentType = ContentType.CALL_SCRIPT;
        } else if (result.action === RecommendedAction.EMAIL) {
          contentType = ContentType.EMAIL;
        } else {
          contentType = ContentType.PITCH;
        }

        await tx.generatedContent.create({
          data: {
            leadId,
            type: contentType,
            prompt: `AI Suggested action: ${result.action}. Reason: ${result.reason}`,
            content: result.suggestedContent,
            model:
              aiServiceUrl && aiServiceUrl !== 'mock'
                ? 'AI_SERVICE'
                : 'MOCK_ENGINE',
          },
        });
      }

      return [rec];
    });

    return {
      ...savedRecommendation,
      suggestedContent: result.suggestedContent,
    };
  }

  async getRecommendations(leadId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const [productRecommendations, nextBestActions] = await Promise.all([
      this.prisma.productRecommendation.findMany({
        where: { leadId },
        orderBy: { generatedAt: 'desc' },
      }),
      this.prisma.recommendation.findMany({
        where: { leadId },
        orderBy: { generatedAt: 'desc' },
      }),
    ]);

    return {
      productRecommendations,
      nextBestActions,
    };
  }
}
