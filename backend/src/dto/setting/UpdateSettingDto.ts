import { IsString, IsEnum, IsOptional, IsBoolean, Length } from 'class-validator';
import { SettingCategory, SettingDataType } from '../../database/entities/Setting.entity';

export class UpdateSettingDto {
  @IsString()
  @Length(1, 100)
  @IsOptional()
  setting_key?: string;

  @IsString()
  @IsOptional()
  setting_value?: string;

  @IsEnum(SettingDataType)
  @IsOptional()
  data_type?: SettingDataType;

  @IsEnum(SettingCategory)
  @IsOptional()
  category?: SettingCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_public?: boolean;

  @IsBoolean()
  @IsOptional()
  is_editable?: boolean;

  @IsString()
  @IsOptional()
  branch_id?: string;
}
