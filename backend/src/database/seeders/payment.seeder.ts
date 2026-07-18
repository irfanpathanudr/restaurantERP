import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export async function seedPayments(dataSource: DataSource) {
  const existingCount = await dataSource.query('SELECT COUNT(*) as count FROM payments');
  if (Number(existingCount[0].count) > 0) {
    console.log('⏭️  Payments already seeded, skipping');
    return;
  }

  const orders = await dataSource.query(
    "SELECT id, order_number, grand_total FROM orders WHERE order_status IN ('completed', 'served') LIMIT 100"
  );

  if (orders.length === 0) {
    console.log('Skipping payment seeding - no completed orders found');
    return;
  }

  const paymentMethods = ['cash', 'card', 'upi', 'wallet'];
  const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

  let paymentNumber = 1000;
  let seededCount = 0;

  for (const order of orders) {
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const status =
      Math.random() > 0.1
        ? 'completed'
        : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

    await dataSource.query(
      `INSERT INTO payments (id, payment_number, order_id, payment_method, amount, payment_status, transaction_id, payment_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        `PAY-${paymentNumber}`,
        order.id,
        paymentMethod,
        order.grand_total,
        status,
        `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        new Date(),
        new Date(),
        new Date(),
      ]
    );

    paymentNumber++;
    seededCount++;
  }

  console.log(`✅ Seeded ${seededCount} payments`);
}
