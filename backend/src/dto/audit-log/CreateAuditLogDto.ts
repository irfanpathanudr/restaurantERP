import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PAYMENT = 'payment',
  PERMISSION_CHANGE = 'permission_change',
}

export class CreateAuditLogDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @IsString()
  @IsNotEmpty()
  entity_type: string;

  @IsString()
  @IsOptional()
  entity_id?: string;

  @IsOptional()
  old_values?: any;

  @IsOptional()
  new_values?: any;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  user_agent?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
