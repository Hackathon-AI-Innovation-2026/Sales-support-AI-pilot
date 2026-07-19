import { IsUUID, IsString, IsOptional, IsArray, IsEnum, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { ContentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class GenerateEmailDto {
  @IsUUID()
  leadId: string;

  @IsString()
  @IsOptional()
  productName?: string;
}

export class GeneratePitchDto {
  @IsUUID()
  leadId: string;

  @IsString()
  @IsOptional()
  productName?: string;
}

export class ChatMessageDto {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ChatDto {
  @IsString()
  message: string;

  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  conversationHistory?: ChatMessageDto[];
}

export class GeneratedContentQueryDto {
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;
}

// DTOs for AI-powered Product Recommendation
export class ProductRecommendationDto {
  @IsUUID()
  leadId: string;
}

export class ProductRecommendationItemDto {
  productName: string;
  confidence: number;
  reason: string;
}

export class ProductRecommendationResponseDto {
  recommendations: ProductRecommendationItemDto[];
  retrievedSources: string[];
}

// DTO for Next Best Action
export class NextBestActionDto {
  @IsString()
  @IsOptional()
  recentNoteContext?: string;
}
