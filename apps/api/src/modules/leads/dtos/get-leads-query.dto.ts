import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeadStatus } from '@prisma/client';

export class GetLeadsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer number' })
  @Min(1, { message: 'page must not be less than 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer number' })
  @Min(1, { message: 'limit must not be less than 1' })
  limit?: number;

  @IsOptional()
  @IsEnum(LeadStatus, { message: 'status must be a valid LeadStatus enum' })
  status?: LeadStatus;

  @IsOptional()
  @IsUUID('4', { message: 'assignedTo must be a valid UUID' })
  assignedTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'minScore must be a number' })
  @Min(0, { message: 'minScore must not be less than 0' })
  minScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'maxScore must be a number' })
  @Min(0, { message: 'maxScore must not be less than 0' })
  maxScore?: number;

  @IsOptional()
  @IsString({ message: 'sortBy must be a string' })
  sortBy?: string; // 'createdAt' or 'score'

  @IsOptional()
  @IsString({ message: 'sortOrder must be a string' })
  sortOrder?: 'asc' | 'desc';
}
