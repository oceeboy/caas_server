import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Transform(
    ({ value }) =>
      typeof value === 'string'
        ? value.trim()
        : value,
    {
      toClassOnly: true,
    },
  )
  name?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  password?: string;
}

// update organization dto
export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @Transform(
    ({ value }) =>
      typeof value === 'string'
        ? value.trim()
        : value,
    {
      toClassOnly: true,
    },
  )
  orgName?: string;
}
