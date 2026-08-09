import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Tracks which seeders have been run so we can skip already-applied ones
 * and avoid duplicate data on repeated `npm run seed` calls.
 */
@Entity('seeder_logs')
export class SeederLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  /** Unique name of the seeder, e.g. "PermissionSeeder" */
  @Column({ type: 'varchar', length: 255, unique: true })
  seeder_name: string;

  /** ISO timestamp of when this seeder completed successfully */
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  run_at: Date;

  /** Optional notes or record counts written by the seeder */
  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
