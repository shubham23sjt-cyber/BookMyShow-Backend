import { IsNumber, IsOptional, IsPositive, IsInt } from 'class-validator';

export class GenerateSeatsDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  vipPrice?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  premiumPrice?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  standardPrice?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  vipCount?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  premiumCount?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  standardCount?: number;
}
