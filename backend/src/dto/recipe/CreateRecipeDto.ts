import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeIngredientDto {
  @IsString()
  @IsNotEmpty()
  raw_material_id: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsString()
  @IsOptional()
  preparation_notes?: string;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  menu_item_id: string;

  @IsInt()
  @IsOptional()
  preparation_time?: number;

  @IsInt()
  @IsOptional()
  cooking_time?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  serving_size?: number;

  @IsString()
  @IsOptional()
  preparation_steps?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];
}
