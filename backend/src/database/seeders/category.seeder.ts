import { DataSource } from 'typeorm';
import { Category } from '../entities/Category.entity';

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const categoryRepo = dataSource.getRepository(Category);

  const categories = [
    { name: 'Starters',        code: 'CAT-001', description: 'Chicken & Mutton starters',              sort_order: 1  },
    { name: 'Rosted',          code: 'CAT-002', description: 'Tandoori roasted chicken specialties',   sort_order: 2  },
    { name: 'Barbeque',        code: 'CAT-003', description: 'Tandoori tikkas and leg pieces',         sort_order: 3  },
    { name: 'Rolls & Wrap',    code: 'CAT-004', description: 'Wraps and rolls with various fillings',  sort_order: 4  },
    { name: 'Mutton Kabab',    code: 'CAT-005', description: 'Mutton seekh, shami and specialty kebabs', sort_order: 5 },
    { name: 'Chicken Kabab',   code: 'CAT-006', description: 'Chicken seekh and malai kebabs',         sort_order: 6  },
    { name: 'Mehfil-E-Mandi',  code: 'CAT-007', description: 'Special whole leg mandi platters',       sort_order: 7  },
    { name: 'Chinese',         code: 'CAT-008', description: 'Chinese soups and dishes',               sort_order: 8  },
    { name: 'Rice',            code: 'CAT-009', description: 'Fried rice and specialty rice dishes',   sort_order: 9  },
    { name: 'Shan-E-Biryani',  code: 'CAT-010', description: 'Chicken and Mutton biryanis & pulaos',  sort_order: 10 },
    { name: 'Gravy Chicken',   code: 'CAT-011', description: 'Chicken gravies and curries',            sort_order: 11 },
    { name: 'Mutton',          code: 'CAT-012', description: 'Mutton gravies and curries',             sort_order: 12 },
    { name: 'Bread & Roti',    code: 'CAT-013', description: 'Rotis, naans, parathas and kulchas',    sort_order: 13 },
    { name: 'Veg',             code: 'CAT-014', description: 'Vegetarian curries and dal',             sort_order: 14 },
    { name: 'Dessert',         code: 'CAT-015', description: 'Sweet dishes and desserts',              sort_order: 15 },
    { name: 'Platters',        code: 'CAT-016', description: 'Sharing platters for groups',            sort_order: 16 },
  ];

  for (const catData of categories) {
    const existing = await categoryRepo.findOne({ where: { code: catData.code }, withDeleted: true });

    if (existing) {
      // Update name/description in case they changed but keep the record
      existing.deleted_at = null;
      existing.deleted_by = null;
      existing.name        = catData.name;
      existing.description = catData.description;
      existing.sort_order  = catData.sort_order;
      await categoryRepo.save(existing);
      console.log(`🔄 Category updated: ${catData.name}`);
    } else {
      const category = categoryRepo.create({ ...catData, is_active: true });
      await categoryRepo.save(category);
      console.log(`✅ Category seeded: ${catData.name}`);
    }
  }
}
