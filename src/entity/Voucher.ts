import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { TestLab } from ".";

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

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
