import { IsOptional, IsEnum } from 'class-validator';

export enum KOTStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
}

export class UpdateKOTDto {
  @IsOptional()
  @IsEnum(KOTStatus)
  status?: KOTStatus;
}
