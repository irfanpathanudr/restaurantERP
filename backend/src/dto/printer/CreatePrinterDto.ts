import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';

export enum PrinterType {
  RECEIPT = 'receipt',
  KITCHEN = 'kitchen',
  BAR = 'bar',
  LABEL = 'label',
}

export enum PrinterConnection {
  NETWORK = 'network',
  USB = 'usb',
  BLUETOOTH = 'bluetooth',
}

export class CreatePrinterDto {
  @IsString()
  name: string;

  @IsString()
  branchId: string;

  @IsEnum(PrinterType)
  printerType: PrinterType;

  @IsEnum(PrinterConnection)
  connectionType: PrinterConnection;

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
}
