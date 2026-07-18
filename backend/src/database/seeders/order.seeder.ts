import { DataSource } from 'typeorm';
import { Order } from '../entities/Order.entity';
import { OrderItem } from '../entities/OrderItem.entity';

export async function seedOrders(dataSource: DataSource) {
  const orderRepo = dataSource.getRepository(Order);
  const orderItemRepo = dataSource.getRepository(OrderItem);

  // Get existing data for relationships
  const tables = await dataSource.query('SELECT id FROM tables LIMIT 10');
  const menuItems = await dataSource.query('SELECT id, price FROM menu_items LIMIT 20');
  const customers = await dataSource.query('SELECT id FROM customers LIMIT 50');
  const branches = await dataSource.query('SELECT id FROM branches LIMIT 1');

  if (tables.length === 0 || menuItems.length === 0 || branches.length === 0) {
    console.log('Skipping order seeding - missing required data');
    return;
  }

  const orders: any[] = [];
  const orderItems: any[] = [];
  const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
  const orderTypes = ['dine-in', 'takeaway', 'delivery'];

  // Generate orders for the last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  let orderNumber = 1000;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Generate 10-30 orders per day
    const ordersPerDay = Math.floor(Math.random() * 20) + 10;

    for (let i = 0; i < ordersPerDay; i++) {
      const orderDate = new Date(d);
      orderDate.setHours(Math.floor(Math.random() * 14) + 8); // 8 AM to 10 PM
      orderDate.setMinutes(Math.floor(Math.random() * 60));

      const tableId = tables[Math.floor(Math.random() * tables.length)].id;
      const customerId = customers.length > 0 ? customers[Math.floor(Math.random() * customers.length)].id : null;
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];

      // Calculate order totals
      const itemCount = Math.floor(Math.random() * 5) + 1;
      let subtotal = 0;
      const orderItemsForOrder: any[] = [];

      for (let j = 0; j < itemCount; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseFloat(menuItem.price);
        const itemTotal = price * quantity;
        subtotal += itemTotal;

        orderItemsForOrder.push({
          order_number: `ORD-${orderNumber}`,
          menu_item_id: menuItem.id,
          quantity,
          unit_price: price,
          total_price: itemTotal,
        });
      }

      const taxAmount = subtotal * 0.05; // 5% tax
      const discountAmount = Math.random() > 0.8 ? subtotal * 0.1 : 0; // 10% discount on 20% orders
      const totalAmount = subtotal + taxAmount - discountAmount;

      orders.push({
        order_number: `ORD-${orderNumber}`,
        branch_id: branches[0].id,
        table_id: tableId,
        customer_id: customerId,
        order_type: orderType,
        order_status: status,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        order_date: orderDate,
        created_at: orderDate,
        updated_at: orderDate,
      });

      orderItems.push(...orderItemsForOrder);
      orderNumber++;
    }
  }

  // Insert orders
  for (const order of orders) {
    await dataSource.query(
      `INSERT INTO orders (order_number, branch_id, table_id, customer_id, order_type, order_status, 
       subtotal, tax_amount, discount_amount, total_amount, order_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.order_number,
        order.branch_id,
        order.table_id,
        order.customer_id,
        order.order_type,
        order.order_status,
        order.subtotal,
        order.tax_amount,
        order.discount_amount,
        order.total_amount,
        order.order_date,
        order.created_at,
        order.updated_at,
      ]
    );
  }

  // Insert order items
  for (const item of orderItems) {
    const orderResult = await dataSource.query(
      'SELECT id FROM orders WHERE order_number = ?',
      [item.order_number]
    );
    if (orderResult.length > 0) {
      await dataSource.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderResult[0].id, item.menu_item_id, item.quantity, item.unit_price, item.total_price]
      );
    }
  }

  console.log(`✅ Seeded ${orders.length} orders with ${orderItems.length} items`);
}
