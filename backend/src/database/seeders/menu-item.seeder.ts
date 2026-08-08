import { DataSource } from 'typeorm';
import { MenuItem, FoodType, SpicyLevel, PortionSize } from '../entities/MenuItem.entity';
import { Category } from '../entities/Category.entity';

interface MenuItemSeed {
  name: string;
  sku: string;
  categoryCode: string;
  priceHalf: number | null;
  priceFull: number;
  foodType: FoodType;
  spicyLevel?: SpicyLevel;
  description?: string;
}

// ---------------------------------------------------------------------------
// Udaipur Zayka — full menu data from CSV
// Half price stored as a variant in the variants JSON field.
// priceFull is the base selling price; priceHalf (when present) becomes a
// variant entry so POS can select portion size.
// ---------------------------------------------------------------------------
const MENU_ITEMS: MenuItemSeed[] = [
  // ── STARTERS ──────────────────────────────────────────────────────────────
  { name: 'Chicken Dana Fry',                       sku: 'STR-001', categoryCode: 'CAT-001', priceHalf: 200,  priceFull: 400, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Chicken 65',                             sku: 'STR-002', categoryCode: 'CAT-001', priceHalf: 200,  priceFull: 400, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Crispy Chicken',                         sku: 'STR-003', categoryCode: 'CAT-001', priceHalf: null, priceFull: 280, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MILD },
  { name: 'Chilly Chicken Dry/Gravy',               sku: 'STR-004', categoryCode: 'CAT-001', priceHalf: 200,  priceFull: 300, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Chicken Lolipop Dry (4 Pcs.)',           sku: 'STR-005', categoryCode: 'CAT-001', priceHalf: null, priceFull: 260, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Chicken Lolipop Gravy (4 Pcs.)',         sku: 'STR-006', categoryCode: 'CAT-001', priceHalf: null, priceFull: 280, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Prons Chilly',                           sku: 'STR-007', categoryCode: 'CAT-001', priceHalf: null, priceFull: 320, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Chilly Mutton',                          sku: 'STR-008', categoryCode: 'CAT-001', priceHalf: null, priceFull: 300, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Mutton 65',                              sku: 'STR-009', categoryCode: 'CAT-001', priceHalf: null, priceFull: 400, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Afghami Chicken Fry (Zayka Special)',    sku: 'STR-010', categoryCode: 'CAT-001', priceHalf: 300,  priceFull: 600, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MEDIUM, description: 'Zayka Special' },
  { name: 'Chicken Schezwan',                       sku: 'STR-011', categoryCode: 'CAT-001', priceHalf: null, priceFull: 200, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Chicken Silly Boti (2 Pcs.)',            sku: 'STR-012', categoryCode: 'CAT-001', priceHalf: null, priceFull: 160, foodType: FoodType.NON_VEG },
  { name: 'Chicken Stickas (2 Pcs.)',               sku: 'STR-013', categoryCode: 'CAT-001', priceHalf: null, priceFull: 140, foodType: FoodType.NON_VEG },

  // ── ROSTED ────────────────────────────────────────────────────────────────
  { name: 'Full Tandoori Chicken (Red Tandoori)',   sku: 'RST-001', categoryCode: 'CAT-002', priceHalf: 220,  priceFull: 400, foodType: FoodType.NON_VEG },
  { name: 'Pathani Tandoori Chicken',               sku: 'RST-002', categoryCode: 'CAT-002', priceHalf: 240,  priceFull: 440, foodType: FoodType.NON_VEG },
  { name: 'Hariyali Tandoori',                      sku: 'RST-003', categoryCode: 'CAT-002', priceHalf: 240,  priceFull: 440, foodType: FoodType.NON_VEG },
  { name: 'Afghani Tandoori',                       sku: 'RST-004', categoryCode: 'CAT-002', priceHalf: 280,  priceFull: 480, foodType: FoodType.NON_VEG, description: 'Marinated in Cream & Cashew' },
  { name: 'Alfaam Smoky Tandoori',                  sku: 'RST-005', categoryCode: 'CAT-002', priceHalf: null, priceFull: 550, foodType: FoodType.NON_VEG, description: 'Served with Sizzler' },
  { name: 'Zayka Special Tandoori',                 sku: 'RST-006', categoryCode: 'CAT-002', priceHalf: null, priceFull: 550, foodType: FoodType.NON_VEG, description: 'Zayka Special' },

  // ── BARBEQUE ──────────────────────────────────────────────────────────────
  { name: 'Chicken Tandoori Tikka (6 Pcs.)',        sku: 'BBQ-001', categoryCode: 'CAT-003', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },
  { name: 'Chicken Pathani Tikka (6 Pcs.)',         sku: 'BBQ-002', categoryCode: 'CAT-003', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },
  { name: 'Peshawari Tikka Mild Salted',            sku: 'BBQ-003', categoryCode: 'CAT-003', priceHalf: null, priceFull: 200, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MILD },
  { name: 'Malai Tikka',                            sku: 'BBQ-004', categoryCode: 'CAT-003', priceHalf: null, priceFull: 220, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.NONE },
  { name: 'Mast Malang Tikka',                      sku: 'BBQ-005', categoryCode: 'CAT-003', priceHalf: null, priceFull: 240, foodType: FoodType.NON_VEG },
  { name: 'Pineapple Malai Botiya (8 Pcs.) Zayka Special', sku: 'BBQ-006', categoryCode: 'CAT-003', priceHalf: null, priceFull: 400, foodType: FoodType.NON_VEG, description: 'Zayka Special' },
  { name: 'Persian Tikka Boti (8 Pcs.)',            sku: 'BBQ-007', categoryCode: 'CAT-003', priceHalf: null, priceFull: 220, foodType: FoodType.NON_VEG },
  { name: 'Anarkali Tikka (Sweet and Spicy)',       sku: 'BBQ-008', categoryCode: 'CAT-003', priceHalf: null, priceFull: 280, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Zayka Special Golden Tikka',             sku: 'BBQ-009', categoryCode: 'CAT-003', priceHalf: null, priceFull: 300, foodType: FoodType.NON_VEG, description: 'Zayka Special' },
  { name: 'Winter Leg Piece',                       sku: 'BBQ-010', categoryCode: 'CAT-003', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },
  { name: 'Peshawari Leg Piece',                    sku: 'BBQ-011', categoryCode: 'CAT-003', priceHalf: null, priceFull: 140, foodType: FoodType.NON_VEG },
  { name: 'Royal Silver Leg',                       sku: 'BBQ-012', categoryCode: 'CAT-003', priceHalf: null, priceFull: 160, foodType: FoodType.NON_VEG },
  { name: 'Rara Nizami Thigh Leg',                  sku: 'BBQ-013', categoryCode: 'CAT-003', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },
  { name: 'Lahori Tangdi',                          sku: 'BBQ-014', categoryCode: 'CAT-003', priceHalf: null, priceFull: 160, foodType: FoodType.NON_VEG },

  // ── ROLLS & WRAP ──────────────────────────────────────────────────────────
  { name: 'Mutton Seekh Roll',                      sku: 'ROL-001', categoryCode: 'CAT-004', priceHalf: null, priceFull: 220, foodType: FoodType.NON_VEG },
  { name: 'Kabuli Roll',                            sku: 'ROL-002', categoryCode: 'CAT-004', priceHalf: null, priceFull: 220, foodType: FoodType.NON_VEG },
  { name: 'Chicken Seekh Roll',                     sku: 'ROL-003', categoryCode: 'CAT-004', priceHalf: null, priceFull: 160, foodType: FoodType.NON_VEG },
  { name: 'Chicken Tikka Roll',                     sku: 'ROL-004', categoryCode: 'CAT-004', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },
  { name: 'Chicken Cheese Roll',                    sku: 'ROL-005', categoryCode: 'CAT-004', priceHalf: null, priceFull: 220, foodType: FoodType.NON_VEG },
  { name: 'Chicken Roll',                           sku: 'ROL-006', categoryCode: 'CAT-004', priceHalf: null, priceFull: 160, foodType: FoodType.NON_VEG },
  { name: 'Chicken Shawarma Roll',                  sku: 'ROL-007', categoryCode: 'CAT-004', priceHalf: null, priceFull: 120, foodType: FoodType.NON_VEG },
  { name: 'Chicken Peri Peri Roll',                 sku: 'ROL-008', categoryCode: 'CAT-004', priceHalf: null, priceFull: 140, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },

  // ── MUTTON KABAB ──────────────────────────────────────────────────────────
  { name: 'Mutton Seekh Kebab',                     sku: 'MKB-001', categoryCode: 'CAT-005', priceHalf: null, priceFull: 140, foodType: FoodType.NON_VEG },
  { name: 'Mutton Seekh Malai',                     sku: 'MKB-002', categoryCode: 'CAT-005', priceHalf: null, priceFull: 200, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.NONE },
  { name: 'Mutton Shami Kebab',                     sku: 'MKB-003', categoryCode: 'CAT-005', priceHalf: null, priceFull: 160, foodType: FoodType.NON_VEG },
  { name: 'Gilafi Kebab',                           sku: 'MKB-004', categoryCode: 'CAT-005', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },
  { name: 'Lucknow Tunde Kebab',                    sku: 'MKB-005', categoryCode: 'CAT-005', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },
  { name: 'Tunde Pashtooni Kebab',                  sku: 'MKB-006', categoryCode: 'CAT-005', priceHalf: null, priceFull: 220, foodType: FoodType.NON_VEG },
  { name: 'Mutton Kabuli Tikka Kebab',              sku: 'MKB-007', categoryCode: 'CAT-005', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },
  { name: 'Mutton Dry Chaap',                       sku: 'MKB-008', categoryCode: 'CAT-005', priceHalf: null, priceFull: 160, foodType: FoodType.NON_VEG },
  { name: 'Mutton Roasted Gravy Chop',              sku: 'MKB-009', categoryCode: 'CAT-005', priceHalf: null, priceFull: 200, foodType: FoodType.NON_VEG },
  { name: 'Mutton Portilla Kebab',                  sku: 'MKB-010', categoryCode: 'CAT-005', priceHalf: null, priceFull: 260, foodType: FoodType.NON_VEG },
  { name: 'Mutton Chapli Kebab',                    sku: 'MKB-011', categoryCode: 'CAT-005', priceHalf: null, priceFull: 160, foodType: FoodType.NON_VEG },
  { name: 'Mutton Afghan Kofta',                    sku: 'MKB-012', categoryCode: 'CAT-005', priceHalf: null, priceFull: 300, foodType: FoodType.NON_VEG },
  { name: 'Kashmiri Rishta',                        sku: 'MKB-013', categoryCode: 'CAT-005', priceHalf: null, priceFull: 300, foodType: FoodType.NON_VEG },

  // ── CHICKEN KABAB ─────────────────────────────────────────────────────────
  { name: 'Chicken Seekh Kebab',                    sku: 'CKB-001', categoryCode: 'CAT-006', priceHalf: null, priceFull: 100, foodType: FoodType.NON_VEG },
  { name: 'Chicken Malai Seekh Kebab',              sku: 'CKB-002', categoryCode: 'CAT-006', priceHalf: null, priceFull: 160, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.NONE },
  { name: 'Chicken Special Seekh Kebab',            sku: 'CKB-003', categoryCode: 'CAT-006', priceHalf: null, priceFull: 200, foodType: FoodType.NON_VEG },
  { name: 'Chicken Potli Seekh Kebab',              sku: 'CKB-004', categoryCode: 'CAT-006', priceHalf: null, priceFull: 240, foodType: FoodType.NON_VEG },
  { name: 'Kulfi Drum Stick (4 Pcs.)',              sku: 'CKB-005', categoryCode: 'CAT-006', priceHalf: null, priceFull: 240, foodType: FoodType.NON_VEG },

  // ── MEHFIL-E-MANDI ────────────────────────────────────────────────────────
  { name: 'Mutton Shahi Ran',                       sku: 'MND-001', categoryCode: 'CAT-007', priceHalf: null, priceFull: 1999, foodType: FoodType.NON_VEG, description: 'Served with Yellow Rice and White Gravy' },
  { name: 'Peshawari Ran',                          sku: 'MND-002', categoryCode: 'CAT-007', priceHalf: null, priceFull: 1999, foodType: FoodType.NON_VEG, description: 'Golden Gravy, White Rice' },
  { name: 'Arebian Mandi',                          sku: 'MND-003', categoryCode: 'CAT-007', priceHalf: null, priceFull: 2499, foodType: FoodType.NON_VEG, description: 'Red Rice, Red Bell Pepper served' },
  { name: 'Winter Ran',                             sku: 'MND-004', categoryCode: 'CAT-007', priceHalf: null, priceFull: 2199, foodType: FoodType.NON_VEG, description: 'Served with White Gravy and Foil' },

  // ── CHINESE ───────────────────────────────────────────────────────────────
  { name: 'Chicken Hot n Sour Soup',                sku: 'CHN-001', categoryCode: 'CAT-008', priceHalf: null, priceFull: 100, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Chicken Manchow Soup',                   sku: 'CHN-002', categoryCode: 'CAT-008', priceHalf: null, priceFull: 100, foodType: FoodType.NON_VEG },
  { name: 'Chicken Garlic Tango Soup',              sku: 'CHN-003', categoryCode: 'CAT-008', priceHalf: null, priceFull: 140, foodType: FoodType.NON_VEG },
  { name: 'Mutton Paya Soup',                       sku: 'CHN-004', categoryCode: 'CAT-008', priceHalf: null, priceFull: 100, foodType: FoodType.NON_VEG },
  { name: 'Mutton Kali Mirch Soup',                 sku: 'CHN-005', categoryCode: 'CAT-008', priceHalf: null, priceFull: 150, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Lemon Tea Soup',                         sku: 'CHN-006', categoryCode: 'CAT-008', priceHalf: null, priceFull: 100, foodType: FoodType.VEG },
  { name: 'Clear Soup',                             sku: 'CHN-007', categoryCode: 'CAT-008', priceHalf: null, priceFull: 150, foodType: FoodType.VEG },

  // ── RICE ──────────────────────────────────────────────────────────────────
  { name: 'Chicken Fried Rice',                     sku: 'RCE-001', categoryCode: 'CAT-009', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },
  { name: 'Chicken Schezwan Rice',                  sku: 'RCE-002', categoryCode: 'CAT-009', priceHalf: null, priceFull: 200, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Chicken Chilli Garlic Rice',             sku: 'RCE-003', categoryCode: 'CAT-009', priceHalf: null, priceFull: 240, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Tripal Rice',                            sku: 'RCE-004', categoryCode: 'CAT-009', priceHalf: null, priceFull: 240, foodType: FoodType.NON_VEG },
  { name: 'Chauple Rice',                           sku: 'RCE-005', categoryCode: 'CAT-009', priceHalf: null, priceFull: 300, foodType: FoodType.NON_VEG },
  { name: 'Chicken Manchurian Rice',                sku: 'RCE-006', categoryCode: 'CAT-009', priceHalf: null, priceFull: 240, foodType: FoodType.NON_VEG },
  { name: 'Chicken Hungama Rice',                   sku: 'RCE-007', categoryCode: 'CAT-009', priceHalf: null, priceFull: 200, foodType: FoodType.NON_VEG },
  { name: 'Chicken Singapore Rice',                 sku: 'RCE-008', categoryCode: 'CAT-009', priceHalf: null, priceFull: 200, foodType: FoodType.NON_VEG },
  { name: 'Egg Rice',                               sku: 'RCE-009', categoryCode: 'CAT-009', priceHalf: null, priceFull: 150, foodType: FoodType.EGG },
  { name: 'Veg Rice',                               sku: 'RCE-010', categoryCode: 'CAT-009', priceHalf: null, priceFull: 150, foodType: FoodType.VEG },
  { name: 'Zeera Rice',                             sku: 'RCE-011', categoryCode: 'CAT-009', priceHalf: null, priceFull: 120, foodType: FoodType.VEG },
  { name: 'Plain Rice',                             sku: 'RCE-012', categoryCode: 'CAT-009', priceHalf: null, priceFull: 100, foodType: FoodType.VEG },
  { name: 'Keema Khichdi',                          sku: 'RCE-013', categoryCode: 'CAT-009', priceHalf: null, priceFull: 180, foodType: FoodType.NON_VEG },

  // ── SHAN-E-BIRYANI ────────────────────────────────────────────────────────
  { name: 'Chicken Dum Biryani',                    sku: 'BRY-001', categoryCode: 'CAT-010', priceHalf: 180,  priceFull: 300, foodType: FoodType.NON_VEG },
  { name: 'Chicken Tawa Biryani',                   sku: 'BRY-002', categoryCode: 'CAT-010', priceHalf: 200,  priceFull: 300, foodType: FoodType.NON_VEG },
  { name: 'Chicken Biryani Zayka Special',          sku: 'BRY-003', categoryCode: 'CAT-010', priceHalf: 250,  priceFull: 380, foodType: FoodType.NON_VEG, description: 'Zayka Special' },
  { name: 'Chicken Pulao',                          sku: 'BRY-004', categoryCode: 'CAT-010', priceHalf: 120,  priceFull: 240, foodType: FoodType.NON_VEG },
  { name: 'Mutton Biryani',                         sku: 'BRY-005', categoryCode: 'CAT-010', priceHalf: 250,  priceFull: 400, foodType: FoodType.NON_VEG },
  { name: 'Mutton Kabuli Pulao',                    sku: 'BRY-006', categoryCode: 'CAT-010', priceHalf: null, priceFull: 300, foodType: FoodType.NON_VEG },
  { name: 'Mutton Afghani Pulao',                   sku: 'BRY-007', categoryCode: 'CAT-010', priceHalf: null, priceFull: 400, foodType: FoodType.NON_VEG },

  // ── GRAVY CHICKEN ─────────────────────────────────────────────────────────
  { name: 'Chicken Korma (Desi Style)',             sku: 'GCK-001', categoryCode: 'CAT-011', priceHalf: 200,  priceFull: 400, foodType: FoodType.NON_VEG, description: 'Desi Style in Rassa Soup' },
  { name: 'Chicken Masala',                         sku: 'GCK-002', categoryCode: 'CAT-011', priceHalf: 220,  priceFull: 420, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Chicken Handi',                          sku: 'GCK-003', categoryCode: 'CAT-011', priceHalf: 240,  priceFull: 480, foodType: FoodType.NON_VEG, description: 'Prepared in Mud Handi' },
  { name: 'Kadhai Chicken',                         sku: 'GCK-004', categoryCode: 'CAT-011', priceHalf: 300,  priceFull: 550, foodType: FoodType.NON_VEG, description: 'Prepared with Capsicum, Onion, Chaup Cutting' },
  { name: 'Butter Chicken',                         sku: 'GCK-005', categoryCode: 'CAT-011', priceHalf: 280,  priceFull: 500, foodType: FoodType.NON_VEG, description: 'Signature Dish of Restro', spicyLevel: SpicyLevel.MILD },
  { name: 'Chicken Angara',                         sku: 'GCK-006', categoryCode: 'CAT-011', priceHalf: 280,  priceFull: 500, foodType: FoodType.NON_VEG, description: 'Extra Spicy, Served with Sizzler', spicyLevel: SpicyLevel.EXTRA_HOT },
  { name: 'Chicken Cheese Butter Masala',           sku: 'GCK-007', categoryCode: 'CAT-011', priceHalf: 350,  priceFull: 600, foodType: FoodType.NON_VEG, description: 'Boneless with Cheese Crush Texture' },
  { name: 'Afghani Chicken',                        sku: 'GCK-008', categoryCode: 'CAT-011', priceHalf: 300,  priceFull: 580, foodType: FoodType.NON_VEG, description: 'Prepared with Cashew Cream and White Pepper', spicyLevel: SpicyLevel.NONE },
  { name: 'Chicken Stew',                           sku: 'GCK-009', categoryCode: 'CAT-011', priceHalf: 250,  priceFull: 400, foodType: FoodType.NON_VEG, description: 'Prepared with Green Chilly and Mint' },
  { name: 'Chicken Barra',                          sku: 'GCK-010', categoryCode: 'CAT-011', priceHalf: 300,  priceFull: 600, foodType: FoodType.NON_VEG, description: 'Creamy Mild Tender Flavour', spicyLevel: SpicyLevel.MILD },
  { name: 'Chicken Pathani',                        sku: 'GCK-011', categoryCode: 'CAT-011', priceHalf: 280,  priceFull: 400, foodType: FoodType.NON_VEG },
  { name: 'Chicken Murgh Mussalam',                 sku: 'GCK-012', categoryCode: 'CAT-011', priceHalf: null, priceFull: 800, foodType: FoodType.NON_VEG },
  { name: 'Shahi Chicken Kofta Gravy',              sku: 'GCK-013', categoryCode: 'CAT-011', priceHalf: 280,  priceFull: 500, foodType: FoodType.NON_VEG },
  { name: 'Chicken Keema Rara',                     sku: 'GCK-014', categoryCode: 'CAT-011', priceHalf: 280,  priceFull: 480, foodType: FoodType.NON_VEG },
  { name: 'Chicken Seekh Gravy',                    sku: 'GCK-015', categoryCode: 'CAT-011', priceHalf: 300,  priceFull: 480, foodType: FoodType.NON_VEG },
  { name: 'Chicken Changezi',                       sku: 'GCK-016', categoryCode: 'CAT-011', priceHalf: 250,  priceFull: 500, foodType: FoodType.NON_VEG },
  { name: 'Egg Curry',                              sku: 'GCK-017', categoryCode: 'CAT-011', priceHalf: null, priceFull: 180, foodType: FoodType.EGG },

  // ── MUTTON ────────────────────────────────────────────────────────────────
  { name: 'Mutton Korma',                           sku: 'MTN-001', categoryCode: 'CAT-012', priceHalf: 350,  priceFull: 650, foodType: FoodType.NON_VEG },
  { name: 'Mutton Masala',                          sku: 'MTN-002', categoryCode: 'CAT-012', priceHalf: 350,  priceFull: 700, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Mutton Handi',                           sku: 'MTN-003', categoryCode: 'CAT-012', priceHalf: 350,  priceFull: 700, foodType: FoodType.NON_VEG },
  { name: 'Mutton Stew',                            sku: 'MTN-004', categoryCode: 'CAT-012', priceHalf: 350,  priceFull: 700, foodType: FoodType.NON_VEG },
  { name: 'Laal Maas (Authentic Rajwadi)',          sku: 'MTN-005', categoryCode: 'CAT-012', priceHalf: 500,  priceFull: 850, foodType: FoodType.NON_VEG, description: 'Authentic Rajwadi recipe', spicyLevel: SpicyLevel.EXTRA_HOT },
  { name: 'Mutton Rogan Josh',                      sku: 'MTN-006', categoryCode: 'CAT-012', priceHalf: 400,  priceFull: 800, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Mutton Kali Mirch',                      sku: 'MTN-007', categoryCode: 'CAT-012', priceHalf: 400,  priceFull: 800, foodType: FoodType.NON_VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Nalli Nihari',                           sku: 'MTN-008', categoryCode: 'CAT-012', priceHalf: 300,  priceFull: 500, foodType: FoodType.NON_VEG },
  { name: 'Keema Kaleji',                           sku: 'MTN-009', categoryCode: 'CAT-012', priceHalf: 250,  priceFull: 500, foodType: FoodType.NON_VEG },
  { name: 'Mutton Paya (On Special Day)',           sku: 'MTN-010', categoryCode: 'CAT-012', priceHalf: null, priceFull: 300, foodType: FoodType.NON_VEG, description: 'Available on special days only' },

  // ── BREAD & ROTI ──────────────────────────────────────────────────────────
  { name: 'Chapati',                                sku: 'BRD-001', categoryCode: 'CAT-013', priceHalf: null, priceFull: 15,  foodType: FoodType.VEG },
  { name: 'Butter Chapati',                         sku: 'BRD-002', categoryCode: 'CAT-013', priceHalf: null, priceFull: 18,  foodType: FoodType.VEG },
  { name: 'Rumali Roti',                            sku: 'BRD-003', categoryCode: 'CAT-013', priceHalf: null, priceFull: 25,  foodType: FoodType.VEG },
  { name: 'Khameeri Roti',                          sku: 'BRD-004', categoryCode: 'CAT-013', priceHalf: null, priceFull: 25,  foodType: FoodType.VEG },
  { name: 'Naan Butter',                            sku: 'BRD-005', categoryCode: 'CAT-013', priceHalf: null, priceFull: 80,  foodType: FoodType.VEG },
  { name: 'Cheese Naan',                            sku: 'BRD-006', categoryCode: 'CAT-013', priceHalf: null, priceFull: 120, foodType: FoodType.VEG },
  { name: 'Garlic Naan',                            sku: 'BRD-007', categoryCode: 'CAT-013', priceHalf: null, priceFull: 100, foodType: FoodType.VEG },
  { name: 'Lachha Paratha Plain',                   sku: 'BRD-008', categoryCode: 'CAT-013', priceHalf: null, priceFull: 40,  foodType: FoodType.VEG },
  { name: 'Lachha Paratha Butter',                  sku: 'BRD-009', categoryCode: 'CAT-013', priceHalf: null, priceFull: 50,  foodType: FoodType.VEG },
  { name: 'Plain Kulcha',                           sku: 'BRD-010', categoryCode: 'CAT-013', priceHalf: null, priceFull: 40,  foodType: FoodType.VEG },
  { name: 'Butter Kulcha',                          sku: 'BRD-011', categoryCode: 'CAT-013', priceHalf: null, priceFull: 50,  foodType: FoodType.VEG },
  { name: 'Khabus',                                 sku: 'BRD-012', categoryCode: 'CAT-013', priceHalf: null, priceFull: 25,  foodType: FoodType.VEG },
  { name: 'Fry Irani Paratha',                      sku: 'BRD-013', categoryCode: 'CAT-013', priceHalf: null, priceFull: 50,  foodType: FoodType.VEG },

  // ── VEG ───────────────────────────────────────────────────────────────────
  { name: 'Paneer Butter Masala',                   sku: 'VEG-001', categoryCode: 'CAT-014', priceHalf: null, priceFull: 280, foodType: FoodType.VEG, spicyLevel: SpicyLevel.MILD },
  { name: 'Kadhai Paneer',                          sku: 'VEG-002', categoryCode: 'CAT-014', priceHalf: null, priceFull: 280, foodType: FoodType.VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Paneer Tikka Masala',                    sku: 'VEG-003', categoryCode: 'CAT-014', priceHalf: null, priceFull: 320, foodType: FoodType.VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Shahi Paneer',                           sku: 'VEG-004', categoryCode: 'CAT-014', priceHalf: null, priceFull: 300, foodType: FoodType.VEG, spicyLevel: SpicyLevel.NONE },
  { name: 'Paneer Jalfrezi',                        sku: 'VEG-005', categoryCode: 'CAT-014', priceHalf: null, priceFull: 300, foodType: FoodType.VEG, spicyLevel: SpicyLevel.HOT },
  { name: 'Sev Tamatar',                            sku: 'VEG-006', categoryCode: 'CAT-014', priceHalf: null, priceFull: 200, foodType: FoodType.VEG },
  { name: 'Pindi Chole',                            sku: 'VEG-007', categoryCode: 'CAT-014', priceHalf: null, priceFull: 200, foodType: FoodType.VEG, spicyLevel: SpicyLevel.MEDIUM },
  { name: 'Dal Tadka',                              sku: 'VEG-008', categoryCode: 'CAT-014', priceHalf: null, priceFull: 180, foodType: FoodType.VEG },
  { name: 'Mix Dal Fry',                            sku: 'VEG-009', categoryCode: 'CAT-014', priceHalf: null, priceFull: 180, foodType: FoodType.VEG },
  { name: 'Dal Makhani',                            sku: 'VEG-010', categoryCode: 'CAT-014', priceHalf: null, priceFull: 240, foodType: FoodType.VEG, spicyLevel: SpicyLevel.MILD },

  // ── DESSERT ───────────────────────────────────────────────────────────────
  { name: 'Sheer Khurma',                           sku: 'DST-001', categoryCode: 'CAT-015', priceHalf: null, priceFull: 150, foodType: FoodType.VEG },
  { name: 'Gajar Halwa',                            sku: 'DST-002', categoryCode: 'CAT-015', priceHalf: null, priceFull: 100, foodType: FoodType.VEG },
  { name: 'Gulab Jamun',                            sku: 'DST-003', categoryCode: 'CAT-015', priceHalf: null, priceFull: 80,  foodType: FoodType.VEG },
  { name: 'Rabri with Ice Cream',                   sku: 'DST-004', categoryCode: 'CAT-015', priceHalf: null, priceFull: 150, foodType: FoodType.VEG },

  // ── PLATTERS ──────────────────────────────────────────────────────────────
  { name: 'Tikka Platter (4 Persons)',              sku: 'PLT-001', categoryCode: 'CAT-016', priceHalf: null, priceFull: 1100, foodType: FoodType.NON_VEG, description: 'Chicken Tikka Red, Peshawari, Afghani (4 Pcs each), Seekh Kebab, Tandoori Leg Piece, Chicken Dana Fry' },
  { name: 'Mutton Platter (4 Persons)',             sku: 'PLT-002', categoryCode: 'CAT-016', priceHalf: null, priceFull: 1499, foodType: FoodType.NON_VEG, description: 'Mutton Seekh Kebab, Tunday Kebab, Tandoori Kebab, Mutton Chap, Kaabuli Tikka' },
  { name: 'Mix Thaal (8 Persons)',                  sku: 'PLT-003', categoryCode: 'CAT-016', priceHalf: null, priceFull: 2199, foodType: FoodType.NON_VEG, description: 'Chicken Soup, Chilly Chicken, Mutton Seekh, Rice, Whole Tandoor, Seekh, Fish/Mutton Tunday, Tikka, Gravy, Roti Combo' },
  { name: 'Thal In Chicken (4 Persons)',            sku: 'PLT-004', categoryCode: 'CAT-016', priceHalf: null, priceFull: 2299, foodType: FoodType.NON_VEG, description: '1 Full Tandoori Chicken, Malai Seekh, Tikka, Chicken Tunday, Soup, Afghani Fry, Butter Chicken, Korma, Roti, Biryani' },
];

// ---------------------------------------------------------------------------
// Helper: build a variants array when a half-price exists
// ---------------------------------------------------------------------------
function buildVariants(priceHalf: number | null, priceFull: number) {
  if (priceHalf === null) return null;
  return [
    { name: 'Half', price: priceHalf, portion_size: PortionSize.SMALL },
    { name: 'Full', price: priceFull, portion_size: PortionSize.LARGE },
  ];
}

export async function seedMenuItems(dataSource: DataSource): Promise<void> {
  const menuItemRepo = dataSource.getRepository(MenuItem);
  const categoryRepo = dataSource.getRepository(Category);

  // Load all categories keyed by code
  const allCategories = await categoryRepo.find();
  const categoryMap = new Map(allCategories.map((c) => [c.code, c]));

  if (allCategories.length === 0) {
    console.log('⚠️  No categories found — please seed categories first.');
    return;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of MENU_ITEMS) {
    const category = categoryMap.get(item.categoryCode);
    if (!category) {
      console.warn(`⚠️  Category not found for code: ${item.categoryCode} — skipping ${item.name}`);
      skipped++;
      continue;
    }

    const existing = await menuItemRepo.findOne({ where: { sku: item.sku }, withDeleted: true });

    const variants = buildVariants(item.priceHalf, item.priceFull);

    if (existing) {
      // Update fields that may have changed
      existing.name         = item.name;
      existing.category_id  = category.id;
      existing.price        = item.priceFull;
      existing.food_type    = item.foodType;
      existing.spicy_level  = item.spicyLevel ?? SpicyLevel.NONE;
      existing.description  = item.description ?? null;
      existing.variants     = variants;
      existing.is_available = true;
      existing.deleted_at   = null;
      existing.deleted_by   = null;
      await menuItemRepo.save(existing);
      console.log(`🔄 Updated: ${item.name}`);
      updated++;
    } else {
      const menuItem = menuItemRepo.create({
        name:          item.name,
        sku:           item.sku,
        category_id:   category.id,
        price:         item.priceFull,
        food_type:     item.foodType,
        spicy_level:   item.spicyLevel ?? SpicyLevel.NONE,
        portion_size:  item.priceHalf ? PortionSize.CUSTOM : PortionSize.MEDIUM,
        description:   item.description ?? null,
        variants,
        is_available:  true,
        is_active:     true,
        sort_order:    0,
        total_sold:    0,
      });
      await menuItemRepo.save(menuItem);
      console.log(`✅ Seeded: ${item.name}`);
      created++;
    }
  }

  console.log(`\n📊 Menu Items Summary — Created: ${created} | Updated: ${updated} | Skipped: ${skipped}`);
}
