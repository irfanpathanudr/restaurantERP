import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePrintersTable1723190000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'printers',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'branch_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'printer_type',
            type: 'enum',
            enum: ['receipt', 'kitchen', 'bar', 'label'],
            default: "'receipt'",
          },
          {
            name: 'connection_type',
            type: 'enum',
            enum: ['network', 'usb', 'bluetooth'],
            default: "'network'",
          },
          {
            name: 'printer_status',
            type: 'enum',
            enum: ['online', 'offline', 'error'],
            default: "'offline'",
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'port',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'usb_path',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'bluetooth_address',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'model',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'manufacturer',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'paper_width',
            type: 'int',
            default: 80,
          },
          {
            name: 'number_of_copies',
            type: 'int',
            default: 1,
          },
          {
            name: 'auto_cut',
            type: 'boolean',
            default: true,
          },
          {
            name: 'open_cash_drawer',
            type: 'boolean',
            default: false,
          },
          {
            name: 'print_header',
            type: 'boolean',
            default: true,
          },
          {
            name: 'print_footer',
            type: 'boolean',
            default: true,
          },
          {
            name: 'header_text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'footer_text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'character_encoding',
            type: 'varchar',
            length: '20',
            default: "'utf-8'",
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'last_connected_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'config_json',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Add foreign key for branch
    await queryRunner.createForeignKey(
      'printers',
      new TableForeignKey({
        columnNames: ['branch_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'branches',
        onDelete: 'CASCADE',
      })
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_printers_branch_id ON printers(branch_id)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_printers_printer_type ON printers(printer_type)`
    );
    await queryRunner.query(
      `CREATE INDEX idx_printers_is_default ON printers(is_default)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('printers');
  }
}
