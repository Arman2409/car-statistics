import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PriceDto } from '../dto/create-car.dto';

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

  @Column('json')
  price: PriceDto;

  @Column()
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
