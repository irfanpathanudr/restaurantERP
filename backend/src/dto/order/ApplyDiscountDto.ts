import { IsNotEmpty, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export class ApplyDiscountDto {
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsString()
  discountReason?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
