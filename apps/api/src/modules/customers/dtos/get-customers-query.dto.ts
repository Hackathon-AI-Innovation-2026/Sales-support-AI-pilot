import { IsOptional, IsString, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCustomersQueryDto {
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
  @IsString({ message: 'search must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'city must be a string' })
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'minIncome must be a number' })
  @Min(0, { message: 'minIncome must not be less than 0' })
  minIncome?: number;
}
