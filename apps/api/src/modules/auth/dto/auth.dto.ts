import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { MemberRole } from '@fixya/database';

export class RegisterDto {
  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @ApiProperty({ example: 'María' })
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'García' })
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  province!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ enum: MemberRole, example: MemberRole.CLIENTE })
  @IsEnum(MemberRole)
  role!: MemberRole;

  @ApiPropertyOptional({ description: 'Categoría principal (profesionales)' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'CUIT o DNI (profesionales)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Número de matrícula (profesionales)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;

  @ApiProperty({ required: false, description: 'UUID del tenant activo' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Código MFA (si la cuenta lo tiene activado)' })
  @IsOptional()
  @IsString()
  @MaxLength(6)
  mfaCode?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token de verificación recibido por email' })
  @IsString()
  token!: string;
}

export class MfaVerifyDto {
  @ApiProperty({ description: 'Código TOTP de 6 dígitos', example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code!: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;
}

export class UploadComplianceDto {
  @ApiProperty({ enum: ['CUIT_CONSTANCIA', 'MATRICULA', 'SEGURO_RC'] })
  @IsString()
  docType!: 'CUIT_CONSTANCIA' | 'MATRICULA' | 'SEGURO_RC';

  @ApiProperty({ description: 'Data URL o URL del documento' })
  @IsString()
  @MaxLength(500_000)
  fileUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentNumber?: string;
}
