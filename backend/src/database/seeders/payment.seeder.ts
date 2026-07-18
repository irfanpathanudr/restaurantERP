import { DataSource } from 'typeorm';

export async function seedPayments(dataSource: DataSource) {
  // Get completed orders
  const orders = await dataSource.query(
    "SELECT id, order_number, total_amount FROM orders WHERE order_status IN ('completed', 'served') LIMIT 100"
  );

  if (orders.length === 0) {
    console.log('Skipping payment seeding - no completed orders found');
    return;
  }

  const payments: any[] = [];
  const paymentMethods = ['cash', 'card', 'upi', 'wallet'];
  const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

  for (const order of orders) {
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const status = Math.random() > 0.1 ? 'completed' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

    payments.push({
      order_id: order.id,
      payment_method: paymentMethod,
      amount: order.total_amount,
      payment_status: status,
      transaction_id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      payment_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // Insert payments
  for (const payment of payments) {
    await dataSource.query(
      `INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_id, payment_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment.order_id,
        payment.payment_method,
        payment.amount,
        payment.payment_status,
        payment.transaction_id,
        payment.payment_date,
        payment.created_at,
        payment.updated_at,
      ]
    );
  }

  console.log(`✅ Seeded ${payments.length} payments`);
}
