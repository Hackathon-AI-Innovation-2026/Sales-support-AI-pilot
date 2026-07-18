import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString({ message: 'fullName must be a string' })
  @IsNotEmpty({ message: 'fullName should not be empty' })
  fullName!: string;

  @IsOptional()
  @IsEmail({}, { message: 'email must be an email' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'phone must be a string' })
  phone?: string;

  @IsOptional()
  @IsInt({ message: 'age must be an integer number' })
  @Min(18, { message: 'age must not be less than 18' })
  age?: number;

  @IsOptional()
  @IsString({ message: 'gender must be a string' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'occupation must be a string' })
  occupation?: string;

  @IsOptional()
  @IsNumber({}, { message: 'income must be a number' })
  @Min(0, { message: 'income must not be less than 0' })
  income?: number;

  @IsOptional()
  @IsString({ message: 'city must be a string' })
  city?: string;

  @IsOptional()
  @IsBoolean({ message: 'salaryAccount must be a boolean value' })
  salaryAccount?: boolean;
}
