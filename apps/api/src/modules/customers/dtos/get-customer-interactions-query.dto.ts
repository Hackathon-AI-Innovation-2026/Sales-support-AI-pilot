import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { InteractionType } from '@prisma/client';

export class GetCustomerInteractionsQueryDto {
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
  @IsEnum(InteractionType, {
    message: `interactionType must be one of: ${Object.values(InteractionType).join(', ')}`,
  })
  interactionType?: InteractionType;
}
