import { IsString, IsNumber, IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { FoodType, SpicyLevel, PortionSize } from './CreateMenuItemDto';

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid category ID' })
  category_id?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Cost price must be a number' })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  cost_price?: number;

  @IsOptional()
  @IsEnum(FoodType)
  food_type?: FoodType;

  @IsOptional()
  @IsEnum(SpicyLevel)
  spicy_level?: SpicyLevel;

  @IsOptional()
  @IsEnum(PortionSize)
  portion_size?: PortionSize;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  preparation_time?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  is_vegetarian?: boolean;

  @IsOptional()
  @IsBoolean()
  is_vegan?: boolean;

  @IsOptional()
  allergens?: string | string[];

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
