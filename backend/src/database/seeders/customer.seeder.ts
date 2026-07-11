import { DataSource } from 'typeorm';
import { Customer } from '../entities/Customer.entity';

export async function seedCustomers(dataSource: DataSource): Promise<void> {
  const customerRepo = dataSource.getRepository(Customer);

  const customers = [
    { name: 'John Smith', phone: '+1234567001', email: 'john.smith@email.com', loyalty_points: 150 },
    { name: 'Emma Johnson', phone: '+1234567002', email: 'emma.j@email.com', loyalty_points: 280 },
    { name: 'Michael Brown', phone: '+1234567003', email: 'michael.b@email.com', loyalty_points: 95 },
    { name: 'Sarah Davis', phone: '+1234567004', email: 'sarah.d@email.com', loyalty_points: 320 },
    { name: 'David Wilson', phone: '+1234567005', email: 'david.w@email.com', loyalty_points: 175 },
    { name: 'Lisa Anderson', phone: '+1234567006', email: 'lisa.a@email.com', loyalty_points: 240 },
    { name: 'James Taylor', phone: '+1234567007', email: 'james.t@email.com', loyalty_points: 410 },
    { name: 'Jennifer Martinez', phone: '+1234567008', email: 'jennifer.m@email.com', loyalty_points: 125 },
    { name: 'Robert Garcia', phone: '+1234567009', email: 'robert.g@email.com', loyalty_points: 195 },
    { name: 'Mary Rodriguez', phone: '+1234567010', email: 'mary.r@email.com', loyalty_points: 350 },
    { name: 'William Lee', phone: '+1234567011', email: 'william.l@email.com', loyalty_points: 85 },
    { name: 'Patricia Harris', phone: '+1234567012', email: 'patricia.h@email.com', loyalty_points: 265 },
    { name: 'Christopher Clark', phone: '+1234567013', email: 'chris.c@email.com', loyalty_points: 145 },
    { name: 'Linda Lewis', phone: '+1234567014', email: 'linda.l@email.com', loyalty_points: 390 },
    { name: 'Daniel Walker', phone: '+1234567015', email: 'daniel.w@email.com', loyalty_points: 220 },
  ];

  for (const customerData of customers) {
    const exists = await customerRepo.findOne({
      where: { email: customerData.email },
    });
    if (!exists) {
      const customer = customerRepo.create(customerData);
      await customerRepo.save(customer);
      console.log(`✅ Customer seeded: ${customer.name}`);
    }
  }
}
