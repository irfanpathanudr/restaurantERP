import { IsNotEmpty, IsUUID, IsNumber, IsEnum, IsOptional, IsString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMode {
  CASH = 'cash',
  ONLINE = 'online',
  CARD = 'card',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  WALLET = 'wallet',
  NET_BANKING = 'net_banking',
  CREDIT = 'credit',
}

export class PaymentItemDto {
  @IsNotEmpty()
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SplitPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  payments: PaymentItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmOrderPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsUUID()
  cashierId: string;
}
