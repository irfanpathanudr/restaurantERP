import { DataSource } from 'typeorm';
import { Reservation } from '../entities/Reservation.entity';

export async function seedReservations(dataSource: DataSource) {
  const reservationRepo = dataSource.getRepository(Reservation);

  // Get existing data
  const tables = await dataSource.query('SELECT id FROM tables LIMIT 10');
  const customers = await dataSource.query('SELECT id, name, phone FROM customers LIMIT 30');
  const branches = await dataSource.query('SELECT id FROM branches LIMIT 1');

  if (tables.length === 0 || branches.length === 0) {
    console.log('Skipping reservation seeding - missing required data');
    return;
  }

  const reservations: any[] = [];
  const statuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];

  // Generate reservations for the next 30 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  let reservationNumber = 5000;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Generate 3-8 reservations per day
    const reservationsPerDay = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < reservationsPerDay; i++) {
      const reservationDate = new Date(d);
      const hour = Math.floor(Math.random() * 6) + 18; // 6 PM to 12 AM
      const minute = Math.random() > 0.5 ? 0 : 30;
      const reservationTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

      const tableId = tables[Math.floor(Math.random() * tables.length)].id;
      const customer = customers.length > 0 && Math.random() > 0.3 
        ? customers[Math.floor(Math.random() * customers.length)]
        : null;

      const partySize = Math.floor(Math.random() * 6) + 2; // 2-8 people
      const status = d < new Date() 
        ? statuses[Math.floor(Math.random() * statuses.length)] 
        : Math.random() > 0.5 ? 'confirmed' : 'pending';

      reservations.push({
        reservation_number: `RES-${reservationNumber}`,
        branch_id: branches[0].id,
        table_id: tableId,
        customer_id: customer?.id || null,
        customer_name: customer?.name || `Guest ${reservationNumber}`,
        customer_phone: customer?.phone || `9${Math.floor(Math.random() * 1000000000)}`,
        reservation_date: reservationDate.toISOString().split('T')[0],
        reservation_time: reservationTime,
        party_size: partySize,
        reservation_status: status,
        special_requests: Math.random() > 0.7 ? 'Window seat preferred' : null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      reservationNumber++;
    }
  }

  // Insert reservations
  for (const reservation of reservations) {
    await dataSource.query(
      `INSERT INTO reservations (reservation_number, branch_id, table_id, customer_id, customer_name, 
       customer_phone, reservation_date, reservation_time, party_size, reservation_status, 
       special_requests, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reservation.reservation_number,
        reservation.branch_id,
        reservation.table_id,
        reservation.customer_id,
        reservation.customer_name,
        reservation.customer_phone,
        reservation.reservation_date,
        reservation.reservation_time,
        reservation.party_size,
        reservation.reservation_status,
        reservation.special_requests,
        reservation.created_at,
        reservation.updated_at,
      ]
    );
  }

  console.log(`✅ Seeded ${reservations.length} reservations`);
}
