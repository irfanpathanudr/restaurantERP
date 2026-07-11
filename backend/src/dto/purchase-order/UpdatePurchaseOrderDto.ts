import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentTerm, PurchaseOrderItemDto } from './CreatePurchaseOrderDto';

export class UpdatePurchaseOrderDto {
  @IsString()
  @IsOptional()
  po_number?: string;

  @IsString()
  @IsOptional()
  vendor_id?: string;

  @IsString()
  @IsOptional()
  branch_id?: string;

  @IsDateString()
  @IsOptional()
  order_date?: string;

  @IsDateString()
  @IsOptional()
  expected_delivery_date?: string;

  @IsEnum(PaymentTerm)
  @IsOptional()
  payment_term?: PaymentTerm;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tax_percentage?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount_amount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  shipping_cost?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  delivery_address?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items?: PurchaseOrderItemDto[];
}
