import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsEnum } from 'class-validator';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

export class CreateTableDto {
  @IsNotEmpty()
  @IsString()
  tableNumber: string;

  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @IsOptional()
  @IsString()
  qrCode?: string;
}
