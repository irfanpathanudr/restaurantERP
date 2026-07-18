import { IsOptional, IsEnum, IsString } from 'class-validator';
import { KOTStatus } from '../../database/entities/KOT.entity';

export { KOTStatus };

export class UpdateKOTDto {
  @IsOptional()
  @IsEnum(KOTStatus)
  status?: KOTStatus;

  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
