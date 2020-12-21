import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { TestLab, TestLabType } from ".";

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @IsNotEmpty()
  code: string;

  @Column()
  @IsNotEmpty()
  status: number;

  @OneToMany(() => TestLab, (testLab) => testLab.voucher)
  testLabs: TestLab[];

  @ManyToOne(() => TestLabType, (testLabType) => testLabType.vouchers)
  testLabType: TestLabType;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
