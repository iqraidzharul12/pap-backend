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
export class DefaultSchedule {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  time: string;

  @ManyToOne(() => ProgramType, (programType) => programType.defaultSchedules)
  programType: ProgramType;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
