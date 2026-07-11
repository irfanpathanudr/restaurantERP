import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum PaymentTerm {
  CASH = 'cash',
  CREDIT = 'credit',
  NET_7 = 'net_7',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
}

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  company_name?: string;

  @IsString()
  @IsOptional()
  contact_person?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  alternate_phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsString()
  @IsOptional()
  gst_number?: string;

  @IsString()
  @IsOptional()
  pan_number?: string;

  @IsString()
  @IsOptional()
  bank_name?: string;

  @IsString()
  @IsOptional()
  bank_account_number?: string;

  @IsString()
  @IsOptional()
  bank_ifsc_code?: string;

  @IsEnum(PaymentTerm)
  @IsOptional()
  payment_term?: PaymentTerm;

  @IsNumber()
  @IsOptional()
  @Min(0)
  credit_limit?: number;

  @IsNumber()
  @IsOptional()
  opening_balance?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  documents?: any[];

  @IsString()
  @IsOptional()
  notes?: string;
}
