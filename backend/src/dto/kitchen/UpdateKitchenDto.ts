import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateKitchenDto {
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
  branch_id?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  manager_id?: string;

  @IsString()
  @IsOptional()
  printer_ip?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  printer_port?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  sort_order?: number;
}
