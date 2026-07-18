import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export async function seedOrders(dataSource: DataSource) {
  await dataSource.query(`DELETE FROM order_items WHERE id = '' OR id IS NULL`);
  await dataSource.query(`DELETE FROM orders WHERE id = '' OR id IS NULL`);

  const tables = await dataSource.query('SELECT id FROM tables LIMIT 10');
  const menuItems = await dataSource.query('SELECT id, name, price FROM menu_items LIMIT 20');
  const customers = await dataSource.query('SELECT id FROM customers LIMIT 50');
  const branches = await dataSource.query('SELECT id FROM branches LIMIT 1');

  if (tables.length === 0 || menuItems.length === 0 || branches.length === 0) {
    console.log('Skipping order seeding - missing required data');
    return;
  }

  const existingCount = await dataSource.query('SELECT COUNT(*) as count FROM orders');
  if (Number(existingCount[0].count) > 0) {
    console.log('⏭️  Orders already seeded, skipping');
    return;
  }

  const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
  const orderTypes = ['dine_in', 'take_away', 'delivery'];

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  let orderNumber = 1000;
  let seededOrders = 0;
  let seededItems = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const ordersPerDay = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < ordersPerDay; i++) {
      const orderDate = new Date(d);
      orderDate.setHours(Math.floor(Math.random() * 14) + 8);
      orderDate.setMinutes(Math.floor(Math.random() * 60));

      const orderId = uuidv4();
      const tableId = tables[Math.floor(Math.random() * tables.length)].id;
      const customerId =
        customers.length > 0 ? customers[Math.floor(Math.random() * customers.length)].id : null;
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const paymentStatus =
        status === 'completed' || status === 'served' ? 'paid' : 'pending';

      const itemCount = Math.floor(Math.random() * 5) + 1;
      let subtotal = 0;
      const orderItemsData: any[] = [];

      for (let j = 0; j < itemCount; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseFloat(menuItem.price);
        const itemTotal = Number((price * quantity).toFixed(2));
        subtotal += itemTotal;

        orderItemsData.push({
          id: uuidv4(),
          order_id: orderId,
          menu_item_id: menuItem.id,
          item_name: menuItem.name,
          quantity,
          price,
          total: itemTotal,
        });
      }

      subtotal = Number(subtotal.toFixed(2));
      const taxAmount = Number((subtotal * 0.05).toFixed(2));
      const discountAmount = Math.random() > 0.8 ? Number((subtotal * 0.1).toFixed(2)) : 0;
      const grandTotal = Number((subtotal + taxAmount - discountAmount).toFixed(2));

      await dataSource.query(
        `INSERT INTO orders (id, order_number, branch_id, table_id, customer_id, order_type, order_status,
         payment_status, subtotal, tax_amount, discount_amount, grand_total, ordered_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          `ORD-${orderNumber}`,
          branches[0].id,
          tableId,
          customerId,
          orderType,
          status,
          paymentStatus,
          subtotal,
          taxAmount,
          discountAmount,
          grandTotal,
          orderDate,
          orderDate,
          orderDate,
        ]
      );

      for (const item of orderItemsData) {
        await dataSource.query(
          `INSERT INTO order_items (id, order_id, menu_item_id, item_name, quantity, price, total, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.order_id,
            item.menu_item_id,
            item.item_name,
            item.quantity,
            item.price,
            item.total,
            orderDate,
            orderDate,
          ]
        );
        seededItems++;
      }

      seededOrders++;
      orderNumber++;
    }
  }

  console.log(`✅ Seeded ${seededOrders} orders with ${seededItems} items`);
}
