import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class CreateLeadDto {
  @IsUUID('4', { message: 'customerId must be a valid UUID' })
  customerId: string;

  @IsOptional()
  @IsString({ message: 'interestedProduct must be a string' })
  interestedProduct?: string;

  @IsOptional()
  @IsUUID('4', { message: 'assignedTo must be a valid UUID' })
  assignedTo?: string;

  @IsOptional()
  @IsEnum(LeadStatus, { message: 'status must be a valid LeadStatus enum' })
  status?: LeadStatus;
}
