import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export async function seedExpenses(dataSource: DataSource) {
  const branches = await dataSource.query('SELECT id FROM branches LIMIT 1');

  if (branches.length === 0) {
    console.log('Skipping expense seeding - missing branch data');
    return;
  }

  const existingCount = await dataSource.query('SELECT COUNT(*) as count FROM expenses');
  if (Number(existingCount[0].count) > 0) {
    console.log('⏭️  Expenses already seeded, skipping');
    return;
  }

  const categories = [
    'electricity',
    'gas',
    'rent',
    'maintenance',
    'marketing',
    'petty_cash',
    'salary',
    'transportation',
    'office_supplies',
    'miscellaneous',
  ];
  const statuses = ['pending', 'approved', 'rejected', 'paid'];

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  let expenseNumber = 3000;
  let seededCount = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const expensesPerDay = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < expensesPerDay; i++) {
      const expenseDate = new Date(d);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      let amount = 0;
      let title = '';
      let vendorName: string | null = null;

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

      await dataSource.query(
        `INSERT INTO expenses (id, expense_number, branch_id, category, title, description, amount,
         expense_date, expense_status, vendor_name, bill_number, is_recurring, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          `EXP-${expenseNumber}`,
          branches[0].id,
          category,
          title,
          `${title} for ${expenseDate.toLocaleDateString()}`,
          amount,
          expenseDate.toISOString().split('T')[0],
          status,
          vendorName,
          vendorName ? `BILL-${Math.floor(Math.random() * 10000)}` : null,
          ['electricity', 'gas', 'rent', 'salary'].includes(category),
          expenseDate,
          expenseDate,
        ]
      );

      expenseNumber++;
      seededCount++;
    }
  }

  console.log(`✅ Seeded ${seededCount} expenses`);
}
