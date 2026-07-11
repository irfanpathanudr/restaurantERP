import { IsNotEmpty, IsUUID, IsArray, ValidateNested, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class KOTItemDto {
  @IsNotEmpty()
  @IsUUID()
  menuItemId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CreateKOTDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsUUID()
  kitchenId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KOTItemDto)
  items: KOTItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
