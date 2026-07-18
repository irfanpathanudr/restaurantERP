import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDiscountAndMixedPayment1784000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add discount type to orders table
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'discount_type',
        type: 'enum',
        enum: ['percentage', 'fixed'],
        default: "'fixed'",
        isNullable: true,
      })
    );

    // Add discount reason/notes
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'discount_reason',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );

    // Add cashier confirmation timestamp
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'cashier_confirmed_at',
        type: 'timestamp',
        isNullable: true,
      })
    );

    // Add locked status - prevents editing after cashier confirms
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'is_locked',
        type: 'boolean',
        default: false,
      })
    );

    // Modify payments table to support split payments
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'payment_mode',
        type: 'enum',
        enum: ['cash', 'online', 'card'],
        default: "'cash'",
      })
    );

    // Add split payment indicator
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'is_split_payment',
        type: 'boolean',
        default: false,
      })
    );

    // Add payment sequence for split payments
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'payment_sequence',
        type: 'int',
        default: 1,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'discount_type');
    await queryRunner.dropColumn('orders', 'discount_reason');
    await queryRunner.dropColumn('orders', 'cashier_confirmed_at');
    await queryRunner.dropColumn('orders', 'is_locked');
    await queryRunner.dropColumn('payments', 'payment_mode');
    await queryRunner.dropColumn('payments', 'is_split_payment');
    await queryRunner.dropColumn('payments', 'payment_sequence');
  }
}
