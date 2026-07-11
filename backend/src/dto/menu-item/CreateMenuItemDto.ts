import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';

export enum MenuItemType {
  VEG = 'veg',
  NON_VEG = 'non_veg',
  VEGAN = 'vegan',
  BEVERAGE = 'beverage',
}

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsNotEmpty()
  @IsEnum(MenuItemType)
  type: MenuItemType;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  preparationTime?: number;
}
