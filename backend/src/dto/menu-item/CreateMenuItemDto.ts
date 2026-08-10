import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export enum FoodType {
  VEG = 'veg',
  NON_VEG = 'non_veg',
  EGG = 'egg',
  JAIN = 'jain',
}

export enum SpicyLevel {
  NONE = 'none',
  MILD = 'mild',
  MEDIUM = 'medium',
  HOT = 'hot',
  EXTRA_HOT = 'extra_hot',
}

export enum PortionSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  CUSTOM = 'custom',
}

export class CreateMenuItemDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'SKU is required' })
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Category is required' })
  @IsUUID('4', { message: 'Invalid category ID' })
  category_id: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Cost price must be a number' })
  @Transform(({ value }) => value ? parseFloat(value) : null)
  cost_price?: number;

  @IsOptional()
  @IsEnum(FoodType, { message: 'Food type must be one of: veg, non_veg, egg, jain' })
  food_type?: FoodType;

  @IsOptional()
  @IsEnum(SpicyLevel)
  spicy_level?: SpicyLevel;

  @IsOptional()
  @IsEnum(PortionSize)
  portion_size?: PortionSize;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : null)
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
