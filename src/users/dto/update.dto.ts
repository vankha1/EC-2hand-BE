import { IsEmail, IsISO8601, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsISO8601()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Invalid phone number' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  faculty?: string;

  @IsOptional()
  @IsString()
  studentCode?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;
}
