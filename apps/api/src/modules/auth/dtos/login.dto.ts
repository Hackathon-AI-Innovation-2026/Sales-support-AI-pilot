import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email must be an email' })
  @IsNotEmpty({ message: 'email should not be empty' })
  email!: string;

  @IsNotEmpty({ message: 'password should not be empty' })
  @MinLength(6, {
    message: 'password must be longer than or equal to 6 characters',
  })
  password!: string;
}
