import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Reservation, ReservationStatus } from '../entities/Reservation.entity';

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

  // Remove any bad rows from previous failed seed attempts (empty primary key)
  await dataSource.query(`DELETE FROM reservations WHERE id = '' OR id IS NULL`);

  const statuses = Object.values(ReservationStatus);
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  let reservationNumber = 5000;
  let seededCount = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const reservationsPerDay = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < reservationsPerDay; i++) {
      const reservationDate = new Date(d);
      const hour = Math.floor(Math.random() * 6) + 18; // 6 PM to 12 AM
      const minute = Math.random() > 0.5 ? 0 : 30;
      const reservationTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

      const tableId = tables[Math.floor(Math.random() * tables.length)].id;
      const customer =
        customers.length > 0 && Math.random() > 0.3
          ? customers[Math.floor(Math.random() * customers.length)]
          : null;

      const partySize = Math.floor(Math.random() * 6) + 2;
      const status =
        d < new Date()
          ? statuses[Math.floor(Math.random() * statuses.length)]
          : Math.random() > 0.5
            ? ReservationStatus.CONFIRMED
            : ReservationStatus.PENDING;

      const reservationNumberStr = `RES-${reservationNumber}`;
      const exists = await reservationRepo.findOne({
        where: { reservation_number: reservationNumberStr },
      });

      if (!exists) {
        const reservation = reservationRepo.create({
          id: uuidv4(),
          reservation_number: reservationNumberStr,
          branch_id: branches[0].id,
          table_id: tableId,
          customer_id: customer?.id || null,
          customer_name: customer?.name || `Guest ${reservationNumber}`,
          customer_phone: customer?.phone || `9${Math.floor(Math.random() * 1000000000)}`,
          reservation_date: reservationDate,
          reservation_time: reservationTime,
          party_size: partySize,
          reservation_status: status,
          special_requests: Math.random() > 0.7 ? 'Window seat preferred' : null,
        });
        await reservationRepo.save(reservation);
        seededCount++;
      }

      reservationNumber++;
    }
  }

  console.log(`✅ Seeded ${seededCount} reservations`);
}
