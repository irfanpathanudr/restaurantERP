import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
