import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { PrinterType, PrinterConnection } from './CreatePrinterDto';

export class UpdatePrinterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(PrinterType)
  printerType?: PrinterType;

  @IsOptional()
  @IsEnum(PrinterConnection)
  connectionType?: PrinterConnection;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsOptional()
  @IsString()
  usbPath?: string;

  @IsOptional()
  @IsString()
  bluetoothAddress?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsInt()
  @Min(40)
  @Max(80)
  paperWidth?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  numberOfCopies?: number;

  @IsOptional()
  @IsBoolean()
  autoCut?: boolean;

  @IsOptional()
  @IsBoolean()
  openCashDrawer?: boolean;

  @IsOptional()
  @IsBoolean()
  printHeader?: boolean;

  @IsOptional()
  @IsBoolean()
  printFooter?: boolean;

  @IsOptional()
  @IsString()
  headerText?: string;

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsString()
  characterEncoding?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
