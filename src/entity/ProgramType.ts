import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { DefaultSchedule, Program, Promo, TestLabType } from ".";

@Entity()
export class ProgramType {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @Column()
  @IsNotEmpty()
  description: string;

  @OneToMany((type) => TestLabType, (testLabType) => testLabType.programType)
  testLabTypes: TestLabType[];

  @OneToMany((type) => Program, (program) => program.programType)
  programs: Program[];

  @OneToMany((type) => Promo, (promo) => promo.programType)
  promos: Promo[];

  @OneToMany((type) => DefaultSchedule, (defaultSchedule) => defaultSchedule.programType)
  defaultSchedules: DefaultSchedule[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
