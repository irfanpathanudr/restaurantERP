import { DataSource } from 'typeorm';
import { Customer } from '../entities/Customer.entity';

export async function seedCustomers(dataSource: DataSource): Promise<void> {
  const customerRepo = dataSource.getRepository(Customer);

  const customers = [
    { name: 'John Smith', phone: '+1234567001', email: 'john.smith@email.com', loyalty_points: 150 }
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
