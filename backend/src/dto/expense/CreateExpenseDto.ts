import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsBoolean, Min } from 'class-validator';

export enum ExpenseCategory {
  ELECTRICITY = 'electricity',
  GAS = 'gas',
  RENT = 'rent',
  MAINTENANCE = 'maintenance',
  MARKETING = 'marketing',
  PETTY_CASH = 'petty_cash',
  SALARY = 'salary',
  TRANSPORTATION = 'transportation',
  OFFICE_SUPPLIES = 'office_supplies',
  MISCELLANEOUS = 'miscellaneous',
}

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  expense_number: string;

  @IsString()
  @IsNotEmpty()
  branch_id: string;

  @IsEnum(ExpenseCategory)
  @IsNotEmpty()
  category: ExpenseCategory;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  expense_date: string;

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
