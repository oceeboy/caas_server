import {
  IsString,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class WidgetAuthDto {
  @IsString()
  apiKey: string;

  @IsString()
  browserId: string;

  @IsOptional()
  @IsUrl()
  pageUrl?: string;
}
