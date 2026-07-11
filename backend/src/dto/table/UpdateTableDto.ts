import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { TableStatus } from './CreateTableDto';

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  tableNumber?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

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
