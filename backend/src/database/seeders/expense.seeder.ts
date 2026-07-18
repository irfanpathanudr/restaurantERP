import { DataSource } from 'typeorm';
import { Expense } from '../entities/Expense.entity';

export async function seedExpenses(dataSource: DataSource) {
  const expenseRepo = dataSource.getRepository(Expense);

  // Get existing data
  const branches = await dataSource.query('SELECT id FROM branches LIMIT 1');

  if (branches.length === 0) {
    console.log('Skipping expense seeding - missing branch data');
    return;
  }

  const expenses: any[] = [];
  const categories = ['electricity', 'gas', 'rent', 'maintenance', 'marketing', 'petty_cash', 'salary', 'transportation', 'office_supplies', 'miscellaneous'];
  const statuses = ['pending', 'approved', 'rejected', 'paid'];

  // Generate expenses for the last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  let expenseNumber = 3000;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Generate 1-5 expenses per day
    const expensesPerDay = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < expensesPerDay; i++) {
      const expenseDate = new Date(d);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      let amount = 0;
      let title = '';
      let vendorName = null;

      switch (category) {
        case 'electricity':
          amount = Math.floor(Math.random() * 5000) + 2000;
          title = 'Monthly Electricity Bill';
          vendorName = 'State Electricity Board';
          break;
        case 'gas':
          amount = Math.floor(Math.random() * 3000) + 1000;
          title = 'LPG Gas Cylinder';
          vendorName = 'Gas Supply Co.';
          break;
        case 'rent':
          amount = Math.floor(Math.random() * 20000) + 30000;
          title = 'Monthly Rent';
          vendorName = 'Property Owner';
          break;
        case 'maintenance':
          amount = Math.floor(Math.random() * 2000) + 500;
          title = 'Equipment Maintenance';
          vendorName = 'Maintenance Services';
          break;
        case 'marketing':
          amount = Math.floor(Math.random() * 5000) + 1000;
          title = 'Social Media Marketing';
          vendorName = 'Marketing Agency';
          break;
        case 'salary':
          amount = Math.floor(Math.random() * 50000) + 100000;
          title = 'Staff Salaries';
          break;
        default:
          amount = Math.floor(Math.random() * 1000) + 200;
          title = `${category.replace('_', ' ')} expense`;
      }

      expenses.push({
        expense_number: `EXP-${expenseNumber}`,
        branch_id: branches[0].id,
        category,
        title,
        description: `${title} for ${expenseDate.toLocaleDateString()}`,
        amount,
        expense_date: expenseDate.toISOString().split('T')[0],
        expense_status: status,
        vendor_name: vendorName,
        bill_number: vendorName ? `BILL-${Math.floor(Math.random() * 10000)}` : null,
        is_recurring: ['electricity', 'gas', 'rent', 'salary'].includes(category),
        created_at: expenseDate,
        updated_at: expenseDate,
      });

      expenseNumber++;
    }
  }

  // Insert expenses
  for (const expense of expenses) {
    await dataSource.query(
      `INSERT INTO expenses (expense_number, branch_id, category, title, description, amount, 
       expense_date, expense_status, vendor_name, bill_number, is_recurring, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense.expense_number,
        expense.branch_id,
        expense.category,
        expense.title,
        expense.description,
        expense.amount,
        expense.expense_date,
        expense.expense_status,
        expense.vendor_name,
        expense.bill_number,
        expense.is_recurring,
        expense.created_at,
        expense.updated_at,
      ]
    );
  }

  console.log(`✅ Seeded ${expenses.length} expenses`);
}
