import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Role } from '../interface/user.interface';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsString()
  middleName?: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 12, {
    message: 'Password must be between 6 to 12 characters',
  })
  password: string;

  @IsNotEmpty()
  @IsEnum([null, Role.ADMIN, Role.USER])
  readonly role: Role;

  @IsString()
  department?: string;
}
