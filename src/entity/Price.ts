import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Program, ProgramType } from ".";

@Entity()
export class Price {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ nullable: true })
  name: String;

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

  @OneToMany(
    () => Program,
    (program) => program.price
  )
  programs: Program[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
