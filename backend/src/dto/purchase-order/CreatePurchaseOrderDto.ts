import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentTerm {
  CASH = 'cash',
  CREDIT = 'credit',
  NET_7 = 'net_7',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
}

export class PurchaseOrderItemDto {
  @IsString()
  @IsNotEmpty()
  raw_material_id: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  po_number: string;

  @IsString()
  @IsNotEmpty()
  vendor_id: string;

  @IsString()
  @IsNotEmpty()
  branch_id: string;

  @IsDateString()
  @IsNotEmpty()
  order_date: string;

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
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}
