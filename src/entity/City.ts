import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne
} from "typeorm";
import { IsNotEmpty } from "class-validator";

@Entity()
export class City {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  code: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
