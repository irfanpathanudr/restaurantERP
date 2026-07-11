import { IsString, IsOptional, IsEmail, IsDateString, IsInt, Min } from 'class-validator';

export class UpdateReservationDto {
  @IsString()
  @IsOptional()
  reservation_number?: string;

  @IsString()
  @IsOptional()
  branch_id?: string;

  @IsString()
  @IsOptional()
  customer_id?: string;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsString()
  @IsOptional()
  customer_phone?: string;

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsDateString()
  @IsOptional()
  reservation_date?: string;

  @IsString()
  @IsOptional()
  reservation_time?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  party_size?: number;

  @IsString()
  @IsOptional()
  table_id?: string;

  @IsString()
  @IsOptional()
  special_requests?: string;
}
