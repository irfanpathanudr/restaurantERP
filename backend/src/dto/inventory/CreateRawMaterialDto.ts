import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsEnum } from 'class-validator';

export enum UnitType {
  KG = 'kg',
  GRAM = 'gram',
  LITER = 'liter',
  ML = 'ml',
  PIECE = 'piece',
  PACK = 'pack',
}

export class CreateRawMaterialDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsEnum(UnitType)
  unit: UnitType;

  @IsNotEmpty()
  @IsNumber()
  currentStock: number;

  @IsNotEmpty()
  @IsNumber()
  minStockLevel: number;

  @IsNotEmpty()
  @IsNumber()
  reorderLevel: number;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  storageLocation?: string;
}
