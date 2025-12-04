import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('cars')
@Index(['normalizedMake', 'normalizedModel'])
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  normalizedMake: string;

  @Column()
  normalizedModel: string;

  @Column()
  year: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
