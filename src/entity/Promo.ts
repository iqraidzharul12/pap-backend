import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { ProgramType, TestLab } from ".";

@Entity()
export class Promo {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  count: number;

  @Column()
  @IsNotEmpty()
  price: number;

  @ManyToOne(() => ProgramType, (programType) => programType.promos)
  programType: ProgramType;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
