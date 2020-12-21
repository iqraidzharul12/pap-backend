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
import { ProgramType, TestLab, Voucher } from ".";

@Entity()
export class TestLabType {
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
  description: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @ManyToOne((type) => ProgramType, (programType) => programType.testLabTypes)
  programType: ProgramType;

  @OneToMany((type) => TestLab, (testLab) => testLab.testLabType)
  testLabs: TestLab[];

  @OneToMany(() => Voucher, (voucher) => voucher.testLabType)
  vouchers: Voucher[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
