import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * These columns are now included directly in the InitialSchema migration.
 * This migration is kept as a no-op so the migrations table stays consistent
 * when upgrading from an older schema version.
 */
export class AddDiscountAndMixedPayment1784000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add discount_type to orders if not already present
    const ordersColumns = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'discount_type'`
    );
    if (ordersColumns.length === 0) {
      await queryRunner.query(
        `ALTER TABLE \`orders\` ADD \`discount_type\` enum('percentage','fixed') NULL DEFAULT 'fixed'`
      );
      await queryRunner.query(
        `ALTER TABLE \`orders\` ADD \`discount_reason\` varchar(255) NULL`
      );
      await queryRunner.query(
        `ALTER TABLE \`orders\` ADD \`cashier_confirmed_at\` timestamp NULL`
      );
      await queryRunner.query(
        `ALTER TABLE \`orders\` ADD \`is_locked\` tinyint NOT NULL DEFAULT 0`
      );
    }

    // Add payment_mode to payments if not already present
    const paymentsColumns = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'payment_mode'`
    );
    if (paymentsColumns.length === 0) {
      await queryRunner.query(
        `ALTER TABLE \`payments\` ADD \`payment_mode\` enum('cash','online','card') NOT NULL DEFAULT 'cash'`
      );
      await queryRunner.query(
        `ALTER TABLE \`payments\` ADD \`is_split_payment\` tinyint NOT NULL DEFAULT 0`
      );
      await queryRunner.query(
        `ALTER TABLE \`payments\` ADD \`payment_sequence\` int NOT NULL DEFAULT 1`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN IF EXISTS \`discount_type\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN IF EXISTS \`discount_reason\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN IF EXISTS \`cashier_confirmed_at\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN IF EXISTS \`is_locked\``);
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN IF EXISTS \`payment_mode\``);
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN IF EXISTS \`is_split_payment\``);
    await queryRunner.query(`ALTER TABLE \`payments\` DROP COLUMN IF EXISTS \`payment_sequence\``);
  }
}
