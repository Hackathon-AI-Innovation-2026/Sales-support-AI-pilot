import { IsUUID, IsString, IsOptional, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { ContentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class GenerateEmailDto {
  @IsUUID()
  leadId: string;
}

export class GeneratePitchDto {
  @IsUUID()
  leadId: string;
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
