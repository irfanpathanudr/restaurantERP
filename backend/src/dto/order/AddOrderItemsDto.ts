import { IsNotEmpty, IsArray, ValidateNested, IsOptional, IsUUID, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './CreateOrderDto';

export class AddOrderItemsDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsUUID()
  kitchenId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** When true, also create a KOT for the newly added items */
  @IsOptional()
  @IsBoolean()
  createKot?: boolean;
}
