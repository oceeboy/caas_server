import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  IsMongoId,
} from 'class-validator';

export class RegisterOrgDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  orgName: string;

  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  adminName: string;

  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  adminEmail: string;

  @IsString()
  @MinLength(8)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  password: string;
}

export class RegisterAgentDto {
  @IsMongoId()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  orgId: string;

  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  name: string;

  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  email: string;

  @IsString()
  @MinLength(8)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  password: string;
}

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  email: string;
  @IsString()
  @MinLength(8)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  password: string;
}
