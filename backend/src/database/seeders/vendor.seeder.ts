import { DataSource } from 'typeorm';
import { Vendor } from '../entities/Vendor.entity';

export async function seedVendors(dataSource: DataSource): Promise<void> {
  const vendorRepo = dataSource.getRepository(Vendor);

  const vendors = [
    {
      name: 'Fresh Produce Suppliers',
      vendor_code: 'VEN001',
      phone: '+1234560001',
      email: 'orders@freshproduce.com',
      address: '100 Market Street',
      city: 'New York',
      state: 'NY',
      zip_code: '10002',
      contact_person: 'Tom Green',
      payment_term: 'NET_30',
      rating: 5,
      current_balance: 0,
    },
    {
      name: 'Premium Meats & Seafood',
      vendor_code: 'VEN002',
      phone: '+1234560002',
      email: 'sales@premiummeats.com',
      address: '200 Harbor Drive',
      city: 'Boston',
      state: 'MA',
      zip_code: '02101',
      contact_person: 'Sarah Fish',
      payment_term: 'NET_15',
      rating: 5,
      current_balance: 1250.00,
    },
    {
      name: 'Italian Imports Co',
      vendor_code: 'VEN003',
      phone: '+1234560003',
      email: 'info@italianimports.com',
      address: '300 Roma Avenue',
      city: 'Chicago',
      state: 'IL',
      zip_code: '60601',
      contact_person: 'Marco Rossi',
      payment_term: 'NET_30',
      rating: 4,
      current_balance: 0,
    },
    {
      name: 'Dairy & Cheese Distributors',
      vendor_code: 'VEN004',
      phone: '+1234560004',
      email: 'orders@dairydist.com',
      address: '400 Farm Road',
      city: 'Milwaukee',
      state: 'WI',
      zip_code: '53201',
      contact_person: 'Linda Cheese',
      payment_term: 'NET_7',
      rating: 5,
      current_balance: 850.00,
    },
    {
      name: 'Wine & Spirits Wholesale',
      vendor_code: 'VEN005',
      phone: '+1234560005',
      email: 'sales@winewholesale.com',
      address: '500 Vineyard Lane',
      city: 'Napa',
      state: 'CA',
      zip_code: '94559',
      contact_person: 'Robert Vine',
      payment_term: 'NET_30',
      rating: 4,
      current_balance: 0,
    },
    {
      name: 'Bakery Supply Co',
      vendor_code: 'VEN006',
      phone: '+1234560006',
      email: 'orders@bakerysupply.com',
      address: '600 Baker Street',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102',
      contact_person: 'Betty Baker',
      payment_term: 'NET_15',
      rating: 5,
      current_balance: 450.00,
    },
    {
      name: 'Restaurant Equipment Plus',
      vendor_code: 'VEN007',
      phone: '+1234560007',
      email: 'sales@equipmentplus.com',
      address: '700 Industrial Blvd',
      city: 'Atlanta',
      state: 'GA',
      zip_code: '30301',
      contact_person: 'Mike Tools',
      payment_term: 'NET_60',
      rating: 4,
      current_balance: 0,
    },
  ];

  for (const vendorData of vendors) {
    const exists = await vendorRepo.findOne({
      where: { vendor_code: vendorData.vendor_code },
    });
    if (!exists) {
      const vendor = vendorRepo.create(vendorData);
      await vendorRepo.save(vendor);
      console.log(`✅ Vendor seeded: ${vendor.name}`);
    }
  }
}
