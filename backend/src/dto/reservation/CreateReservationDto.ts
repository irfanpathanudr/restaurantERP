import { IsString, IsNotEmpty, IsOptional, IsEmail, IsDateString, IsInt, Min } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  reservation_number: string;

  @IsString()
  @IsNotEmpty()
  branch_id: string;

  @IsString()
  @IsOptional()
  customer_id?: string;

  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @IsString()
  @IsNotEmpty()
  customer_phone: string;

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsDateString()
  @IsNotEmpty()
  reservation_date: string;

  @IsString()
  @IsNotEmpty()
  reservation_time: string;

  @IsInt()
  @Min(1)
  party_size: number;

  @IsString()
  @IsOptional()
  table_id?: string;

  @IsString()
  @IsOptional()
  special_requests?: string;
}
