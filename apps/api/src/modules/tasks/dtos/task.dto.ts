import {
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { TaskType, TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsUUID()
  leadId: string;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsEnum(TaskType)
  taskType: TaskType;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateTaskDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;
}

export class TaskQueryDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskType)
  @IsOptional()
  taskType?: TaskType;

  @IsString()
  @IsOptional()
  dueDate?: string; // YYYY-MM-DD

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
