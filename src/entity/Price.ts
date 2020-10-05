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
export class Price {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  count: number;

  @Column()
  @IsNotEmpty()
  price: number;

  @Column()
  @IsNotEmpty()
  status: number;

  @ManyToOne(() => ProgramType, (programType) => programType.prices)
  programType: ProgramType;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
