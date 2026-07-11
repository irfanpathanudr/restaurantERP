import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsBoolean, Min } from 'class-validator';
import { ExpenseCategory } from './CreateExpenseDto';

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  expense_number?: string;

  @IsString()
  @IsOptional()
  branch_id?: string;

  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsDateString()
  @IsOptional()
  expense_date?: string;

  @IsString()
  @IsOptional()
  vendor_name?: string;

  @IsString()
  @IsOptional()
  bill_number?: string;

  @IsString()
  @IsOptional()
  attachment?: string;

  @IsBoolean()
  @IsOptional()
  is_recurring?: boolean;

  @IsString()
  @IsOptional()
  recurring_frequency?: string;
}
