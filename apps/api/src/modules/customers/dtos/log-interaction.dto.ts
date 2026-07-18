import { InteractionType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class LogInteractionDto {
  @IsEnum(InteractionType, { message: 'Loại tương tác không hợp lệ' })
  @IsNotEmpty({ message: 'Loại tương tác không được để trống' })
  interactionType!: InteractionType;

  @IsString({ message: 'Ghi chú phải là chuỗi văn bản' })
  @IsNotEmpty({ message: 'Ghi chú không được để trống' })
  @MinLength(5, { message: 'Ghi chú phải có ít nhất 5 ký tự' })
  note!: string;

  @IsOptional()
  @IsString({ message: 'Kết quả tương tác phải là chuỗi văn bản' })
  outcome?: string;

  @IsOptional()
  @IsUUID('all', { message: 'ID Lead không hợp lệ' })
  leadId?: string;
}
