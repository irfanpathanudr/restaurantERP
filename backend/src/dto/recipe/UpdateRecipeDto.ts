import { IsString, IsOptional, IsInt, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RecipeIngredientDto } from './CreateRecipeDto';

export class UpdateRecipeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  menu_item_id?: string;

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
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients?: RecipeIngredientDto[];
}
