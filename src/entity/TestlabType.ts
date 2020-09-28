import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { ProgramType, TestLab } from ".";

@Entity()
export class TestlabType {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  teraphyLine: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @ManyToOne((type) => ProgramType, (programType) => programType.testLabTypes)
  programType: ProgramType;

  @OneToMany((type) => TestLab, (testLab) => testLab.testLabType)
  testLabs: TestLab[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
